# 🌾 FarmSense — AI-ML Based Price Prediction for Agri-Horticultural Commodities

> *Empowering farmers and policymakers with data-driven commodity price forecasting*

---

## 📌 One-Line Description
An intelligent ML-powered system that predicts agri-horticultural commodity prices using historical market data and external factors — helping farmers decide **when to sell** and helping policymakers **stabilize markets**.

---

## 🚨 Problem
Unpredictable market fluctuations cause heavy post-harvest financial losses for farmers across Maharashtra. Without accurate forecasting tools:
- Farmers sell at wrong time → **heavy losses**
- Government agencies struggle to **stabilize prices**
- Decisions rely on **guesswork, not data**

---

## ✅ Solution
**MandAI** bridges this gap by:
- 📊 Analyzing historical AGMARKNET price data
- 🤖 Predicting short-term and long-term commodity prices
- 🌦️ Incorporating external factors like weather and seasonality
- 📈 Providing an easy-to-use dashboard for farmers and policymakers

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 📉 **Price Forecast** | Predict next 7–30 day commodity prices |
| 🏆 **Best Time to Sell** | Recommends optimal selling window |
| 🌧️ **External Factor Analysis** | Shows impact of rainfall & season on prices |
| 🤖 **Model Comparison** | Linear Regression vs Random Forest accuracy |
| 🗺️ **Mandi-wise Analysis** | Compare prices across Maharashtra mandis |
| 📲 **Simple Dashboard** | Farmer-friendly Streamlit interface |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | Python 3.10+ |
| **ML Models** | Linear Regression, Random Forest, ARIMA |
| **Data Processing** | Pandas, NumPy |
| **Visualization** | Matplotlib, Seaborn, Plotly |
| **Dashboard** | Streamlit |
| **Cloud** | AWS / Firebase |

---

## 📂 Dataset
- **Source:** [AGMARKNET — data.gov.in](https://data.gov.in)
- **Coverage:** Maharashtra Mandis (Lasalgaon, Pune, Nashik)
- **Commodities:** Onion 🧅, Tomato 🍅, Potato 🥔
- **Features:** Date, Commodity, Market, Min Price, Max Price, Modal Price

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/FarmSense.git
cd FarmSense
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the dashboard
```bash
streamlit run app.py
```

---

## 📁 Project Structure

```
FarmSense/
│
├── data/
│   ├── raw/                  # Raw AGMARKNET CSV files
│   └── processed/            # Cleaned datasets
│
├── notebooks/
│   ├── 01_EDA.ipynb          # Exploratory Data Analysis
│   ├── 02_preprocessing.ipynb
│   └── 03_model_training.ipynb
│
├── models/
│   ├── linear_regression.pkl
│   └── random_forest.pkl
│
├── app.py                    # Streamlit dashboard
├── requirements.txt
└── README.md
```

---

## 📊 Model Performance

| Model | R² Score | MAE |
|-------|----------|-----|
| Linear Regression | ~0.82 | ₹120/quintal |
| Random Forest | ~0.91 | ₹85/quintal |

---

## 👥 Team

Built with ❤️ at **HackBlitz Season 3** — JIT ACM Student Chapter

---

## 📜 License
MIT License — feel free to use and contribute!

---

> *"Don't guess the market. Predict it."* 🌾