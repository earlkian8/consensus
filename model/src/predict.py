import os
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from retrain_model import run_retraining_pipeline

app = Flask(__name__)

MODELS_DIR = "models"
SAFETY_BUFFER = 0.03
FEATURE_COLUMNS = ["day_of_week", "week_of_year", "month", "is_weekend"]

def build_features(target_date):
    target_dt = pd.to_datetime(target_date)
    return pd.DataFrame({
        "day_of_week": [target_dt.dayofweek],
        "week_of_year": [int(target_dt.isocalendar().week)],
        "month": [target_dt.month],
        "is_weekend": [1 if target_dt.dayofweek >= 5 else 0],
    }, columns=FEATURE_COLUMNS)

def get_recommendation(target_date, item_name):
    model_path = os.path.join(MODELS_DIR, f"{item_name}.joblib")
    
    if not os.path.exists(model_path):
        return None, f"No specific model for '{item_name}' yet."
        
    try:
        model = joblib.load(model_path)
        features = build_features(target_date)
        
        predicted_baseline = model.predict(features)[0]
        final_recommendation = np.ceil(predicted_baseline * (1 + SAFETY_BUFFER))
        
        return max(1, int(final_recommendation)), None
    except Exception as e:
        return None, str(e)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'date' not in data or 'item' not in data:
        return jsonify({"error": "Missing 'date' or 'item'"}), 400
    
    recommendation, error = get_recommendation(data['date'], data['item'])
    if error:
        return jsonify({"error": error}), 404
    
    return jsonify({
        "date": data['date'],
        "item": data['item'],
        "recommended_portions": recommendation
    })

@app.route('/train', methods=['POST'])
def train():
    result = run_retraining_pipeline()
    return jsonify(result)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)
