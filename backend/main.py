from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os

# Initialize FastAPI app
app = FastAPI(title="ML Benchmark Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create storage directories
os.makedirs("models", exist_ok=True)
os.makedirs("datasets", exist_ok=True)

# Basic response model
class BenchmarkResult(BaseModel):
    metrics: Dict[str, float]

# Root endpoint
@app.get("/")
def read_root():
    return {"status": "active", "message": "ML Benchmark Platform API is running"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/upload-model")
async def upload_model(file: UploadFile = File(...)):
    """
    Endpoint to upload machine learning model files.
    """
    try:
        file_path = f"models/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        return {"status": "success", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Endpoint to upload datasets (CSV format).
    """
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Dataset must be a CSV file")
        
        file_path = f"datasets/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        return {"status": "success", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/benchmark")
async def run_benchmark(model_id: str, dataset_id: str):
    """
    Endpoint to benchmark a model against a dataset.
    """
    try:
        # Load the uploaded model
        model_path = f"models/{model_id}"
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail=f"Model file '{model_id}' not found")
        model = joblib.load(model_path)

        # Load the uploaded dataset
        dataset_path = f"datasets/{dataset_id}"
        if not os.path.exists(dataset_path):
            raise HTTPException(status_code=404, detail=f"Dataset file '{dataset_id}' not found")
        
        # Load CSV dataset
        data = pd.read_csv(dataset_path)
        if data.shape[1] < 2:
            raise HTTPException(status_code=400, detail="Dataset must have at least one feature and one label column")
        X_test = data.iloc[:, :-1].values  # Features (all columns except the last)
        y_test = data.iloc[:, -1].values  # Labels (last column)

        # Make predictions
        y_pred = model.predict(X_test)

        # Calculate metrics
        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, average='weighted')),
            "recall": float(recall_score(y_test, y_pred, average='weighted')),
            "f1_score": float(f1_score(y_test, y_pred, average='weighted'))
        }

        return {"status": "success", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# For direct execution
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
