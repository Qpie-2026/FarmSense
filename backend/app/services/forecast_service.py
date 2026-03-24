import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


DATASET_PATH = (
    Path(__file__).resolve().parents[3]
    / "dataset"
    / "processed"
    / "farmsense_clean_dataset.csv"
)
DATASET_SUMMARY_PATH = (
    Path(__file__).resolve().parents[3]
    / "dataset"
    / "processed"
    / "farmsense_dataset_summary.json"
)
MIN_HISTORY_POINTS = 45
MAX_FORECAST_DAYS = 30


@dataclass(frozen=True)
class ForecastModel:
    intercept: float
    slope: float
    seasonal: dict[int, float]
    max_daily_change: float
    floor_price: float


@lru_cache(maxsize=1)
def get_dataset_summary() -> dict[str, Any]:
    if DATASET_SUMMARY_PATH.exists():
        with DATASET_SUMMARY_PATH.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    data = _load_daily_prices()
    return {
        "clean_dataset_rows": int(len(data)),
        "commodity_count": int(data["commodity"].nunique()),
        "market_count": int(data["market_name"].nunique()),
        "state_count": int(data["state"].nunique()),
        "date_range": {
            "start": data["price_date"].min().strftime("%Y-%m-%d"),
            "end": data["price_date"].max().strftime("%Y-%m-%d"),
        },
    }


@lru_cache(maxsize=1)
def _load_daily_prices() -> pd.DataFrame:
    usecols = [
        "state",
        "market_name",
        "commodity",
        "modal_price_rs_per_quintal",
        "price_date",
    ]
    frame = pd.read_csv(DATASET_PATH, usecols=usecols)
    frame = frame.rename(
        columns={"modal_price_rs_per_quintal": "modal_price_rs_per_quintal"}
    )
    frame["price_date"] = pd.to_datetime(frame["price_date"], errors="coerce")
    frame["commodity"] = frame["commodity"].astype(str).str.strip()
    frame["market_name"] = frame["market_name"].astype(str).str.strip()
    frame["state"] = frame["state"].astype(str).str.strip()
    frame["modal_price_rs_per_quintal"] = pd.to_numeric(
        frame["modal_price_rs_per_quintal"], errors="coerce"
    )
    frame = frame.dropna(
        subset=["price_date", "commodity", "market_name", "state", "modal_price_rs_per_quintal"]
    )

    daily = (
        frame.groupby(["commodity", "market_name", "state", "price_date"], as_index=False)
        .agg(modal_price_rs_per_quintal=("modal_price_rs_per_quintal", "mean"))
        .sort_values("price_date")
    )
    return daily


def get_dashboard_options() -> dict[str, Any]:
    daily = _load_daily_prices()

    commodity_stats = (
        daily.groupby("commodity")
        .agg(
            observations=("modal_price_rs_per_quintal", "size"),
            latest_date=("price_date", "max"),
        )
        .reset_index()
        .sort_values(["latest_date", "observations", "commodity"], ascending=[False, False, True])
    )

    default_commodity = commodity_stats.iloc[0]["commodity"]
    markets = get_markets_for_commodity(str(default_commodity))
    default_selection = markets["default_selection"]

    return {
        "dataset": get_dataset_summary(),
        "default_commodity": default_commodity,
        "default_selection": default_selection,
        "commodities": commodity_stats["commodity"].tolist(),
    }


def get_markets_for_commodity(commodity: str, limit: int = 120) -> dict[str, Any]:
    daily = _load_daily_prices()
    subset = daily[daily["commodity"].str.casefold() == commodity.casefold()].copy()
    if subset.empty:
        raise ValueError(f"No data available for commodity '{commodity}'.")

    latest_rows = (
        subset.sort_values("price_date")
        .groupby(["market_name", "state"], as_index=False)
        .tail(1)
        .sort_values(
            ["price_date", "modal_price_rs_per_quintal", "market_name", "state"],
            ascending=[False, False, True, True],
        )
    )

    observation_counts = (
        subset.groupby(["market_name", "state"])
        .agg(observations=("modal_price_rs_per_quintal", "size"))
        .reset_index()
    )

    latest_rows = latest_rows.merge(observation_counts, on=["market_name", "state"], how="left")
    latest_rows = latest_rows.head(limit)
    markets = [
        {
            "market": row.market_name,
            "state": row.state,
            "label": f"{row.market_name}, {row.state}",
            "latest_price": round(float(row.modal_price_rs_per_quintal), 2),
            "latest_date": row.price_date.strftime("%Y-%m-%d"),
            "observations": int(row.observations),
            "forecast_ready": int(row.observations) >= MIN_HISTORY_POINTS,
        }
        for row in latest_rows.itertuples(index=False)
    ]

    default_selection = next(
        (
            {"market": market["market"], "state": market["state"]}
            for market in markets
            if market["forecast_ready"]
        ),
        {"market": markets[0]["market"], "state": markets[0]["state"]},
    )

    return {
        "commodity": commodity,
        "default_selection": default_selection,
        "markets": markets,
    }


def build_forecast_summary(
    commodity: str,
    market_name: str,
    state: str,
    horizon_days: int = 14,
) -> dict[str, Any]:
    horizon_days = max(7, min(int(horizon_days), MAX_FORECAST_DAYS))
    history = _get_market_series(commodity=commodity, market_name=market_name, state=state)

    if len(history) < MIN_HISTORY_POINTS:
        raise ValueError(
            f"Not enough history to forecast {commodity} in {market_name}, {state}. "
            f"Found {len(history)} daily points; need at least {MIN_HISTORY_POINTS}."
        )

    enriched_series = _regularize_series(history)
    forecast_series = _forecast_prices(enriched_series, horizon_days=horizon_days)
    metrics = _backtest_model(enriched_series)

    current_price = float(enriched_series.iloc[-1])
    forecast_delta_pct = ((float(forecast_series.max()) - current_price) / current_price) * 100 if current_price else 0.0
    change_pct_7d = _percent_change(enriched_series, 7)
    change_pct_30d = _percent_change(enriched_series, 30)
    volatility_pct_30d = _recent_volatility(enriched_series, 30)
    confidence = _confidence_score(enriched_series, metrics)
    best_sell_date = forecast_series.idxmax()
    best_sell_price = float(forecast_series.loc[best_sell_date])
    latest_date = enriched_series.index[-1]
    trend_direction = _trend_direction(forecast_series, current_price)
    risk_level = _risk_level(volatility_pct_30d)

    return {
        "selection": {
            "commodity": commodity,
            "market": market_name,
            "state": state,
            "horizon_days": horizon_days,
            "latest_observation_date": latest_date.strftime("%Y-%m-%d"),
        },
        "current": {
            "price": round(current_price, 2),
            "change_pct_7d": round(change_pct_7d, 2),
            "change_pct_30d": round(change_pct_30d, 2),
            "volatility_pct_30d": round(volatility_pct_30d, 2),
            "series_points": int(len(enriched_series)),
        },
        "forecast": {
            "min_price": round(float(forecast_series.min()), 2),
            "max_price": round(float(forecast_series.max()), 2),
            "avg_price": round(float(forecast_series.mean()), 2),
            "trend_direction": trend_direction,
            "confidence_score": round(confidence, 1),
            "best_sell_date": best_sell_date.strftime("%Y-%m-%d"),
            "best_sell_price": round(best_sell_price, 2),
            "recommendation": _build_recommendation(
                current_price=current_price,
                latest_date=latest_date,
                best_sell_date=best_sell_date,
                best_sell_price=best_sell_price,
                horizon_days=horizon_days,
                trend_direction=trend_direction,
            ),
            "risk_level": risk_level,
            "expected_change_pct": round(forecast_delta_pct, 2),
        },
        "model_metrics": {
            "trend_seasonal_mae": round(metrics["model_mae"], 2),
            "naive_mae": round(metrics["baseline_mae"], 2),
            "improvement_pct": round(metrics["improvement_pct"], 2),
            "backtest_window_days": int(metrics["window_days"]),
        },
        "history": _serialize_series(enriched_series.tail(45)),
        "prediction": _serialize_series(forecast_series),
        "insights": _build_insights(
            enriched_series=enriched_series,
            forecast_series=forecast_series,
            current_price=current_price,
            change_pct_30d=change_pct_30d,
            volatility_pct_30d=volatility_pct_30d,
            metrics=metrics,
        ),
    }


def build_market_comparison(commodity: str, limit: int = 6) -> dict[str, Any]:
    daily = _load_daily_prices()
    subset = daily[daily["commodity"].str.casefold() == commodity.casefold()].copy()
    if subset.empty:
        raise ValueError(f"No data available for commodity '{commodity}'.")

    subset = subset.sort_values(["market_name", "state", "price_date"])
    rows: list[dict[str, Any]] = []

    for (market_name, state), group in subset.groupby(["market_name", "state"]):
        series = _regularize_series(group)
        if len(series) < 21:
            continue

        latest_price = float(series.iloc[-1])
        change_7d = _percent_change(series, 7)
        change_30d = _percent_change(series, 30)

        rows.append(
            {
                "market": market_name,
                "state": state,
                "current_price": round(latest_price, 2),
                "change_pct_7d": round(change_7d, 2),
                "change_pct_30d": round(change_30d, 2),
                "latest_date": series.index[-1].strftime("%Y-%m-%d"),
            }
        )

    comparison = pd.DataFrame(rows)
    if comparison.empty:
        return {"commodity": commodity, "markets": []}

    comparison = comparison.sort_values(
        ["current_price", "change_pct_7d", "market"], ascending=[False, False, True]
    ).head(limit)

    best_market = f"{comparison.iloc[0]['market']}, {comparison.iloc[0]['state']}"
    markets = []
    for row in comparison.itertuples(index=False):
        row_label = f"{row.market}, {row.state}"
        signal = "Best current price" if row_label == best_market else _market_signal(row.change_pct_7d)
        markets.append(
            {
                "market": row.market,
                "state": row.state,
                "label": row_label,
                "current_price": float(row.current_price),
                "change_pct_7d": float(row.change_pct_7d),
                "change_pct_30d": float(row.change_pct_30d),
                "latest_date": row.latest_date,
                "signal": signal,
            }
        )

    return {
        "commodity": commodity,
        "best_market": best_market,
        "markets": markets,
    }


def _get_market_series(commodity: str, market_name: str, state: str) -> pd.DataFrame:
    daily = _load_daily_prices()
    subset = daily[
        (daily["commodity"].str.casefold() == commodity.casefold())
        & (daily["market_name"].str.casefold() == market_name.casefold())
        & (daily["state"].str.casefold() == state.casefold())
    ].copy()

    if subset.empty:
        raise ValueError(f"No data available for {commodity} in {market_name}, {state}.")

    return subset.sort_values("price_date")


def _regularize_series(frame: pd.DataFrame) -> pd.Series:
    series = (
        frame.groupby("price_date", as_index=True)["modal_price_rs_per_quintal"]
        .mean()
        .sort_index()
    )
    full_range = pd.date_range(series.index.min(), series.index.max(), freq="D")
    series = series.reindex(full_range)
    series = series.interpolate(method="time").ffill().bfill()
    series.index.name = "price_date"
    return series.astype(float)


def _fit_model(series: pd.Series) -> ForecastModel:
    training_window = min(len(series), 180)
    train_series = series.tail(training_window)
    smooth = train_series.rolling(window=min(7, len(train_series)), min_periods=1).mean()
    x = np.arange(len(train_series))

    if len(train_series) > 1:
        slope, intercept = np.polyfit(x, smooth.to_numpy(), 1)
    else:
        slope, intercept = 0.0, float(train_series.iloc[-1])

    trend = intercept + slope * x
    residuals = train_series.to_numpy() - trend
    seasonal = {
        day: float(np.mean(residuals[train_series.index.dayofweek == day]))
        if np.any(train_series.index.dayofweek == day)
        else 0.0
        for day in range(7)
    }

    recent_returns = train_series.pct_change().replace([np.inf, -np.inf], np.nan).dropna().tail(30)
    max_daily_change = float(np.clip(recent_returns.std() * 2.4 if not recent_returns.empty else 0.03, 0.015, 0.12))
    floor_price = max(float(train_series.min()) * 0.55, 1.0)

    return ForecastModel(
        intercept=float(intercept),
        slope=float(slope),
        seasonal=seasonal,
        max_daily_change=max_daily_change,
        floor_price=float(floor_price),
    )


def _forecast_prices(series: pd.Series, horizon_days: int) -> pd.Series:
    model = _fit_model(series)
    future_dates = pd.date_range(series.index[-1] + pd.Timedelta(days=1), periods=horizon_days, freq="D")
    x_future = np.arange(len(series.tail(min(len(series), 180))), len(series.tail(min(len(series), 180))) + horizon_days)
    rolling_anchor = float(series.tail(14).mean())
    raw_future = []

    for x_val, future_date in zip(x_future, future_dates):
        seasonal_adjustment = model.seasonal.get(int(future_date.dayofweek), 0.0)
        projected = model.intercept + model.slope * float(x_val) + seasonal_adjustment
        projected = 0.7 * projected + 0.3 * rolling_anchor
        raw_future.append(max(projected, model.floor_price))

    bounded_forecast = []
    previous_price = float(series.iloc[-1])
    for price in raw_future:
        lower = previous_price * (1 - model.max_daily_change)
        upper = previous_price * (1 + model.max_daily_change)
        bounded = float(np.clip(price, lower, upper))
        bounded_forecast.append(max(bounded, model.floor_price))
        previous_price = bounded_forecast[-1]

    return pd.Series(bounded_forecast, index=future_dates)


def _backtest_model(series: pd.Series) -> dict[str, float]:
    window_days = min(14, max(7, len(series) // 6))
    train_series = series.iloc[:-window_days]
    actual_series = series.iloc[-window_days:]

    if train_series.empty:
        return {
            "model_mae": 0.0,
            "baseline_mae": 0.0,
            "improvement_pct": 0.0,
            "window_days": float(window_days),
        }

    prediction = _forecast_prices(train_series, horizon_days=window_days)
    prediction = prediction.reindex(actual_series.index)
    baseline = pd.Series(float(train_series.iloc[-1]), index=actual_series.index)

    model_mae = float((prediction - actual_series).abs().mean())
    baseline_mae = float((baseline - actual_series).abs().mean())
    improvement_pct = 0.0
    if baseline_mae > 0:
        improvement_pct = max(0.0, ((baseline_mae - model_mae) / baseline_mae) * 100)

    return {
        "model_mae": model_mae,
        "baseline_mae": baseline_mae,
        "improvement_pct": improvement_pct,
        "window_days": float(window_days),
    }


def _percent_change(series: pd.Series, lookback_days: int) -> float:
    if len(series) <= lookback_days:
        return 0.0
    previous = float(series.iloc[-lookback_days - 1])
    current = float(series.iloc[-1])
    if previous == 0:
        return 0.0
    return ((current - previous) / previous) * 100


def _recent_volatility(series: pd.Series, lookback_days: int) -> float:
    recent = series.tail(lookback_days + 1).pct_change().replace([np.inf, -np.inf], np.nan).dropna()
    if recent.empty:
        return 0.0
    return float(recent.std() * 100)


def _confidence_score(series: pd.Series, metrics: dict[str, float]) -> float:
    history_factor = min(1.0, len(series) / 180)
    volatility_factor = 1 - min(_recent_volatility(series, 30) / 12, 1)
    backtest_factor = min(1.0, metrics["improvement_pct"] / 25) if metrics["improvement_pct"] > 0 else 0.35
    score = (0.42 * history_factor) + (0.28 * volatility_factor) + (0.30 * backtest_factor)
    return np.clip(score * 100, 52, 95)


def _trend_direction(forecast_series: pd.Series, current_price: float) -> str:
    expected_price = float(forecast_series.mean())
    change_pct = ((expected_price - current_price) / current_price) * 100 if current_price else 0.0
    if change_pct >= 2:
        return "Bullish"
    if change_pct <= -2:
        return "Bearish"
    return "Stable"


def _risk_level(volatility_pct_30d: float) -> str:
    if volatility_pct_30d >= 9:
        return "High"
    if volatility_pct_30d >= 4:
        return "Moderate"
    return "Low"


def _build_recommendation(
    current_price: float,
    latest_date: pd.Timestamp,
    best_sell_date: pd.Timestamp,
    best_sell_price: float,
    horizon_days: int,
    trend_direction: str,
) -> str:
    days_until_best = max((best_sell_date - latest_date).days, 1)
    change_pct = ((best_sell_price - current_price) / current_price) * 100 if current_price else 0.0

    if trend_direction == "Bullish" and change_pct > 2:
        return (
            f"Hold stock for the next {min(days_until_best, horizon_days)} days. "
            f"The model expects a stronger selling window near {best_sell_date.strftime('%d %b')}."
        )
    if trend_direction == "Bearish":
        return "Sell earlier if storage costs are high. The short-term signal is softening from current levels."
    return "Monitor the market closely. Prices are forecast to stay in a narrow band over the selected horizon."


def _serialize_series(series: pd.Series) -> list[dict[str, Any]]:
    return [
        {"date": index.strftime("%Y-%m-%d"), "price": round(float(value), 2)}
        for index, value in series.items()
    ]


def _build_insights(
    enriched_series: pd.Series,
    forecast_series: pd.Series,
    current_price: float,
    change_pct_30d: float,
    volatility_pct_30d: float,
    metrics: dict[str, float],
) -> list[dict[str, str]]:
    forecast_peak = float(forecast_series.max())
    forecast_avg = float(forecast_series.mean())
    average_30d = float(enriched_series.tail(30).mean())

    return [
        {
            "title": "Momentum",
            "body": (
                f"Current mandi price is {change_pct_30d:.1f}% against the last 30-day trend, "
                f"with a projected average of Rs. {forecast_avg:,.0f} per quintal over the selected horizon."
            ),
        },
        {
            "title": "Sell Window",
            "body": (
                f"The strongest projected price is Rs. {forecast_peak:,.0f} per quintal, "
                "which can help plan storage or release decisions."
            ),
        },
        {
            "title": "Stability",
            "body": (
                f"Recent 30-day volatility is {volatility_pct_30d:.1f}%. "
                f"The trend-seasonality model improved backtest MAE by {metrics['improvement_pct']:.1f}% over a naive carry-forward baseline."
            ),
        },
        {
            "title": "Reference Level",
            "body": (
                f"The selected market has averaged Rs. {average_30d:,.0f} per quintal in the last 30 days, "
                f"compared with the latest observed value of Rs. {current_price:,.0f}."
            ),
        },
    ]


def _market_signal(change_pct_7d: float) -> str:
    if change_pct_7d >= 4:
        return "Fast-rising market"
    if change_pct_7d <= -4:
        return "Cooling market"
    return "Stable market"
