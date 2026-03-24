import pandas as pd
import numpy as np
import requests
import os
import joblib

from sklearn.metrics import mean_absolute_error, mean_squared_error
from xgboost import XGBRegressor

# ==============================
# CONFIG
# ==============================
DATA_PATH = "./data/master_clean.csv"
MODEL_PATH = "./data/xgb_model.pkl"

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# ==============================
# WEATHER FUNCTION
# ==============================
def get_weather(city="Pune"):
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
        res = requests.get(url, timeout=10)
        data = res.json()

        return {
            "temp": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "rain": data.get("rain", {}).get("1h", 0)
        }
    except:
        print("⚠️ Weather API failed, using fallback values")
        return {"temp": 30, "humidity": 50, "rain": 0}

# ==============================
# LOAD DATA
# ==============================
print("\n📂 Loading dataset...")
df = pd.read_csv(DATA_PATH)

# Drop missing targets
df = df.dropna(subset=["target_7d"])

# ==============================
# ADD WEATHER DATA
# ==============================
print("🌦 Fetching weather data...")
weather = get_weather("Pune")

df["temp"] = weather["temp"]
df["humidity"] = weather["humidity"]
df["rain"] = weather["rain"]

# ==============================
# FEATURE SELECTION
# ==============================
FEATURES = [
    "modal_price",
    "lag_1d", "lag_3d", "lag_7d",
    "roll_mean_7d", "roll_std_7d",
    "month", "day_of_week",
    "is_harvest_season",
    "price_spread", "spread_pct",
    "temp", "humidity", "rain"
]

FEATURES = [f for f in FEATURES if f in df.columns]

X = df[FEATURES]
y = df["target_7d"]

# ==============================
# TRAIN-TEST SPLIT (TIME BASED)
# ==============================
split = int(len(df) * 0.8)

X_train, X_test = X.iloc[:split], X.iloc[split:]
y_train, y_test = y.iloc[:split], y.iloc[split:]

# ==============================
# MODEL TRAINING
# ==============================
print("\n🤖 Training XGBoost model...")

model = XGBRegressor(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

model.fit(X_train, y_train)

# ==============================
# EVALUATION
# ==============================
preds = model.predict(X_test)

mae = mean_absolute_error(y_test, preds)
rmse = np.sqrt(mean_squared_error(y_test, preds))

print("\n📊 Model Performance:")
print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")

# ==============================
# SAVE MODEL
# ==============================
joblib.dump(model, MODEL_PATH)
print(f"\n✅ Model saved at: {MODEL_PATH}")

# ==============================
# QUICK REAL-TIME PREDICTION
# ==============================
print("\n🚀 Running sample prediction...")

commodity = "Tomato"

latest = df[df["commodity"] == commodity].iloc[-1:].copy()

# Update with real-time weather
latest["temp"] = weather["temp"]
latest["humidity"] = weather["humidity"]
latest["rain"] = weather["rain"]

X_live = latest[FEATURES]

prediction = model.predict(X_live)[0]

print("\n🌾 Commodity:", commodity)
print("📍 Location: Pune")
print(f"🌦 Weather: {weather}")
print(f"💰 Predicted Price (7 days ahead): ₹{prediction:.2f}")