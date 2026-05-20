import os
import joblib
import numpy as np
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import root_mean_squared_error
from dotenv import load_dotenv

load_dotenv()

# Configuration
MODEL_PATH = "portion_predictor.joblib"
SCALING_FACTOR = 1.15  # 15% boost for zero-waste days (capped demand)
SAFETY_BUFFER = 0.05   # 5% extra portions to protect sales margins
DATABASE_URL = os.getenv("DATABASE_URL")

def fetch_updated_data():
    """
    Pulls data from the database.
    """
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in environment.")
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
        print(f"Error fetching data from database: {e}")
        return []
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def preprocess_and_pipeline(raw_data):
    """
    Cleans data and applies the zero-waste demand adjustments.
    """
    df = pd.DataFrame(raw_data)
    if df.empty:
        return df
        
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.dayofweek
    
    # Apply the Capped Demand rule safely
    df['adjusted_demand'] = np.where(
        df['waste'] == 0,
        df['portions_created'].astype(float) * SCALING_FACTOR, # Scale up if sold out
        df['portions_created'].astype(float) - df['waste'].astype(float)     # True demand if waste exists
    )
    return df

def run_retraining_pipeline():
    print("--- Starting Daily Retraining Pipeline ---")
    
    # 1. Fetch and Preprocess Data
    raw_logs = fetch_updated_data()
    if not raw_logs:
        print("No data found to train. Make sure production plans are marked as ready for analysis.")
        return

    df = preprocess_and_pipeline(raw_logs)
    
   
    items = df['item'].unique()
    
    for item in items:
        print(f"Training model for item: {item}")
        item_df = df[df['item'] == item].copy()
        
        if len(item_df) < 2:
            print(f"Skipping {item}: Not enough historical data to train yet.")
            continue

        X = item_df[['day_of_week']]
        y = item_df['adjusted_demand']
        
        # 2. Train and Validate
        new_model = RandomForestRegressor(n_estimators=50, random_state=42)
        new_model.fit(X, y)
        
        predictions = new_model.predict(X)
        rmse = root_mean_squared_error(y, predictions)
        print(f"Validation complete for {item}. RMSE: {rmse:.2f}")
        
       
        joblib.dump(new_model, MODEL_PATH)
        print(f"Success: Model state saved to '{MODEL_PATH}'")

if __name__ == "__main__":
    run_retraining_pipeline()
