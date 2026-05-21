import os
import joblib
import numpy as np
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
from sklearn.ensemble import RandomForestRegressor
from sklearn.dummy import DummyRegressor
from dotenv import load_dotenv

load_dotenv()

# Configuration
MODELS_DIR = "models"
SCALING_FACTOR = 1.08
DATABASE_URL = os.getenv("DATABASE_URL")
MIN_SAMPLES = 4
FEATURE_COLUMNS = ["day_of_week", "week_of_year", "month", "is_weekend"]

os.makedirs(MODELS_DIR, exist_ok=True)

def fetch_updated_data():
    if not DATABASE_URL:
        return []
    query = """
    SELECT 
        pp.date, 
        p.name as item, 
        pd.amount as portions_created, 
        COALESCE(pd.excess, 0) as waste 
    FROM production_details pd
    JOIN production_plans pp ON pd.pp_fk = pp.id
    JOIN products p ON pd.p_fk = p.id
    WHERE pp.is_ready_analysis = TRUE
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            return cur.fetchall()
    except Exception as e:
        print(f"Error: {e}")
        return []
    finally:
        if 'conn' in locals() and conn: conn.close()

def run_retraining_pipeline():
    print("--- Starting Retraining Pipeline ---")
    raw_logs = fetch_updated_data()
    if not raw_logs:
        return {"status": "error", "message": "No data found"}

    df = pd.DataFrame(raw_logs)
    print(f"[Retrain] Fetched {len(df)} rows for {df['item'].nunique()} items")
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.dayofweek
    df['week_of_year'] = df['date'].dt.isocalendar().week.astype(int)
    df['month'] = df['date'].dt.month
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    df['adjusted_demand'] = np.where(
        df['waste'] == 0,
        df['portions_created'].astype(float) * SCALING_FACTOR,
        df['portions_created'].astype(float) - df['waste'].astype(float),
    )
    df['adjusted_demand'] = df['adjusted_demand'].clip(lower=1)

    items = df['item'].unique()
    results = []
    
    for item in items:
        item_df = df[df['item'] == item].copy()
        if len(item_df) < 1: 
            continue

        X = item_df[FEATURE_COLUMNS]
        y = item_df['adjusted_demand']

        if len(item_df) < MIN_SAMPLES:
            model = DummyRegressor(strategy="mean")
        else:
            model = RandomForestRegressor(
                n_estimators=200,
                random_state=42,
                min_samples_leaf=2,
            )
        model.fit(X, y)
        
        model_path = os.path.join(MODELS_DIR, f"{item}.joblib")
        joblib.dump(model, model_path)
        results.append(item)
    
    print(f"[Retrain] Successfully trained {len(results)} models")
    return {"status": "success", "trained_items": results}

if __name__ == "__main__":
    run_retraining_pipeline()
