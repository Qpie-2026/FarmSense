from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

# Load model and helpers
model_blob = joblib.load("models.pkl")
lr_model = model_blob.get("lr_model")
rf_model = model_blob.get("rf_model")
features = model_blob.get("features", [])
le_commodity = model_blob.get("le_commodity")
le_variety = model_blob.get("le_variety")
le_grade = model_blob.get("le_grade")

# Load data set to use latest row per commodity / market
df = pd.read_csv("Nagpur_data.csv", parse_dates=["Arrival_Date"], dayfirst=True)
df = df.sort_values("Arrival_Date")

def season_from_month(m):
    if m in [12, 1, 2]:
        return 1
    if m in [3, 4, 5]:
        return 2
    if m in [6, 7, 8]:
        return 3
    return 4

# Default row for prediction (commodity, optional market)
def get_template_row(commodity, market=None):
    o = df[df["Commodity"].str.lower() == commodity.lower()]
    if market:
        cand = o[o["Market"].str.lower() == market.lower()]
        if not cand.empty:
            o = cand
    if o.empty:
        o = df
    row = o.iloc[-1]
    var = row.get("Variety", "Other")
    if le_variety is not None and var not in le_variety.classes_:
        var = le_variety.classes_[0]
    grade = row.get("Grade", "FAQ")
    if le_grade is not None and grade not in le_grade.classes_:
        grade = le_grade.classes_[0]
    return {
        "date": row["Arrival_Date"],
        "Commodity": row["Commodity"],
        "Variety": var,
        "Grade": grade,
        "Min_Price": float(row.get("Min_Price", 1000)),
        "Max_Price": float(row.get("Max_Price", 1200)),
        "Modal_Price": float(row.get("Modal_Price", 1100)),
    }

@app.route("/")
def home():
    return "ML API Running 🚀"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json or {}
        commodity = (data.get("commodity") or "Tomato").strip()
        days = int(data.get("days", 1))
        days = max(1, min(days, 30))

        template = get_template_row(commodity, data.get("market"))
        start_date = pd.to_datetime(template["date"])
        predictions = []

        if lr_model is None or rf_model is None:
            return jsonify({"error": "Model not loaded"}), 500

        for offset in range(days):
            current_date = start_date + pd.Timedelta(days=offset)
            month = current_date.month
            year = current_date.year
            day_of_year = current_date.dayofyear
            season = season_from_month(month)

            c_enc = le_commodity.transform([commodity])[0] if le_commodity is not None and commodity in le_commodity.classes_ else 0
            v_enc = le_variety.transform([template["Variety"]])[0] if le_variety is not None and template["Variety"] in le_variety.classes_ else 0
            g_enc = le_grade.transform([template["Grade"]])[0] if le_grade is not None and template["Grade"] in le_grade.classes_ else 0

            row = {
                "Commodity_enc": c_enc,
                "Variety_enc": v_enc,
                "Grade_enc": g_enc,
                "month": float(month),
                "year": float(year),
                "day_of_year": float(day_of_year),
                "season": float(season),
                "Min_Price": float(template["Min_Price"]),
                "Max_Price": float(template["Max_Price"]),
            }

            X = np.array([row[f] for f in features]).reshape(1, -1)
            y_lr = float(lr_model.predict(X)[0])
            y_rf = float(rf_model.predict(X)[0])
            y_pred = float((y_lr + y_rf) / 2.0)

            predictions.append(max(0.0, y_pred))

            template["Min_Price"] = max(1.0, y_pred * 0.95)
            template["Max_Price"] = max(template["Min_Price"], y_pred * 1.05)
        
        return jsonify({
            "commodity": commodity,
            "predictions": predictions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)