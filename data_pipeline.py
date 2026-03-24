"""
Agri-Commodity Price Prediction -- Data Pipeline
=================================================
Sources:
  1. data.gov.in Live API  -> real-time mandi prices (paginated)
  2. mandi_2023_2025.csv   -> Kaggle historical 2023-2025  (optional)
  3. agmarknet.csv         -> Kaggle Agmarknet Oct24-Aug25 (optional)

Output:
  ./data/master_clean.csv           -- merged, cleaned, feature-engineered
  ./data/<commodity>_timeseries.csv -- one per commodity for ARIMA
  ./data/eda_report.txt             -- summary statistics

HOW TO GET YOUR API KEY:
  1. Go to https://data.gov.in
  2. Register / Login -> My Account -> API Keys -> Generate Key
  3. Add to .env:  DATAGOV_API_KEY=your_key_here

RESOURCE ID (do NOT change):
  9ef84268-d588-465a-a308-a864a43d0070
  "Current Daily Price of Various Commodities from Various Markets (Mandi)"
  Fields: state, district, market, commodity, variety, grade,
          arrival_date, min_price, max_price, modal_price
"""

import os
import time
import warnings
import requests
import pandas as pd
import numpy as np
from datetime import datetime
from dotenv import load_dotenv

warnings.filterwarnings("ignore")

# Load keys from .env file
load_dotenv()

# ─────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────

API_KEY         = os.getenv("DATAGOV_API_KEY", "")
OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY", "")

DATA_DIR      = "./data"
OUTPUT_PATH   = os.path.join(DATA_DIR, "master_clean.csv")
EDA_PATH      = os.path.join(DATA_DIR, "eda_report.txt")

MANDI_CSV     = os.path.join(DATA_DIR, "Mandi.csv")
AGMARKNET_CSV = os.path.join(DATA_DIR, "agmarknet.csv")

TARGET_COMMODITIES = ["Tomato", "Onion", "Potato", "Wheat", "Dry Chillies"]
TARGET_STATES = [
    "Maharashtra", "Punjab", "Uttar Pradesh",
    "Karnataka", "Andhra Pradesh", "Madhya Pradesh"
]


# ─────────────────────────────────────────────────────────
# HELPER -- standardise any dataframe to common schema
# ─────────────────────────────────────────────────────────

# All possible source column names mapped to our standard names
UNIVERSAL_RENAME = {
    # state
    "State": "state", "state": "state", "STATE": "state",
    # district
    "District": "district", "district": "district",
    "DistrictName": "district", "District Name": "district",
    "District_Name": "district", "DISTRICT": "district",
    # market
    "Market": "market", "market": "market",
    "MarketName": "market", "Market Name": "market",
    "Market_Name": "market", "MARKET": "market",
    # commodity
    "Commodity": "commodity", "commodity": "commodity", "COMMODITY": "commodity",
    # variety
    "Variety": "variety", "variety": "variety", "VARIETY": "variety",
    # grade
    "Grade": "grade", "grade": "grade", "GRADE": "grade",
    # date (API uses arrival_date; CSVs use Price Date or Arrival_Date)
    "arrival_date": "date", "Arrival_Date": "date",
    "Price Date": "date", "PriceDate": "date",
    "Date": "date", "date": "date", "PRICE_DATE": "date",
    # prices -- plain names
    "Min_Price": "min_price", "min_price": "min_price",
    "Min Price": "min_price", "MIN_PRICE": "min_price",
    "Max_Price": "max_price", "max_price": "max_price",
    "Max Price": "max_price", "MAX_PRICE": "max_price",
    "Modal_Price": "modal_price", "modal_price": "modal_price",
    "Modal Price": "modal_price", "MODAL_PRICE": "modal_price",
    # prices -- with units (Agmarknet Kaggle)
    "Min Price (Rs./Quintal)":   "min_price",
    "Max Price (Rs./Quintal)":   "max_price",
    "Modal Price (Rs./Quintal)": "modal_price",
}

STANDARD_COLS = [
    "date", "state", "district", "market", "commodity",
    "variety", "grade", "min_price", "max_price", "modal_price", "source"
]


def to_standard(df: pd.DataFrame, source_name: str) -> pd.DataFrame:
    """Rename columns, fill missing optional cols, select standard schema."""
    df = df.rename(columns=UNIVERSAL_RENAME)
    for col in ["state", "district", "market", "variety", "grade"]:
        if col not in df.columns:
            print(f"  Note: '{col}' not in {source_name} -- filling with NaN")
            df[col] = np.nan
    df["source"] = source_name
    present = [c for c in STANDARD_COLS if c in df.columns]
    return df[present]


# ─────────────────────────────────────────────────────────
# STEP 1A -- data.gov.in LIVE API (paginated)
# ─────────────────────────────────────────────────────────

RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL    = f"https://api.data.gov.in/resource/{RESOURCE_ID}"


def fetch_datagov_api(
    commodities: list = None,
    states: list = None,
    limit_per_page: int = 1000,
    max_pages: int = 50,
    timeout: int = 60,
    max_retries: int = 3,
) -> pd.DataFrame:
    """
    Paginated fetch from data.gov.in mandi price API.

    max_pages controls volume:
      10  -> ~10,000 records  (fast, good for testing)
      50  -> ~50,000 records  (recommended for hackathon)
      200 -> ~200,000 records (comprehensive, ~5 min)

    Retries up to max_retries times on timeout before giving up.
    """
    if not API_KEY:
        print("  No DATAGOV_API_KEY in .env -- skipping live API fetch.")
        print("  Get key at: https://data.gov.in -> My Account -> API Keys")
        return pd.DataFrame()

    print("\n-- Fetching from data.gov.in API --")

    filters = {}
    if commodities:
        filters["filters[commodity]"] = ",".join(commodities)
    if states:
        filters["filters[state]"] = ",".join(states)

    all_records = []
    offset = 0

    for page in range(1, max_pages + 1):
        params = {
            "api-key": API_KEY,
            "format":  "json",
            "offset":  offset,
            "limit":   limit_per_page,
            **filters,
        }

        # Retry loop for timeouts
        data = None
        for attempt in range(1, max_retries + 1):
            try:
                resp = requests.get(BASE_URL, params=params, timeout=timeout)
                resp.raise_for_status()
                data = resp.json()
                break
            except requests.exceptions.Timeout:
                wait = attempt * 5
                print(f"  Page {page} attempt {attempt}: timed out -- waiting {wait}s...")
                time.sleep(wait)
            except requests.exceptions.HTTPError as e:
                print(f"  HTTP {resp.status_code}: {e}")
                print(f"  Response body: {resp.text[:300]}")
                return pd.DataFrame(all_records) if all_records else pd.DataFrame()
            except Exception as e:
                print(f"  Unexpected error on page {page}: {e}")
                return pd.DataFrame(all_records) if all_records else pd.DataFrame()

        if data is None:
            print(f"  Page {page}: failed after {max_retries} retries -- stopping.")
            break

        records = data.get("records", [])
        if not records:
            print(f"  No more records at offset {offset}. Fetch complete.")
            break

        all_records.extend(records)
        total = data.get("total", "?")
        offset += limit_per_page

        print(f"  Page {page:>3} | fetched {len(all_records):>7} | total available: {total}")
        time.sleep(0.3)

        if isinstance(total, int) and len(all_records) >= total:
            break

    if not all_records:
        print("  No records returned from API.")
        return pd.DataFrame()

    df = pd.DataFrame(all_records)
    print(f"  Actual API columns: {list(df.columns)}")
    df = to_standard(df, "datagov_api")
    print(f"  Total records fetched: {len(df):,}")
    return df


# ─────────────────────────────────────────────────────────
# STEP 1B -- KAGGLE CSVs (optional historical supplement)
# ─────────────────────────────────────────────────────────

def load_csv(path: str, label: str) -> pd.DataFrame:
    """Generic robust CSV loader -- auto-detects and renames columns."""
    if not os.path.exists(path):
        print(f"  {path} not found -- skipping {label}.")
        return pd.DataFrame()

    print(f"\n-- Loading {label} --")
    df = pd.read_csv(path, low_memory=False)
    print("Columns before dedup:", df.columns)
    # Remove any duplicate columns first
    df = df.loc[:, ~df.columns.duplicated()]
    print(f"  Actual columns: {list(df.columns)}")

    df = to_standard(df, label)
    print(f"  Rows loaded: {len(df):,}")
    return df


# ─────────────────────────────────────────────────────────
# STEP 2 -- MERGE ALL SOURCES
# ─────────────────────────────────────────────────────────

def merge_all(*dfs) -> pd.DataFrame:
    valid = [df for df in dfs if df is not None and len(df) > 0]
    if not valid:
        raise ValueError(
            "No data loaded from any source.\n"
            "Check DATAGOV_API_KEY in .env and CSV paths in CONFIG."
        )
    merged = pd.concat(valid, ignore_index=True)
    print(f"\n-- Merged total rows (all sources): {len(merged):,} --")
    for src, count in merged["source"].value_counts().items():
        print(f"   {src:<25} {count:>8,} rows")
    return merged


# ─────────────────────────────────────────────────────────
# STEP 3 -- CLEAN
# ─────────────────────────────────────────────────────────

def clean(df: pd.DataFrame) -> pd.DataFrame:
    print("\n-- Cleaning --")

    # 1. Parse dates
    df["date"] = pd.to_datetime(df["date"], dayfirst=True, errors="coerce")
    dropped = len(df) - df["date"].notna().sum()
    df = df.dropna(subset=["date"])
    print(f"  Dropped {dropped:,} rows with unparseable dates")

    # 2. Standardise text
    for col in ["commodity", "state", "district", "market", "variety"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.title()

    # 3. Filter
    df = df[df["commodity"].isin(TARGET_COMMODITIES)]
    df = df[df["state"].isin(TARGET_STATES)]
    print(f"  Rows after commodity + state filter: {len(df):,}")

    if len(df) == 0:
        print("  WARNING: Zero rows remain after filtering!")
        return df

    # 4. Convert prices
    for col in ["min_price", "max_price", "modal_price"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # 5. Clean price data
    df = df.dropna(subset=["modal_price"])
    df = df[df["modal_price"] > 0]

    if "min_price" in df.columns and "max_price" in df.columns:
        df = df[df["min_price"] <= df["max_price"]]

    # 6. Outlier removal (SAFE)
    def remove_outliers(grp):
        lo = grp["modal_price"].quantile(0.01)
        hi = grp["modal_price"].quantile(0.99)
        return grp[(grp["modal_price"] >= lo) & (grp["modal_price"] <= hi)]
        df = df.groupby("commodity", group_keys=False).apply(remove_outliers).reset_index(drop=True)
        print(f"  Rows after outlier removal: {len(df):,}")

    # 7. Deduplication (SAFE)
    required_cols = ["date", "state", "market", "commodity", "modal_price"]
    available_cols = [col for col in required_cols if col in df.columns]

    df = df.drop_duplicates(subset=available_cols)
    print(f"  Rows after deduplication: {len(df):,}")

    # 8. Final sort
    df = df.sort_values(["commodity", "state", "date"]).reset_index(drop=True)

    return df

# ─────────────────────────────────────────────────────────
# STEP 4 -- FEATURE ENGINEERING
# ─────────────────────────────────────────────────────────

def add_features(df: pd.DataFrame) -> pd.DataFrame:
    print("\n-- Engineering features --")
    df = df.sort_values(["commodity", "state", "market", "date"])
    grp = df.groupby(["commodity", "state", "market"])

    for lag in [1, 3, 7, 14, 30]:
        df[f"lag_{lag}d"] = grp["modal_price"].shift(lag)

    for w in [7, 14, 30]:
        df[f"roll_mean_{w}d"] = grp["modal_price"].transform(
            lambda x: x.shift(1).rolling(w, min_periods=1).mean()
        )
        df[f"roll_std_{w}d"] = grp["modal_price"].transform(
            lambda x: x.shift(1).rolling(w, min_periods=1).std()
        )

    df["pct_change_7d"]  = grp["modal_price"].transform(lambda x: x.pct_change(7))
    df["pct_change_30d"] = grp["modal_price"].transform(lambda x: x.pct_change(30))

    if "max_price" in df.columns and "min_price" in df.columns:
        df["price_spread"] = df["max_price"] - df["min_price"]
        df["spread_pct"]   = df["price_spread"] / df["modal_price"]

    df["month"]        = df["date"].dt.month
    df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)
    df["day_of_week"]  = df["date"].dt.dayofweek
    df["quarter"]      = df["date"].dt.quarter
    df["year"]         = df["date"].dt.year
    df["month_sin"]    = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"]    = np.cos(2 * np.pi * df["month"] / 12)

    harvest = {
        "Tomato":       [11, 12, 1, 2, 3],
        "Onion":        [11, 12, 1, 2, 3, 4],
        "Potato":       [1, 2, 3, 4],
        "Wheat":        [3, 4, 5],
        "Dry Chillies": [12, 1, 2, 3],
    }
    df["is_harvest_season"] = df.apply(
        lambda r: int(r["month"] in harvest.get(r["commodity"], [])), axis=1
    )

    df["target_7d"]  = grp["modal_price"].shift(-7)
    df["target_30d"] = grp["modal_price"].shift(-30)

    print(f"  Final shape: {df.shape}")
    return df


# ─────────────────────────────────────────────────────────
# STEP 5 -- SAVE + EDA REPORT
# ─────────────────────────────────────────────────────────

def save_and_report(df: pd.DataFrame):
    os.makedirs(DATA_DIR, exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"\n  Saved: {OUTPUT_PATH}")

    lines = [
        "=" * 60,
        "EDA REPORT -- master_clean.csv",
        "=" * 60,
        f"Generated  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Total rows : {len(df):,}",
        f"Date range : {df['date'].min().date()} to {df['date'].max().date()}",
        f"Sources    : {df['source'].value_counts().to_dict()}",
        "",
    ]
    for commodity in sorted(df["commodity"].unique()):
        sub = df[df["commodity"] == commodity]
        lines += [
            f"-- {commodity} --",
            f"   Rows       : {len(sub):,}",
            f"   Date range : {sub['date'].min().date()} to {sub['date'].max().date()}",
            f"   States     : {sorted(sub['state'].unique())}",
            f"   Modal price: min={sub['modal_price'].min():.0f}  "
            f"mean={sub['modal_price'].mean():.0f}  "
            f"max={sub['modal_price'].max():.0f}  "
            f"std={sub['modal_price'].std():.0f}",
            "",
        ]

    report = "\n".join(lines)
    with open(EDA_PATH, "w") as f:
        f.write(report)
    print(report)


# ─────────────────────────────────────────────────────────
# STEP 6 -- PER-COMMODITY TIME SERIES CSV (for ARIMA)
# ─────────────────────────────────────────────────────────

def export_per_commodity(df: pd.DataFrame):
    print("\n-- Exporting per-commodity time series for ARIMA --")
    for commodity in sorted(df["commodity"].unique()):
        sub = df[df["commodity"] == commodity]
        ts = (
            sub.groupby("date")["modal_price"]
            .mean()
            .rename("avg_modal_price")
            .sort_index()
        )
        ts = ts.asfreq("D").ffill()
        fname = commodity.lower().replace(" ", "_") + "_timeseries.csv"
        fpath = os.path.join(DATA_DIR, fname)
        ts.to_csv(fpath)
        print(f"  Saved: {fname:<38} "
              f"{len(ts)} days "
              f"({ts.index.min().date()} to {ts.index.max().date()})")


# ─────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("AGRI COMMODITY DATA PIPELINE")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # 1A. Live API
    df_api = fetch_datagov_api(
        commodities=TARGET_COMMODITIES,
        states=TARGET_STATES,
        limit_per_page=1000,
        max_pages=50,
        timeout=60,
        max_retries=3,
    )

    # 1B. Kaggle CSVs (skip gracefully if not present)
    df_mandi  = load_csv(MANDI_CSV,     "mandi_kaggle")
    df_agmark = load_csv(AGMARKNET_CSV, "agmarknet_kaggle")

    # 2. Merge
    df = merge_all(df_api, df_mandi, df_agmark)

    # 3. Clean
    df = clean(df)

    # 4. Feature engineering
    df = add_features(df)

    # 5. Save + EDA report
    save_and_report(df)

    # 6. Per-commodity time series for ARIMA
    export_per_commodity(df)

    print("\nPipeline complete! Next step: model_training.py")
    print("=" * 60)