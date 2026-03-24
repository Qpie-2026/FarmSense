from argparse import ArgumentParser
from datetime import datetime, timezone
from pathlib import Path
import json
import os

import requests
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct"
CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"

load_dotenv(BASE_DIR / ".env")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")


def require_api_key():
    if not OPENWEATHER_API_KEY:
        raise ValueError(
            "OPENWEATHER_API_KEY is missing in .env. "
            "Add it before calling the weather API."
        )


def geocode_city(city, country_code="IN", state_code=None, limit=1):
    require_api_key()

    query_parts = [city]
    if state_code:
        query_parts.append(state_code)
    if country_code:
        query_parts.append(country_code)

    try:
        response = requests.get(
            GEOCODE_URL,
            params={
                "q": ",".join(query_parts),
                "limit": limit,
                "appid": OPENWEATHER_API_KEY,
            },
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:
        raise RuntimeError("OpenWeather geocoding request failed.") from exc

    if not payload:
        raise ValueError(f"No geocoding result found for {city}.")

    location = payload[0]
    return {
        "name": location.get("name", city),
        "state": location.get("state"),
        "country": location.get("country", country_code),
        "lat": location["lat"],
        "lon": location["lon"],
    }


def fetch_current_weather(city, country_code="IN", state_code=None, units="metric"):
    location = geocode_city(city, country_code=country_code, state_code=state_code)

    try:
        response = requests.get(
            CURRENT_WEATHER_URL,
            params={
                "lat": location["lat"],
                "lon": location["lon"],
                "appid": OPENWEATHER_API_KEY,
                "units": units,
            },
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:
        raise RuntimeError("OpenWeather current weather request failed.") from exc

    observed_at = datetime.fromtimestamp(payload["dt"], tz=timezone.utc).isoformat()

    weather = {
        "city": location["name"],
        "state": location["state"],
        "country": location["country"],
        "lat": location["lat"],
        "lon": location["lon"],
        "observed_at_utc": observed_at,
        "temperature": payload["main"]["temp"],
        "feels_like": payload["main"]["feels_like"],
        "humidity": payload["main"]["humidity"],
        "pressure": payload["main"]["pressure"],
        "wind_speed": payload.get("wind", {}).get("speed", 0),
        "clouds": payload.get("clouds", {}).get("all", 0),
        "rain_1h": payload.get("rain", {}).get("1h", 0),
        "description": payload.get("weather", [{}])[0].get("description", "unknown"),
        "raw_response": payload,
    }
    return weather


def save_weather_snapshot(weather, filename="live_weather.json"):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    output_path = DATA_DIR / filename
    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(weather, file, indent=2)
    return output_path


def build_parser():
    parser = ArgumentParser(description="Fetch current weather from OpenWeather.")
    parser.add_argument("--city", default="Pune", help="City name to fetch weather for.")
    parser.add_argument("--country", default="IN", help="ISO country code, e.g. IN.")
    parser.add_argument(
        "--state",
        default=None,
        help="Optional state code. OpenWeather only expects this for some countries.",
    )
    parser.add_argument(
        "--units",
        default="metric",
        choices=["standard", "metric", "imperial"],
        help="Response units for temperature and wind speed.",
    )
    parser.add_argument(
        "--output",
        default="live_weather.json",
        help="JSON file name to save under the data directory.",
    )
    return parser


def main():
    args = build_parser().parse_args()
    weather = fetch_current_weather(
        city=args.city,
        country_code=args.country,
        state_code=args.state,
        units=args.units,
    )
    output_path = save_weather_snapshot(weather, filename=args.output)

    print(f"City        : {weather['city']}, {weather['country']}")
    print(f"Coordinates : {weather['lat']}, {weather['lon']}")
    print(f"Observed    : {weather['observed_at_utc']}")
    print(f"Condition   : {weather['description']}")
    print(f"Temperature : {weather['temperature']}")
    print(f"Humidity    : {weather['humidity']}")
    print(f"Rain (1h)   : {weather['rain_1h']}")
    print(f"Saved JSON  : {output_path}")


if __name__ == "__main__":
    main()
