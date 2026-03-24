from argparse import ArgumentParser
from pathlib import Path
import json

import joblib
import pandas as pd

from model_training import (
    ARIMA_MODEL_PATH,
    FORECAST_HORIZON,
    MASTER_DATA_PATH,
    METRICS_PATH,
    XGB_MODEL_PATH,
    build_daily_series,
    build_xgb_frame,
)
from weather_api import fetch_current_weather, save_weather_snapshot


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
PREDICTION_OUTPUT_PATH = DATA_DIR / "live_predictions.json"
FORECAST_HORIZONS = (7, 15, 30)
GRAPH_HISTORY_WINDOW = 12
WEATHER_FEATURE_MAP = {
    "temp": "temperature",
    "temperature": "temperature",
    "feels_like": "feels_like",
    "humidity": "humidity",
    "pressure": "pressure",
    "wind_speed": "wind_speed",
    "clouds": "clouds",
    "rain": "rain_1h",
    "rain_1h": "rain_1h",
}


def load_master_data():
    if not MASTER_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Could not find {MASTER_DATA_PATH}. Run data_pipeline.py and model_training.py first."
        )
    return pd.read_csv(MASTER_DATA_PATH, parse_dates=["date"])


def load_artifacts():
    if not XGB_MODEL_PATH.exists() or not ARIMA_MODEL_PATH.exists():
        raise FileNotFoundError(
            "Trained model files are missing. Run model_training.py first."
        )
    if not METRICS_PATH.exists():
        raise FileNotFoundError(
            f"Could not find {METRICS_PATH}. Run model_training.py first."
        )

    xgb_models = joblib.load(XGB_MODEL_PATH)
    arima_models = joblib.load(ARIMA_MODEL_PATH)
    metrics_df = pd.read_csv(METRICS_PATH)
    return xgb_models, arima_models, metrics_df


def get_supported_commodities(xgb_models, arima_models):
    return sorted(set(xgb_models.keys()) | set(arima_models.keys()))


def get_best_model_name(metrics_df, commodity):
    commodity_metrics = metrics_df[metrics_df["commodity"] == commodity].copy()
    if commodity_metrics.empty:
        return None
    best_row = commodity_metrics.sort_values(["rmse", "mae"]).iloc[0]
    return best_row["model"]


def prepare_xgb_input(series, commodity, feature_names, weather):
    frame = build_xgb_frame(series, commodity)
    latest_row = frame.iloc[[-1]].copy()

    for feature_name, weather_key in WEATHER_FEATURE_MAP.items():
        if feature_name in latest_row.columns:
            latest_row[feature_name] = weather.get(weather_key, 0)

    for feature_name in feature_names:
        if feature_name not in latest_row.columns:
            latest_row[feature_name] = 0

    feature_frame = latest_row[feature_names]
    if feature_frame.isna().any().any():
        missing_cols = feature_frame.columns[feature_frame.isna().any()].tolist()
        raise ValueError(
            f"Latest XGBoost feature row for {commodity} has missing values in {missing_cols}."
        )
    return feature_frame


def build_chart_series(series, forecast_series):
    history_slice = series.tail(GRAPH_HISTORY_WINDOW)
    chart_points = [
        {
            "date": str(idx.date()),
            "price": float(value),
            "kind": "history",
            "offset": history_pos - len(history_slice) + 1,
        }
        for history_pos, (idx, value) in enumerate(history_slice.items())
    ]

    chart_points.extend(
        [
            {
                "date": str(idx.date()),
                "price": float(value),
                "kind": "forecast",
                "offset": forecast_step,
            }
            for forecast_step, (idx, value) in enumerate(forecast_series.items(), start=1)
        ]
    )
    return chart_points


def forecast_for_commodity(commodity, history_df, xgb_models, arima_models, metrics_df, weather):
    series = build_daily_series(history_df, commodity)
    latest_price = float(series.iloc[-1])
    best_model = get_best_model_name(metrics_df, commodity)

    if commodity not in xgb_models or commodity not in arima_models:
        raise ValueError(f"Models for {commodity} are not available.")

    xgb_bundle = xgb_models[commodity]
    xgb_features = xgb_bundle["features"]
    xgb_input = prepare_xgb_input(series, commodity, xgb_features, weather)
    xgb_prediction = float(xgb_bundle["model"].predict(xgb_input)[0])

    arima_bundle = arima_models[commodity]
    arima_forecast = arima_bundle["model"].forecast(steps=max(FORECAST_HORIZONS))
    arima_prediction = float(arima_forecast.iloc[FORECAST_HORIZON - 1])
    arima_horizon_prices = {
        str(horizon): float(arima_forecast.iloc[horizon - 1]) for horizon in FORECAST_HORIZONS
    }
    recommended_horizon_prices = {
        "7": arima_prediction if best_model == "ARIMA" else xgb_prediction,
        "15": arima_horizon_prices["15"],
        "30": arima_horizon_prices["30"],
    }
    chart_series = build_chart_series(series, arima_forecast)

    weather_features_used = [feature for feature in xgb_features if feature in WEATHER_FEATURE_MAP]

    return {
        "commodity": commodity,
        "forecast_horizon_days": FORECAST_HORIZON,
        "latest_historical_price": latest_price,
        "latest_historical_date": str(series.index.max().date()),
        "recommended_model": best_model,
        "predictions": {
            "ARIMA": arima_prediction,
            "XGBoost": xgb_prediction,
        },
        "forecast_prices": recommended_horizon_prices,
        "projection_basis": {
            "7": "validated_recommendation",
            "15": "extended_projection",
            "30": "extended_projection",
        },
        "chart_series": chart_series,
        "recommended_prediction": {
            "model": best_model,
            "price": arima_prediction if best_model == "ARIMA" else xgb_prediction,
        },
        "weather_context": {
            "city": weather["city"],
            "country": weather["country"],
            "observed_at_utc": weather["observed_at_utc"],
            "temperature": weather["temperature"],
            "humidity": weather["humidity"],
            "rain_1h": weather["rain_1h"],
            "description": weather["description"],
            "used_directly_in_model": bool(weather_features_used),
            "features_used": weather_features_used,
            "note": (
                "The 7-day forecast follows the strongest validated model. "
                "The 15-day and 30-day views are longer-range projections from the time-series trend. "
                "Weather will affect the forecast more strongly after retraining with historical weather features."
                if not weather_features_used
                else "Weather values were injected into the model input."
            ),
        },
        "validation_summary": metrics_df[metrics_df["commodity"] == commodity]
        .sort_values(["rmse", "mae"])[["model", "mae", "rmse", "mape"]]
        .to_dict(orient="records"),
    }


def save_predictions(payload):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(PREDICTION_OUTPUT_PATH, "w", encoding="utf-8") as file:
        json.dump(payload, file, indent=2)
    return PREDICTION_OUTPUT_PATH


def run_live_predictions(commodities=None, city="Pune", country="IN", state=None, save_output=True):
    history_df = load_master_data()
    xgb_models, arima_models, metrics_df = load_artifacts()
    supported = get_supported_commodities(xgb_models, arima_models)
    target_commodities = commodities or supported

    invalid = sorted(set(target_commodities) - set(supported))
    if invalid:
        raise ValueError(
            f"Unsupported commodities: {invalid}. Supported commodities: {supported}"
        )

    weather = fetch_current_weather(
        city=city,
        country_code=country,
        state_code=state,
    )
    save_weather_snapshot(weather)

    forecasts = [
        forecast_for_commodity(
            commodity=commodity,
            history_df=history_df,
            xgb_models=xgb_models,
            arima_models=arima_models,
            metrics_df=metrics_df,
            weather=weather,
        )
        for commodity in target_commodities
    ]

    payload = {
        "weather": {
            "city": weather["city"],
            "country": weather["country"],
            "observed_at_utc": weather["observed_at_utc"],
            "temperature": weather["temperature"],
            "humidity": weather["humidity"],
            "rain_1h": weather["rain_1h"],
            "description": weather["description"],
        },
        "forecasts": forecasts,
    }

    if save_output:
        output_path = save_predictions(payload)
        payload["saved_to"] = str(output_path)

    return payload


def build_parser():
    parser = ArgumentParser(description="Run live commodity price inference.")
    parser.add_argument(
        "--commodities",
        nargs="+",
        default=None,
        help="Commodity names to score, for example Tomato Onion.",
    )
    parser.add_argument("--city", default="Pune", help="City for live weather fetch.")
    parser.add_argument("--country", default="IN", help="Country code for weather fetch.")
    parser.add_argument("--state", default=None, help="Optional state code for geocoding.")
    return parser


def main():
    args = build_parser().parse_args()
    payload = run_live_predictions(
        commodities=args.commodities,
        city=args.city,
        country=args.country,
        state=args.state,
        save_output=True,
    )
    output_path = payload.get("saved_to", PREDICTION_OUTPUT_PATH)

    print(f"Live weather fetched for {payload['weather']['city']}, {payload['weather']['country']}")
    for forecast in payload["forecasts"]:
        print(
            f"{forecast['commodity']:<10} "
            f"ARIMA={forecast['predictions']['ARIMA']:.2f} "
            f"XGB={forecast['predictions']['XGBoost']:.2f} "
            f"Recommended={forecast['recommended_model']} "
            f"({forecast['recommended_prediction']['price']:.2f})"
        )
    print(f"Saved predictions: {output_path}")


if __name__ == "__main__":
    main()
