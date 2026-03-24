from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT / "dataset" / "processed" / "farmsense_clean_dataset.csv"
EXTERNAL_DIR = ROOT / "dataset" / "external"
WEATHER_FILE = EXTERNAL_DIR / "weather_daily.csv"
ARRIVALS_FILE = EXTERNAL_DIR / "arrivals_daily.csv"
PRODUCTION_FILE = EXTERNAL_DIR / "production_monthly.csv"


WEATHER_ZONE_BY_STATE = {
    "andhra pradesh": "coastal",
    "arunachal pradesh": "northeast",
    "assam": "northeast",
    "bihar": "east",
    "chhattisgarh": "central",
    "goa": "coastal",
    "gujarat": "west",
    "haryana": "north",
    "himachal pradesh": "north",
    "jammu and kashmir": "north",
    "jharkhand": "east",
    "karnataka": "south",
    "kerala": "coastal",
    "madhya pradesh": "central",
    "maharashtra": "west",
    "manipur": "northeast",
    "meghalaya": "northeast",
    "mizoram": "northeast",
    "nagaland": "northeast",
    "odisha": "east",
    "punjab": "north",
    "rajasthan": "west",
    "sikkim": "northeast",
    "tamil nadu": "south",
    "telangana": "south",
    "tripura": "northeast",
    "uttar pradesh": "north",
    "uttarakhand": "north",
    "west bengal": "east",
}

ZONE_RAINFALL = {
    "north": [18, 22, 12, 8, 15, 55, 118, 112, 72, 26, 10, 8],
    "west": [6, 4, 3, 2, 8, 88, 168, 154, 92, 28, 10, 5],
    "central": [12, 10, 7, 5, 14, 78, 142, 128, 86, 34, 11, 8],
    "south": [11, 10, 18, 40, 75, 92, 96, 102, 118, 126, 142, 76],
    "coastal": [16, 20, 34, 68, 118, 164, 186, 178, 172, 156, 128, 72],
    "east": [14, 18, 24, 38, 84, 128, 168, 158, 132, 66, 28, 16],
    "northeast": [18, 26, 42, 98, 188, 262, 314, 298, 244, 138, 62, 26],
}

ZONE_TEMPERATURE = {
    "north": [13, 16, 21, 28, 33, 35, 32, 31, 29, 25, 19, 14],
    "west": [20, 23, 28, 33, 37, 35, 31, 30, 31, 30, 25, 21],
    "central": [18, 22, 27, 33, 36, 34, 29, 28, 28, 27, 22, 18],
    "south": [24, 26, 28, 31, 32, 30, 28, 28, 28, 27, 25, 24],
    "coastal": [25, 27, 29, 31, 31, 29, 28, 28, 28, 28, 27, 25],
    "east": [18, 22, 28, 33, 35, 33, 30, 30, 30, 29, 24, 19],
    "northeast": [14, 17, 21, 25, 27, 28, 28, 28, 27, 24, 19, 15],
}


BASE_COLUMNS = [
    "state",
    "district_name",
    "market_name",
    "commodity",
    "variety",
    "grade",
    "price_date",
    "min_price_rs_per_quintal",
    "max_price_rs_per_quintal",
    "modal_price_rs_per_quintal",
]

EXOGENOUS_COLUMNS = [
    "series_daily_records",
    "variety_diversity",
    "grade_diversity",
    "market_total_activity",
    "state_commodity_activity",
    "arrival_pressure_index",
    "market_activity_ratio",
    "monthly_supply_index",
    "harvest_window_flag",
    "production_pressure_index",
    "rainfall_mm",
    "temperature_c",
    "humidity_pct",
    "weather_shock_index",
    "month_sin",
    "month_cos",
    "day_of_week_sin",
    "day_of_week_cos",
    "week_of_year_sin",
    "week_of_year_cos",
]


@dataclass(frozen=True)
class SeriesKey:
    commodity: str
    market_name: str
    state: str
    history_days: int

    def label(self) -> str:
        return f"{self.commodity} | {self.market_name}, {self.state}"


def load_clean_market_data(dataset_path: Path = DATASET_PATH) -> pd.DataFrame:
    frame = pd.read_csv(dataset_path, usecols=BASE_COLUMNS)
    frame["price_date"] = pd.to_datetime(frame["price_date"], errors="coerce")
    for column in ["state", "district_name", "market_name", "commodity", "variety", "grade"]:
        frame[column] = frame[column].astype(str).str.strip()

    numeric_columns = [
        "min_price_rs_per_quintal",
        "max_price_rs_per_quintal",
        "modal_price_rs_per_quintal",
    ]
    for column in numeric_columns:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")

    frame = frame.dropna(
        subset=[
            "state",
            "market_name",
            "commodity",
            "price_date",
            "modal_price_rs_per_quintal",
        ]
    )
    return frame.sort_values("price_date").reset_index(drop=True)


def build_feature_frame(raw_frame: pd.DataFrame | None = None) -> pd.DataFrame:
    frame = load_clean_market_data() if raw_frame is None else raw_frame.copy()

    daily = (
        frame.groupby(["commodity", "market_name", "state", "price_date"], as_index=False)
        .agg(
            modal_price_rs_per_quintal=("modal_price_rs_per_quintal", "mean"),
            min_price_rs_per_quintal=("min_price_rs_per_quintal", "mean"),
            max_price_rs_per_quintal=("max_price_rs_per_quintal", "mean"),
            series_daily_records=("modal_price_rs_per_quintal", "size"),
            variety_diversity=("variety", "nunique"),
            grade_diversity=("grade", "nunique"),
        )
        .sort_values(["commodity", "market_name", "state", "price_date"])
    )

    daily = daily.merge(
        _build_arrival_features(frame),
        on=["commodity", "market_name", "state", "price_date"],
        how="left",
    )
    daily["market_activity_ratio"] = (
        daily["series_daily_records"] / daily["market_total_activity"].clip(lower=1)
    )
    daily = daily.merge(_build_production_features(frame), on=["commodity", "state", "price_date"], how="left")
    daily = _merge_weather_features(daily)
    daily = _add_calendar_features(daily)
    daily = _add_groupwise_rolling_features(daily)
    return daily


def add_lag_features(
    frame: pd.DataFrame,
    lags: Iterable[int] = (1, 3, 7, 14, 21, 28),
    rolling_windows: Iterable[int] = (7, 14, 30),
) -> pd.DataFrame:
    enriched = frame.sort_values(["commodity", "market_name", "state", "price_date"]).copy()
    group_key = ["commodity", "market_name", "state"]
    grouped_target = enriched.groupby(group_key)["modal_price_rs_per_quintal"]

    for lag in lags:
        enriched[f"lag_{lag}"] = grouped_target.shift(lag)

    for window in rolling_windows:
        enriched[f"rolling_mean_{window}"] = grouped_target.transform(
            lambda values: values.shift(1).rolling(window).mean()
        )
        enriched[f"rolling_std_{window}"] = grouped_target.transform(
            lambda values: values.shift(1).rolling(window).std()
        )

    enriched["price_return_7d"] = enriched["modal_price_rs_per_quintal"] / enriched["lag_7"] - 1
    enriched["price_range_rs"] = (
        enriched["max_price_rs_per_quintal"] - enriched["min_price_rs_per_quintal"]
    )
    return enriched


def prepare_series_frame(
    feature_frame: pd.DataFrame,
    commodity: str,
    market_name: str,
    state: str,
    min_history: int = 180,
) -> pd.DataFrame:
    series = feature_frame[
        (feature_frame["commodity"] == commodity)
        & (feature_frame["market_name"] == market_name)
        & (feature_frame["state"] == state)
    ].copy()
    series = series.sort_values("price_date").reset_index(drop=True)
    if len(series) < min_history:
        raise ValueError(
            f"Series {commodity} | {market_name}, {state} has only {len(series)} points; need at least {min_history}."
        )
    return series


def select_benchmark_series(
    raw_frame: pd.DataFrame | None = None,
    top_n: int = 3,
    min_history: int = 365,
) -> list[SeriesKey]:
    frame = load_clean_market_data() if raw_frame is None else raw_frame
    daily_counts = (
        frame.groupby(["commodity", "market_name", "state"])["price_date"]
        .nunique()
        .reset_index(name="history_days")
    )

    commodity_rank = frame["commodity"].value_counts().index.tolist()
    selected: list[SeriesKey] = []
    seen_labels: set[tuple[str, str, str]] = set()

    for commodity in commodity_rank:
        commodity_series = daily_counts[
            (daily_counts["commodity"] == commodity)
            & (daily_counts["history_days"] >= min_history)
        ].sort_values("history_days", ascending=False)

        if commodity_series.empty:
            continue

        row = commodity_series.iloc[0]
        label = (row["commodity"], row["market_name"], row["state"])
        if label in seen_labels:
            continue

        selected.append(
            SeriesKey(
                commodity=row["commodity"],
                market_name=row["market_name"],
                state=row["state"],
                history_days=int(row["history_days"]),
            )
        )
        seen_labels.add(label)

        if len(selected) >= top_n:
            break

    if not selected:
        raise ValueError("No benchmark-ready series were found. Lower the minimum history threshold.")

    return selected


def build_future_exogenous_frame(series_frame: pd.DataFrame, horizon_days: int = 14) -> pd.DataFrame:
    if series_frame.empty:
        raise ValueError("series_frame must contain at least one row.")

    recent = series_frame.tail(30)
    last_row = series_frame.iloc[-1]
    future_dates = pd.date_range(last_row["price_date"] + pd.Timedelta(days=1), periods=horizon_days, freq="D")
    future = pd.DataFrame(
        {
            "commodity": last_row["commodity"],
            "market_name": last_row["market_name"],
            "state": last_row["state"],
            "price_date": future_dates,
            "series_daily_records": recent["series_daily_records"].mean(),
            "variety_diversity": recent["variety_diversity"].mean(),
            "grade_diversity": recent["grade_diversity"].mean(),
            "market_total_activity": recent["market_total_activity"].mean(),
            "state_commodity_activity": recent["state_commodity_activity"].mean(),
            "arrival_pressure_index": recent["arrival_pressure_index"].mean(),
            "market_activity_ratio": recent["market_activity_ratio"].mean(),
        }
    )
    future["month"] = future["price_date"].dt.month

    monthly_lookup = (
        series_frame.assign(month=series_frame["price_date"].dt.month)
        .groupby("month", as_index=False)[
            [
                "monthly_supply_index",
                "harvest_window_flag",
                "production_pressure_index",
                "rainfall_mm",
                "temperature_c",
                "humidity_pct",
                "weather_shock_index",
            ]
        ]
        .mean()
    )

    future = future.merge(monthly_lookup, on="month", how="left")
    future = _add_calendar_features(future)
    return future[["price_date", *EXOGENOUS_COLUMNS]].reset_index(drop=True)


def _build_arrival_features(raw_frame: pd.DataFrame) -> pd.DataFrame:
    series_level = raw_frame[["commodity", "market_name", "state", "price_date"]].drop_duplicates()

    market_level = (
        raw_frame.groupby(["market_name", "state", "price_date"], as_index=False)
        .agg(market_total_activity=("commodity", "size"))
    )
    state_commodity_level = (
        raw_frame.groupby(["commodity", "state", "price_date"], as_index=False)
        .agg(state_commodity_activity=("market_name", "size"))
    )

    features = series_level.merge(market_level, on=["market_name", "state", "price_date"], how="left")
    features = features.merge(state_commodity_level, on=["commodity", "state", "price_date"], how="left")
    return features


def _build_production_features(raw_frame: pd.DataFrame) -> pd.DataFrame:
    frame = raw_frame.copy()
    frame["month"] = frame["price_date"].dt.month

    monthly = (
        frame.groupby(["commodity", "state", "month"], as_index=False)
        .agg(
            monthly_samples=("modal_price_rs_per_quintal", "size"),
            monthly_markets=("market_name", "nunique"),
        )
    )
    monthly["monthly_supply_index"] = monthly.groupby(["commodity", "state"])["monthly_samples"].transform(
        lambda values: values / values.mean()
    )
    top_month_rank = monthly.groupby(["commodity", "state"])["monthly_supply_index"].rank(
        method="first", ascending=False
    )
    monthly["harvest_window_flag"] = (top_month_rank <= 3).astype(int)

    daily = raw_frame[["commodity", "state", "price_date"]].copy()
    daily["month"] = daily["price_date"].dt.month
    daily = daily.merge(
        monthly[["commodity", "state", "month", "monthly_supply_index", "harvest_window_flag"]],
        on=["commodity", "state", "month"],
        how="left",
    )
    daily["production_pressure_index"] = daily["monthly_supply_index"] * (1 + (daily["harvest_window_flag"] * 0.12))
    return daily.drop(columns=["month"]).drop_duplicates(["commodity", "state", "price_date"])


def _merge_weather_features(daily: pd.DataFrame) -> pd.DataFrame:
    if WEATHER_FILE.exists():
        weather = pd.read_csv(WEATHER_FILE)
        weather["price_date"] = pd.to_datetime(weather["price_date"], errors="coerce")
        weather["state"] = weather["state"].astype(str).str.strip()
        weather = weather.dropna(subset=["state", "price_date"])
        expected = {"rainfall_mm", "temperature_c", "humidity_pct"}
        missing = expected - set(weather.columns)
        if missing:
            raise ValueError(
                f"{WEATHER_FILE} is missing required columns: {', '.join(sorted(missing))}"
            )
        weather["weather_shock_index"] = (
            (weather["rainfall_mm"] / 150).clip(lower=0)
            + ((weather["temperature_c"] - 26).abs() / 18)
            + ((weather["humidity_pct"] - 65).abs() / 40)
        ) / 3
        return daily.merge(
            weather[["state", "price_date", "rainfall_mm", "temperature_c", "humidity_pct", "weather_shock_index"]],
            on=["state", "price_date"],
            how="left",
        )

    weather = daily[["state", "price_date"]].drop_duplicates().copy()
    weather["state_key"] = weather["state"].str.casefold()
    weather["zone"] = weather["state_key"].map(WEATHER_ZONE_BY_STATE).fillna("central")
    weather["month"] = weather["price_date"].dt.month

    weather["rainfall_mm"] = weather.apply(
        lambda row: ZONE_RAINFALL[row["zone"]][row["month"] - 1],
        axis=1,
    )
    weather["temperature_c"] = weather.apply(
        lambda row: ZONE_TEMPERATURE[row["zone"]][row["month"] - 1],
        axis=1,
    )
    weather["humidity_pct"] = (42 + (weather["rainfall_mm"] * 0.35)).clip(upper=95)
    weather["weather_shock_index"] = (
        (weather["rainfall_mm"] / 180)
        + ((weather["temperature_c"] - 26).abs() / 18)
        + ((weather["humidity_pct"] - 68).abs() / 45)
    ) / 3

    return daily.merge(
        weather[["state", "price_date", "rainfall_mm", "temperature_c", "humidity_pct", "weather_shock_index"]],
        on=["state", "price_date"],
        how="left",
    )


def _add_calendar_features(frame: pd.DataFrame) -> pd.DataFrame:
    enriched = frame.copy()
    enriched["month"] = enriched["price_date"].dt.month
    enriched["day_of_week"] = enriched["price_date"].dt.dayofweek
    enriched["week_of_year"] = enriched["price_date"].dt.isocalendar().week.astype(int)

    enriched["month_sin"] = np.sin((2 * np.pi * enriched["month"]) / 12)
    enriched["month_cos"] = np.cos((2 * np.pi * enriched["month"]) / 12)
    enriched["day_of_week_sin"] = np.sin((2 * np.pi * enriched["day_of_week"]) / 7)
    enriched["day_of_week_cos"] = np.cos((2 * np.pi * enriched["day_of_week"]) / 7)
    enriched["week_of_year_sin"] = np.sin((2 * np.pi * enriched["week_of_year"]) / 52)
    enriched["week_of_year_cos"] = np.cos((2 * np.pi * enriched["week_of_year"]) / 52)
    return enriched


def _add_groupwise_rolling_features(frame: pd.DataFrame) -> pd.DataFrame:
    enriched = frame.sort_values(["commodity", "market_name", "state", "price_date"]).copy()
    group_key = ["commodity", "market_name", "state"]

    enriched["arrival_pressure_7d_avg"] = (
        enriched.groupby(group_key)["series_daily_records"]
        .transform(lambda values: values.rolling(7, min_periods=1).mean())
    )
    enriched["arrival_pressure_index"] = (
        enriched["series_daily_records"] / enriched["arrival_pressure_7d_avg"].clip(lower=1)
    )

    enriched["market_activity_7d_avg"] = (
        enriched.groupby(["market_name", "state"])["market_total_activity"]
        .transform(lambda values: values.rolling(7, min_periods=1).mean())
    )
    enriched["state_activity_7d_avg"] = (
        enriched.groupby(["commodity", "state"])["state_commodity_activity"]
        .transform(lambda values: values.rolling(7, min_periods=1).mean())
    )

    return enriched.drop(columns=["arrival_pressure_7d_avg", "market_activity_7d_avg", "state_activity_7d_avg"])


def _series_snapshot(feature_frame: pd.DataFrame, series_limit: int) -> pd.DataFrame:
    series_keys = select_benchmark_series(top_n=series_limit, min_history=365)
    snapshots = [
        prepare_series_frame(
            feature_frame=feature_frame,
            commodity=series_key.commodity,
            market_name=series_key.market_name,
            state=series_key.state,
            min_history=365,
        ).assign(series_label=series_key.label())
        for series_key in series_keys
    ]
    return pd.concat(snapshots, ignore_index=True)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build enriched weather, arrivals, and production features for FarmSense."
    )
    parser.add_argument(
        "--output",
        default=str(ROOT / "dataset" / "processed" / "farmsense_feature_snapshot.csv"),
        help="Path to write the enriched feature snapshot CSV.",
    )
    parser.add_argument(
        "--series-limit",
        type=int,
        default=3,
        help="Number of benchmark series to include in the snapshot output.",
    )
    args = parser.parse_args()

    raw_frame = load_clean_market_data()
    feature_frame = build_feature_frame(raw_frame)
    feature_frame = add_lag_features(feature_frame)
    snapshot = _series_snapshot(feature_frame, series_limit=args.series_limit)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    snapshot.to_csv(output_path, index=False)
    print(f"Wrote enriched feature snapshot to {output_path}")


if __name__ == "__main__":
    main()
