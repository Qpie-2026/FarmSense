from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from statsmodels.tsa.statespace.sarimax import SARIMAX
import tensorflow as tf

try:
    from .feature_pipeline import (
        EXOGENOUS_COLUMNS,
        SeriesKey,
        build_feature_frame,
        build_future_exogenous_frame,
        load_clean_market_data,
        prepare_series_frame,
        select_benchmark_series,
    )
except ImportError:
    from feature_pipeline import (
        EXOGENOUS_COLUMNS,
        SeriesKey,
        build_feature_frame,
        build_future_exogenous_frame,
        load_clean_market_data,
        prepare_series_frame,
        select_benchmark_series,
    )


TARGET_COLUMN = "modal_price_rs_per_quintal"
MODEL_COLUMNS = [TARGET_COLUMN, *EXOGENOUS_COLUMNS]
ARIMA_ORDERS = [(1, 1, 1), (2, 1, 1), (1, 1, 2)]
SEASONAL_ORDER = (1, 0, 1, 7)


def build_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float]:
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    denominator = np.clip(np.abs(y_true), a_min=1.0, a_max=None)
    mape = np.mean(np.abs((y_true - y_pred) / denominator)) * 100
    return {
        "mae": round(float(mae), 2),
        "rmse": round(float(rmse), 2),
        "mape": round(float(mape), 2),
    }


def sanitize_frame(frame: pd.DataFrame) -> pd.DataFrame:
    cleaned = frame.copy()
    cleaned[EXOGENOUS_COLUMNS] = (
        cleaned[EXOGENOUS_COLUMNS]
        .replace([np.inf, -np.inf], np.nan)
        .ffill()
        .bfill()
    )
    cleaned[EXOGENOUS_COLUMNS] = cleaned[EXOGENOUS_COLUMNS].fillna(cleaned[EXOGENOUS_COLUMNS].median())
    return cleaned


def split_series(series_frame: pd.DataFrame, test_size: int) -> tuple[pd.DataFrame, pd.DataFrame]:
    if len(series_frame) <= test_size + 60:
        raise ValueError(
            f"Series only has {len(series_frame)} rows after preprocessing; need more room for train/test."
        )
    train = series_frame.iloc[:-test_size].reset_index(drop=True)
    test = series_frame.iloc[-test_size:].reset_index(drop=True)
    return train, test


def fit_sarimax(train_frame: pd.DataFrame, test_frame: pd.DataFrame) -> tuple[pd.DataFrame, tuple[int, int, int]]:
    train_exog = train_frame[EXOGENOUS_COLUMNS]
    test_exog = test_frame[EXOGENOUS_COLUMNS]
    best_model = None
    best_order = None
    best_aic = float("inf")

    for order in ARIMA_ORDERS:
        try:
            candidate = SARIMAX(
                train_frame[TARGET_COLUMN],
                exog=train_exog,
                order=order,
                seasonal_order=SEASONAL_ORDER,
                enforce_stationarity=False,
                enforce_invertibility=False,
            ).fit(disp=False)
        except Exception:
            continue

        if candidate.aic < best_aic:
            best_aic = candidate.aic
            best_model = candidate
            best_order = order

    if best_model is None or best_order is None:
        raise RuntimeError("SARIMAX could not fit any of the configured parameter sets.")

    predicted = best_model.get_forecast(steps=len(test_frame), exog=test_exog).predicted_mean
    return predicted.reset_index(drop=True), best_order


def train_lstm_model(train_frame: pd.DataFrame, lookback: int = 30, epochs: int = 24):
    target_scaler = MinMaxScaler()
    exog_scaler = StandardScaler()

    target_scaled = target_scaler.fit_transform(train_frame[[TARGET_COLUMN]])
    exog_scaled = exog_scaler.fit_transform(train_frame[EXOGENOUS_COLUMNS])
    train_matrix = np.concatenate([target_scaled, exog_scaled], axis=1)

    sequences = []
    targets = []
    for index in range(lookback, len(train_matrix)):
        sequences.append(train_matrix[index - lookback : index])
        targets.append(target_scaled[index, 0])

    X_train = np.asarray(sequences, dtype=np.float32)
    y_train = np.asarray(targets, dtype=np.float32)

    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(shape=(lookback, train_matrix.shape[1])),
            tf.keras.layers.LSTM(48, return_sequences=True),
            tf.keras.layers.Dropout(0.15),
            tf.keras.layers.LSTM(24),
            tf.keras.layers.Dense(16, activation="relu"),
            tf.keras.layers.Dense(1),
        ]
    )
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001), loss="mse")
    callback = tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)

    model.fit(
        X_train,
        y_train,
        epochs=epochs,
        batch_size=32,
        validation_split=0.15,
        verbose=0,
        callbacks=[callback],
    )
    return model, target_scaler, exog_scaler


def recursive_lstm_forecast(
    model,
    target_scaler: MinMaxScaler,
    exog_scaler: StandardScaler,
    history_frame: pd.DataFrame,
    future_exog_frame: pd.DataFrame,
    lookback: int = 30,
) -> pd.DataFrame:
    target_scaled = target_scaler.transform(history_frame[[TARGET_COLUMN]])
    exog_scaled = exog_scaler.transform(history_frame[EXOGENOUS_COLUMNS])
    window = np.concatenate([target_scaled, exog_scaled], axis=1)[-lookback:]
    predictions: list[float] = []

    for row in future_exog_frame.itertuples(index=False):
        predicted_scaled = float(model.predict(window[np.newaxis, ...], verbose=0)[0, 0])
        predicted_value = float(target_scaler.inverse_transform([[predicted_scaled]])[0, 0])
        predictions.append(predicted_value)

        exog_row = pd.DataFrame([{column: getattr(row, column) for column in EXOGENOUS_COLUMNS}])
        exog_row_scaled = exog_scaler.transform(exog_row)[0]
        next_row = np.concatenate([[predicted_scaled], exog_row_scaled])
        window = np.vstack([window[1:], next_row])

    return pd.DataFrame(
        {
            "price_date": future_exog_frame["price_date"].to_numpy(),
            "predicted_price": predictions,
        }
    )


def fit_full_sarimax(series_frame: pd.DataFrame, future_exog_frame: pd.DataFrame, order: tuple[int, int, int]) -> pd.DataFrame:
    model = SARIMAX(
        series_frame[TARGET_COLUMN],
        exog=series_frame[EXOGENOUS_COLUMNS],
        order=order,
        seasonal_order=SEASONAL_ORDER,
        enforce_stationarity=False,
        enforce_invertibility=False,
    ).fit(disp=False)

    future = model.get_forecast(steps=len(future_exog_frame), exog=future_exog_frame[EXOGENOUS_COLUMNS]).predicted_mean
    return pd.DataFrame(
        {
            "price_date": future_exog_frame["price_date"].to_numpy(),
            "predicted_price": future.to_numpy(),
        }
    )


def plot_benchmark(
    series_key: SeriesKey,
    series_frame: pd.DataFrame,
    test_frame: pd.DataFrame,
    sarimax_eval: pd.DataFrame,
    lstm_eval: pd.DataFrame,
    sarimax_future: pd.DataFrame,
    lstm_future: pd.DataFrame,
    output_path: Path,
) -> None:
    fig, ax = plt.subplots(figsize=(14, 6))
    recent_history = series_frame.tail(140)
    ax.plot(recent_history["price_date"], recent_history[TARGET_COLUMN], label="Observed", color="#1d4ed8", linewidth=2.2)
    ax.plot(test_frame["price_date"], sarimax_eval["predicted_price"], label="SARIMAX Holdout", color="#f59e0b", linewidth=2)
    ax.plot(test_frame["price_date"], lstm_eval["predicted_price"], label="LSTM Holdout", color="#16a34a", linewidth=2)
    ax.plot(sarimax_future["price_date"], sarimax_future["predicted_price"], label="SARIMAX Future", color="#f97316", linestyle="--", linewidth=2)
    ax.plot(lstm_future["price_date"], lstm_future["predicted_price"], label="LSTM Future", color="#22c55e", linestyle="--", linewidth=2)
    ax.axvspan(test_frame["price_date"].iloc[0], test_frame["price_date"].iloc[-1], color="#cbd5f5", alpha=0.16)
    ax.set_title(f"FarmSense Benchmark: {series_key.label()}")
    ax.set_xlabel("Date")
    ax.set_ylabel("Modal Price (Rs./quintal)")
    ax.legend()
    ax.grid(alpha=0.2)
    fig.tight_layout()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output_path, dpi=180)
    plt.close(fig)


def run_benchmark_for_series(
    series_key: SeriesKey,
    feature_frame: pd.DataFrame,
    test_size: int,
    future_horizon: int,
) -> dict[str, object]:
    series_frame = prepare_series_frame(
        feature_frame=feature_frame,
        commodity=series_key.commodity,
        market_name=series_key.market_name,
        state=series_key.state,
        min_history=max(test_size + 90, 180),
    )
    series_frame = sanitize_frame(series_frame)
    train_frame, test_frame = split_series(series_frame, test_size=test_size)
    naive_eval = pd.DataFrame(
        {
            "price_date": test_frame["price_date"],
            "actual_price": test_frame[TARGET_COLUMN],
            "predicted_price": np.repeat(train_frame[TARGET_COLUMN].iloc[-1], len(test_frame)),
        }
    )

    sarimax_predictions, best_order = fit_sarimax(train_frame, test_frame)
    sarimax_eval = pd.DataFrame(
        {
            "price_date": test_frame["price_date"],
            "actual_price": test_frame[TARGET_COLUMN],
            "predicted_price": sarimax_predictions,
        }
    )

    tf.keras.utils.set_random_seed(42)
    lstm_model, target_scaler, exog_scaler = train_lstm_model(train_frame)
    lstm_eval = recursive_lstm_forecast(
        model=lstm_model,
        target_scaler=target_scaler,
        exog_scaler=exog_scaler,
        history_frame=train_frame,
        future_exog_frame=test_frame[["price_date", *EXOGENOUS_COLUMNS]],
    )
    lstm_eval["actual_price"] = test_frame[TARGET_COLUMN].to_numpy()

    future_exog = build_future_exogenous_frame(series_frame, horizon_days=future_horizon)
    sarimax_future = fit_full_sarimax(series_frame, future_exog, order=best_order)

    full_lstm_model, full_target_scaler, full_exog_scaler = train_lstm_model(series_frame)
    lstm_future = recursive_lstm_forecast(
        model=full_lstm_model,
        target_scaler=full_target_scaler,
        exog_scaler=full_exog_scaler,
        history_frame=series_frame,
        future_exog_frame=future_exog,
    )

    return {
        "series": {
            "commodity": series_key.commodity,
            "market_name": series_key.market_name,
            "state": series_key.state,
            "history_days": series_key.history_days,
        },
        "sarimax": {
            "order": best_order,
            "metrics": build_metrics(
                sarimax_eval["actual_price"].to_numpy(),
                sarimax_eval["predicted_price"].to_numpy(),
            ),
            "holdout": sarimax_eval,
            "future": sarimax_future,
        },
        "naive": {
            "metrics": build_metrics(
                naive_eval["actual_price"].to_numpy(),
                naive_eval["predicted_price"].to_numpy(),
            ),
            "holdout": naive_eval,
        },
        "lstm": {
            "metrics": build_metrics(
                lstm_eval["actual_price"].to_numpy(),
                lstm_eval["predicted_price"].to_numpy(),
            ),
            "holdout": lstm_eval,
            "future": lstm_future,
        },
        "test_frame": test_frame,
        "series_frame": series_frame,
    }


def write_outputs(results: list[dict[str, object]], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    plots_dir = output_dir / "plots"
    plots_dir.mkdir(parents=True, exist_ok=True)

    metrics_rows = []
    summary_rows = []

    for result in results:
        series_meta = result["series"]
        series_key = SeriesKey(
            commodity=series_meta["commodity"],
            market_name=series_meta["market_name"],
            state=series_meta["state"],
            history_days=series_meta["history_days"],
        )
        slug = f"{series_key.commodity}_{series_key.market_name}_{series_key.state}".lower().replace(" ", "_").replace("/", "_")

        plot_benchmark(
            series_key=series_key,
            series_frame=result["series_frame"],
            test_frame=result["test_frame"],
            sarimax_eval=result["sarimax"]["holdout"],
            lstm_eval=result["lstm"]["holdout"],
            sarimax_future=result["sarimax"]["future"],
            lstm_future=result["lstm"]["future"],
            output_path=plots_dir / f"{slug}.png",
        )

        for model_name in ["naive", "sarimax", "lstm"]:
            metrics = result[model_name]["metrics"]
            metrics_rows.append(
                {
                    "commodity": series_key.commodity,
                    "market_name": series_key.market_name,
                    "state": series_key.state,
                    "model": model_name.upper(),
                    **metrics,
                }
            )

        summary_rows.append(
            {
                "series": series_key.label(),
                "naive": result["naive"]["metrics"],
                "sarimax": {
                    "order": result["sarimax"]["order"],
                    **result["sarimax"]["metrics"],
                    "future_peak_price": round(float(result["sarimax"]["future"]["predicted_price"].max()), 2),
                },
                "lstm": {
                    **result["lstm"]["metrics"],
                    "future_peak_price": round(float(result["lstm"]["future"]["predicted_price"].max()), 2),
                },
            }
        )

        result["sarimax"]["holdout"].to_csv(output_dir / f"{slug}_sarimax_holdout.csv", index=False)
        result["lstm"]["holdout"].to_csv(output_dir / f"{slug}_lstm_holdout.csv", index=False)
        result["sarimax"]["future"].to_csv(output_dir / f"{slug}_sarimax_future.csv", index=False)
        result["lstm"]["future"].to_csv(output_dir / f"{slug}_lstm_future.csv", index=False)

    pd.DataFrame(metrics_rows).to_csv(output_dir / "benchmark_metrics.csv", index=False)
    with (output_dir / "benchmark_summary.json").open("w", encoding="utf-8") as handle:
        json.dump(summary_rows, handle, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train SARIMAX and LSTM benchmarks for FarmSense.")
    parser.add_argument("--top-series", type=int, default=3, help="Number of diverse series to benchmark.")
    parser.add_argument("--min-history", type=int, default=365, help="Minimum history days required per series.")
    parser.add_argument("--test-size", type=int, default=30, help="Holdout window size in days.")
    parser.add_argument("--future-horizon", type=int, default=14, help="Future forecast horizon in days.")
    parser.add_argument("--commodity", help="Optional single-series commodity to benchmark.")
    parser.add_argument("--market", help="Optional single-series market name to benchmark.")
    parser.add_argument("--state", help="Optional single-series state to benchmark.")
    parser.add_argument(
        "--output-dir",
        default=str(Path("artifacts") / "benchmarks"),
        help="Directory to store metrics, CSVs, and plots.",
    )
    args = parser.parse_args()

    raw_frame = load_clean_market_data()
    feature_frame = sanitize_frame(build_feature_frame(raw_frame))

    if any([args.commodity, args.market, args.state]):
        if not all([args.commodity, args.market, args.state]):
            raise ValueError("Provide --commodity, --market, and --state together for a single-series run.")

        history_days = int(
            raw_frame[
                (raw_frame["commodity"] == args.commodity)
                & (raw_frame["market_name"] == args.market)
                & (raw_frame["state"] == args.state)
            ]["price_date"].nunique()
        )
        series_keys = [
            SeriesKey(
                commodity=args.commodity,
                market_name=args.market,
                state=args.state,
                history_days=history_days,
            )
        ]
    else:
        series_keys = select_benchmark_series(raw_frame=raw_frame, top_n=args.top_series, min_history=args.min_history)

    results = []
    for series_key in series_keys:
        print(f"Training benchmarks for {series_key.label()} ({series_key.history_days} days)")
        results.append(
            run_benchmark_for_series(
                series_key=series_key,
                feature_frame=feature_frame,
                test_size=args.test_size,
                future_horizon=args.future_horizon,
            )
        )

    write_outputs(results, output_dir=Path(args.output_dir))
    print(f"Benchmark artifacts written to {Path(args.output_dir).resolve()}")


if __name__ == "__main__":
    main()
