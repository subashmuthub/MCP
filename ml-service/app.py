import os
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# A validated model trained on real, labelled equipment history must be
# installed at MODEL_PATH. Predictions are disabled when it is unavailable.
try:
    import joblib
    model_path = os.environ.get('MODEL_PATH', os.path.join(os.path.dirname(__file__), 'model.joblib'))
    bundle = joblib.load(model_path)
    model = bundle['model']
    scaler = bundle['scaler']
    CATEGORY_MAP = bundle.get('category_map', {0: 'Healthy', 1: 'Needs Attention', 2: 'Critical'})
    ML_READY = True
    print(f'[ML Service] Loaded validated model from {model_path}.')
except Exception as e:
    ML_READY = False
    print(f'[ML Service] No validated model loaded; predictions disabled: {e}')


@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'equipsense-ml', 'ml_ready': ML_READY})


@app.route('/predict', methods=['POST'])
def predict():
    if not ML_READY:
        return jsonify({'message': 'No validated model trained on real equipment history is available.'}), 503

    data = request.get_json(force=True) or {}
    fields = ['usageHours', 'failureCount', 'temperature', 'vibration', 'age']
    if any(data.get(field) is None for field in fields):
        return jsonify({'message': 'All real equipment measurements are required.'}), 422
    values = [float(data[field]) for field in fields]
    features = np.array([values])
    features_scaled = scaler.transform(features)
    label = int(model.predict(features_scaled)[0])
    proba = model.predict_proba(features_scaled)[0]
    risk_score = round(float(proba[1] * 50 + proba[2] * 100), 1)
    category = CATEGORY_MAP[label]

    return jsonify({
        'riskScore': risk_score,
        'status': category,
        'riskCategory': category,
        'predictedDaysToFailure': None,
        'mlReady': ML_READY,
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
