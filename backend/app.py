from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import joblib
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# File storage directories
MODEL_DIR = "models"
DATASET_DIR = "datasets"
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

# Upload model endpoint
@app.route('/upload-model', methods=['POST'])
def upload_model():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(MODEL_DIR, filename)
    file.save(file_path)
    return jsonify({"status": "success", "filename": filename}), 200

# Upload dataset endpoint
@app.route('/upload-dataset', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Invalid file type. Only CSV files are allowed"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(DATASET_DIR, filename)
    file.save(file_path)
    return jsonify({"status": "success", "filename": filename}), 200

# Run benchmark endpoint
@app.route('/benchmark', methods=['POST'])
def run_benchmark():
    model_id = request.args.get('model_id')
    dataset_id = request.args.get('dataset_id')

    if not model_id or not dataset_id:
        return jsonify({"error": "Both model_id and dataset_id are required"}), 400

    try:
        # Load model
        model_path = os.path.join(MODEL_DIR, model_id)
        if not os.path.exists(model_path):
            return jsonify({"error": f"Model file '{model_id}' not found"}), 404
        model = joblib.load(model_path)

        # Load dataset
        dataset_path = os.path.join(DATASET_DIR, dataset_id)
        if not os.path.exists(dataset_path):
            return jsonify({"error": f"Dataset file '{dataset_id}' not found"}), 404
        data = np.genfromtxt(dataset_path, delimiter=',', skip_header=1)
        X_test, y_test = data[:, :-1], data[:, -1]

        # Make predictions
        y_pred = model.predict(X_test)

        # Calculate metrics
        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, average='weighted', zero_division=0)),
            "recall": float(recall_score(y_test, y_pred, average='weighted', zero_division=0)),
            "f1_score": float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
        }

        return jsonify({"status": "success", "metrics": metrics}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Main entry point
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
