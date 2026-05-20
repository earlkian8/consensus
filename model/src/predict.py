import os
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

MODEL_PATH = "portion_predictor.joblib"
SAFETY_BUFFER = 0.05

def get_recommendation(target_date, item_name):
    """
    Loads the freshly minted model state from the night before 
    to make immediate inventory recommendations.
    """
    if not os.path.exists(MODEL_PATH):
        return None, "Error: System model file has not been initialized yet."
        
    try:
        # Load the latest binary saved by the retraining script
        model = joblib.load(MODEL_PATH)
        
        # Format target input parameters
        target_dt = pd.to_datetime(target_date)
        features = pd.DataFrame({'day_of_week': [target_dt.dayofweek]})
        
        # Predict demand baseline
        predicted_baseline = model.predict(features)[0]
        
        # Apply business safety margins and round up to a full portion
        final_recommendation = np.ceil(predicted_baseline * (1 + SAFETY_BUFFER))
        
        return int(final_recommendation), None
    except Exception as e:
        return None, str(e)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    target_date = data.get('date')
    item_name = data.get('item')
    
    if not target_date or not item_name:
        return jsonify({"error": "Missing 'date' or 'item' in request"}), 400
    
    recommendation, error = get_recommendation(target_date, item_name)
    
    if error:
        return jsonify({"error": error}), 500
    
    return jsonify({
        "date": target_date,
        "item": item_name,
        "recommended_portions": recommendation
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)
