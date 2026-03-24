from datetime import datetime, timezone
from pathlib import Path
import os
import re

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from pymongo import MongoClient
from pymongo.errors import PyMongoError

from predict_price import run_live_predictions


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__, template_folder=str(BASE_DIR / "templates"), static_folder=str(BASE_DIR / "static"))
app.secret_key = os.getenv("FLASK_SECRET_KEY", "purezone-dev-secret")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "purezone")
SUPPORTED_LOCATIONS = [
    {"id": "pune", "label": "Pune", "city": "Pune", "country": "IN", "region": "Maharashtra"},
    {"id": "nashik", "label": "Nashik", "city": "Nashik", "country": "IN", "region": "Maharashtra"},
    {"id": "hyderabad", "label": "Hyderabad", "city": "Hyderabad", "country": "IN", "region": "Telangana"},
    {"id": "bengaluru", "label": "Bengaluru", "city": "Bengaluru", "country": "IN", "region": "Karnataka"},
    {"id": "lucknow", "label": "Lucknow", "city": "Lucknow", "country": "IN", "region": "Uttar Pradesh"},
    {"id": "indore", "label": "Indore", "city": "Indore", "country": "IN", "region": "Madhya Pradesh"},
]

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_mongo_client = None


def get_location_by_id(location_id):
    for location in SUPPORTED_LOCATIONS:
        if location["id"] == location_id:
            return location
    return SUPPORTED_LOCATIONS[0]


def get_mongo_client():
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
    return _mongo_client


def get_users_collection():
    try:
        client = get_mongo_client()
        client.admin.command("ping")
        return client[MONGODB_DB_NAME]["users"]
    except PyMongoError:
        return None


def is_mongo_available():
    return get_users_collection() is not None


def save_user_to_mongo(name, email, preferred_location):
    collection = get_users_collection()
    if collection is None:
        return False

    now = datetime.now(timezone.utc)
    try:
        collection.update_one(
            {"email": email},
            {
                "$set": {
                    "name": name,
                    "email": email,
                    "preferred_location": preferred_location,
                    "last_login_at": now,
                },
                "$setOnInsert": {
                    "created_at": now,
                },
            },
            upsert=True,
        )
        return True
    except PyMongoError:
        return False


def update_preferred_location(email, preferred_location):
    collection = get_users_collection()
    if collection is None:
        return False

    try:
        collection.update_one(
            {"email": email},
            {"$set": {"preferred_location": preferred_location, "updated_at": datetime.now(timezone.utc)}},
            upsert=False,
        )
        return True
    except PyMongoError:
        return False


def build_session_user(name, email, preferred_location, stored_in_mongo):
    return {
        "name": name,
        "email": email,
        "preferred_location": preferred_location,
        "stored_in_mongo": stored_in_mongo,
    }


def get_current_user():
    return session.get("user")


def require_user():
    user = get_current_user()
    if not user:
        return None, redirect(url_for("login_page"))
    return user, None


def enrich_forecast_cards(payload, selected_location):
    cards = []
    market_summary_by_horizon = {}

    for forecast in payload["forecasts"]:
        current_price = forecast["latest_historical_price"]
        prices_by_horizon = {}

        for horizon, future_price in forecast["forecast_prices"].items():
            change_amount = future_price - current_price
            change_pct = (change_amount / current_price * 100) if current_price else 0

            if change_amount > 0:
                direction = "increasing"
            elif change_amount < 0:
                direction = "decreasing"
            else:
                direction = "stable"

            prices_by_horizon[horizon] = {
                "predicted_price": round(future_price, 2),
                "change_amount": round(change_amount, 2),
                "change_pct": round(change_pct, 2),
                "direction": direction,
                "projection_basis": forecast["projection_basis"].get(horizon, "validated_recommendation"),
            }

            if horizon not in market_summary_by_horizon:
                market_summary_by_horizon[horizon] = {
                    "increase_count": 0,
                    "decrease_count": 0,
                    "stable_count": 0,
                    "tracked_items": 0,
                }

            market_summary_by_horizon[horizon]["tracked_items"] += 1
            if direction == "increasing":
                market_summary_by_horizon[horizon]["increase_count"] += 1
            elif direction == "decreasing":
                market_summary_by_horizon[horizon]["decrease_count"] += 1
            else:
                market_summary_by_horizon[horizon]["stable_count"] += 1

        cards.append(
            {
                "commodity": forecast["commodity"],
                "current_price": round(current_price, 2),
                "forecast_horizon_days": sorted(int(horizon) for horizon in forecast["forecast_prices"].keys()),
                "forecast_prices": prices_by_horizon,
                "latest_historical_date": forecast["latest_historical_date"],
                "validation_summary": forecast["validation_summary"],
                "weather_context": forecast["weather_context"],
                "chart_series": forecast["chart_series"],
            }
        )

    cards.sort(key=lambda item: item["commodity"])

    return {
        "location": selected_location,
        "weather": payload["weather"],
        "cards": cards,
        "market_summary_by_horizon": market_summary_by_horizon,
        "default_horizon": 7,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "storage_status": {
            "mongo_available": is_mongo_available(),
        },
    }


@app.get("/")
def home():
    if get_current_user():
        return redirect(url_for("dashboard"))
    return redirect(url_for("login_page"))


@app.get("/login")
def login_page():
    if get_current_user():
        return redirect(url_for("dashboard"))
    return render_template("login.html")


@app.post("/login")
def login_submit():
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip().lower()
    preferred_location = request.form.get("preferred_location", SUPPORTED_LOCATIONS[0]["id"])

    if not name or not email or not EMAIL_PATTERN.match(email):
        return render_template(
            "login.html",
            error="Enter a valid name and email address to continue.",
            form_data={"name": name, "email": email, "preferred_location": preferred_location},
        ), 400

    preferred_location = get_location_by_id(preferred_location)["id"]
    stored_in_mongo = save_user_to_mongo(name, email, preferred_location)
    session["user"] = build_session_user(name, email, preferred_location, stored_in_mongo)
    return redirect(url_for("dashboard"))


@app.post("/logout")
def logout():
    session.clear()
    return redirect(url_for("login_page"))


@app.get("/dashboard")
def dashboard():
    user, redirect_response = require_user()
    if redirect_response:
        return redirect_response

    return render_template(
        "dashboard.html",
        user=user,
        locations=SUPPORTED_LOCATIONS,
        default_location=get_location_by_id(user.get("preferred_location", SUPPORTED_LOCATIONS[0]["id"])),
    )


@app.get("/api/session")
def session_info():
    user = get_current_user()
    if not user:
        return jsonify({"authenticated": False}), 401

    return jsonify(
        {
            "authenticated": True,
            "user": user,
            "locations": SUPPORTED_LOCATIONS,
            "mongo_available": is_mongo_available(),
        }
    )


@app.post("/api/location")
def update_location():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    payload = request.get_json(silent=True) or {}
    location_id = payload.get("locationId", user.get("preferred_location", SUPPORTED_LOCATIONS[0]["id"]))
    location = get_location_by_id(location_id)

    user["preferred_location"] = location["id"]
    user["stored_in_mongo"] = update_preferred_location(user["email"], location["id"])
    session["user"] = user

    return jsonify({"ok": True, "location": location, "mongo_available": is_mongo_available()})


@app.get("/api/predictions")
def live_predictions():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    location_id = request.args.get("location", user.get("preferred_location", SUPPORTED_LOCATIONS[0]["id"]))
    selected_location = get_location_by_id(location_id)

    try:
        payload = run_live_predictions(
            city=selected_location["city"],
            country=selected_location["country"],
            save_output=True,
        )
        update_preferred_location(user["email"], selected_location["id"])
        user["preferred_location"] = selected_location["id"]
        session["user"] = user
        return jsonify(enrich_forecast_cards(payload, selected_location))
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
