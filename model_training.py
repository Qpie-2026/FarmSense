from pathlib import Path
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error
from statsmodels.tsa.arima.model import ARIMA
from xgboost import XGBRegressor

warnings.filterwarnings("ignore")


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MASTER_DATA_PATH = DATA_DIR / "master_clean.csv"
XGB_MODEL_PATH = DATA_DIR / "xgb_models.pkl"
ARIMA_MODEL_PATH = DATA_DIR / "arima_models.pkl"
METRICS_PATH = DATA_DIR / "model_metrics.csv"

FORECAST_HORIZON = 7
MIN_ROWS_PER_MODEL = 60

XGB_FEATURES = [
    "modal_price",
    "lag_1d",
    "lag_3d",
    "lag_7d",
    "lag_14d",
    "lag_30d",
    "roll_mean_7d",
    "roll_std_7d",
    "roll_mean_14d",
    "roll_std_14d",
    "roll_mean_30d",
    "roll_std_30d",
    "pct_change_7d",
    "pct_change_30d",
    "month",
    "week_of_year",
    "day_of_week",
    "quarter",
    "year",
    "month_sin",
    "month_cos",
    "is_harvest_season",
    "price_spread",
    "spread_pct",
]

ARIMA_ORDERS = [
    (1, 1, 1),
    (2, 1, 1),
    (1, 1, 2),
    (2, 1, 2),
    (3, 1, 1),
    (1, 0, 1),
]

HARVEST_MONTHS = {
    "Tomato": [11, 12, 1, 2, 3],
    "Onion": [11, 12, 1, 2, 3, 4],
    "Potato": [1, 2, 3, 4],
    "Wheat": [3, 4, 5],
    "Dry Chillies": [12, 1, 2, 3],
}


def rmse_score(y_true, y_pred):
    return float(np.sqrt(mean_squared_error(y_true, y_pred)))


def mape_score(y_true, y_pred):
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    mask = y_true != 0
    if not np.any(mask):
        return np.nan
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def load_master_data():
    if not MASTER_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Training dataset not found at {MASTER_DATA_PATH}. "
            "Run data_pipeline.py first."
        )

    df = pd.read_csv(MASTER_DATA_PATH, parse_dates=["date"])
    df = df.sort_values(["commodity", "date"]).reset_index(drop=True)
    print(f"Loaded {len(df):,} rows from {MASTER_DATA_PATH}")
    return df


def evaluate_predictions(model_name, commodity, y_true, y_pred, extra=None):
    row = {
        "model": model_name,
        "commodity": commodity,
        "rows_tested": int(len(y_true)),
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": rmse_score(y_true, y_pred),
        "mape": mape_score(y_true, y_pred),
    }
    if extra:
        row.update(extra)
    return row


def train_xgboost_models(df):
    print("\nTraining XGBoost models")
    models = {}
    metrics = []

    for commodity in sorted(df["commodity"].dropna().unique()):
        series = build_daily_series(df, commodity)
        commodity_df = build_xgb_frame(series, commodity)
        commodity_df = commodity_df.dropna(subset=XGB_FEATURES + ["target_7d"])
        commodity_df = commodity_df.sort_values("date").reset_index(drop=True)

        if len(commodity_df) < MIN_ROWS_PER_MODEL:
            print(f"  Skipping {commodity}: only {len(commodity_df)} usable rows")
            continue

        split_idx = max(int(len(commodity_df) * 0.8), 1)
        if split_idx >= len(commodity_df):
            split_idx = len(commodity_df) - 1

        train_df = commodity_df.iloc[:split_idx]
        test_df = commodity_df.iloc[split_idx:]

        if test_df.empty:
            print(f"  Skipping {commodity}: no holdout rows after split")
            continue

        model = XGBRegressor(
            objective="reg:squarederror",
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
        )

        model.fit(train_df[XGB_FEATURES], train_df["target_7d"])
        predictions = model.predict(test_df[XGB_FEATURES])

        metric_row = evaluate_predictions(
            "XGBoost",
            commodity,
            test_df["target_7d"],
            predictions,
            extra={"features_used": ",".join(XGB_FEATURES)},
        )
        metrics.append(metric_row)
        models[commodity] = {
            "model": model,
            "features": XGB_FEATURES,
            "last_training_date": str(train_df["date"].max().date()),
        }

        print(
            f"  {commodity:<10} MAE={metric_row['mae']:.2f} "
            f"RMSE={metric_row['rmse']:.2f} "
            f"MAPE={metric_row['mape']:.2f}%"
        )

    if models:
        joblib.dump(models, XGB_MODEL_PATH)
        print(f"Saved XGBoost models to {XGB_MODEL_PATH}")
    else:
        print("No XGBoost models were trained.")

    return metrics


def build_daily_series(df, commodity):
    commodity_df = df[df["commodity"] == commodity].copy()
    series = (
        commodity_df.groupby("date")["modal_price"]
        .mean()
        .sort_index()
        .asfreq("D")
        .ffill()
    )
    return series


def build_xgb_frame(series, commodity):
    frame = series.rename("modal_price").reset_index()
    frame["min_price"] = frame["modal_price"]
    frame["max_price"] = frame["modal_price"]

    for lag in [1, 3, 7, 14, 30]:
        frame[f"lag_{lag}d"] = frame["modal_price"].shift(lag)

    for window in [7, 14, 30]:
        shifted = frame["modal_price"].shift(1)
        frame[f"roll_mean_{window}d"] = shifted.rolling(window, min_periods=1).mean()
        frame[f"roll_std_{window}d"] = shifted.rolling(window, min_periods=2).std()

    frame["pct_change_7d"] = frame["modal_price"].pct_change(7)
    frame["pct_change_30d"] = frame["modal_price"].pct_change(30)
    frame["price_spread"] = frame["max_price"] - frame["min_price"]
    frame["spread_pct"] = np.where(
        frame["modal_price"] != 0,
        frame["price_spread"] / frame["modal_price"],
        0,
    )

    frame["month"] = frame["date"].dt.month
    frame["week_of_year"] = frame["date"].dt.isocalendar().week.astype(int)
    frame["day_of_week"] = frame["date"].dt.dayofweek
    frame["quarter"] = frame["date"].dt.quarter
    frame["year"] = frame["date"].dt.year
    frame["month_sin"] = np.sin(2 * np.pi * frame["month"] / 12)
    frame["month_cos"] = np.cos(2 * np.pi * frame["month"] / 12)
    frame["is_harvest_season"] = frame["month"].isin(HARVEST_MONTHS.get(commodity, [])).astype(int)
    frame["target_7d"] = frame["modal_price"].shift(-FORECAST_HORIZON)

    return frame


def select_arima_order(train_series):
    best_order = None
    best_aic = np.inf

    for order in ARIMA_ORDERS:
        try:
            fitted = ARIMA(train_series, order=order).fit()
            if fitted.aic < best_aic:
                best_aic = fitted.aic
                best_order = order
        except Exception:
            continue

    return best_order or (1, 1, 1)


def train_arima_models(df):
    print("\nTraining ARIMA models")
    models = {}
    metrics = []

    for commodity in sorted(df["commodity"].dropna().unique()):
        series = build_daily_series(df, commodity)

        if len(series) < MIN_ROWS_PER_MODEL:
            print(f"  Skipping {commodity}: only {len(series)} daily points")
            continue

        split_idx = max(int(len(series) * 0.8), 1)
        if split_idx >= len(series):
            split_idx = len(series) - 1

        train_series = series.iloc[:split_idx]
        test_series = series.iloc[split_idx:]

        if test_series.empty:
            print(f"  Skipping {commodity}: no holdout window after split")
            continue

        order = select_arima_order(train_series)
        holdout_model = ARIMA(train_series, order=order).fit()
        predictions = holdout_model.forecast(steps=len(test_series))

        metric_row = evaluate_predictions(
            "ARIMA",
            commodity,
            test_series,
            predictions,
            extra={"order": str(order)},
        )
        metrics.append(metric_row)

        final_model = ARIMA(series, order=order).fit()
        models[commodity] = {
            "model": final_model,
            "order": order,
            "last_training_date": str(series.index.max().date()),
        }

        print(
            f"  {commodity:<10} order={order} "
            f"MAE={metric_row['mae']:.2f} "
            f"RMSE={metric_row['rmse']:.2f} "
            f"MAPE={metric_row['mape']:.2f}%"
        )

    if models:
        joblib.dump(models, ARIMA_MODEL_PATH)
        print(f"Saved ARIMA models to {ARIMA_MODEL_PATH}")
    else:
        print("No ARIMA models were trained.")

    return metrics


def save_metrics(metrics):
    metrics_df = pd.DataFrame(metrics)
    if metrics_df.empty:
        print("No metrics to save.")
        return metrics_df

    metrics_df = metrics_df.sort_values(["model", "commodity"]).reset_index(drop=True)
    metrics_df.to_csv(METRICS_PATH, index=False)
    print(f"\nSaved metrics to {METRICS_PATH}")
    print("\nModel comparison")
    print(metrics_df.to_string(index=False))
    return metrics_df


def main():
    df = load_master_data()
    xgb_metrics = train_xgboost_models(df)
    arima_metrics = train_arima_models(df)
    save_metrics(xgb_metrics + arima_metrics)


if __name__ == "__main__":
    main()
