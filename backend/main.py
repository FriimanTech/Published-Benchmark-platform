# Import necessary modules and libraries
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

# Set the right port and allowed origins
port = int(os.getenv("PORT", 8000))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Initialize FastAPI app
app = FastAPI(
    title="ML Benchmark Platform",
    description="API for machine learning model benchmarking",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create storage directories
STORAGE_DIR = os.getenv("STORAGE_DIR", ".")
MODELS_DIR = os.path.join(STORAGE_DIR, "models")
DATASETS_DIR = os.path.join(STORAGE_DIR, "datasets")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATASETS_DIR, exist_ok=True)

class BenchmarkResult(BaseModel):
    metrics: Dict[str, float]

@app.get("/")
def read_root():
    return {
        "status": "active",
        "message": "ML Benchmark Platform API is running",
        "version": "1.0.0",
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "development")
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "storage": {
            "models": os.path.exists(MODELS_DIR),
            "datasets": os.path.exists(DATASETS_DIR)
        }
    }

@app.post("/upload-model")
async def upload_model(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.pkl'):
            raise HTTPException(status_code=400, detail="Model file must be a pkl file")
        
        file_path = os.path.join(MODELS_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "status": "success",
            "filename": file.filename,
            "size": os.path.getsize(file_path)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Dataset must be a CSV file")
        
        file_path = os.path.join(DATASETS_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "status": "success",
            "filename": file.filename,
            "size": os.path.getsize(file_path)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/benchmark")
async def run_benchmark(model_id: str, dataset_id: str):
    try:
        model_path = os.path.join(MODELS_DIR, model_id)
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail=f"Model file '{model_id}' not found")
        
        model = joblib.load(model_path)

        dataset_path = os.path.join(DATASETS_DIR, dataset_id)
        if not os.path.exists(dataset_path):
            raise HTTPException(status_code=404, detail=f"Dataset file '{dataset_id}' not found")
        
        data = pd.read_csv(dataset_path)
        
        if data.shape[1] < 2:
            raise HTTPException(
                status_code=400,
                detail="Dataset must have at least one feature and one label column"
            )
        
        X_test = data.iloc[:, :-1].values
        y_test = data.iloc[:, -1].values

        y_pred = model.predict(X_test)

        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, average='weighted')),
            "recall": float(recall_score(y_test, y_pred, average='weighted')),
            "f1_score": float(f1_score(y_test, y_pred, average='weighted'))
        }

        return {"status": "success", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        proxy_headers=True,
        forwarded_allow_ips="*"
    )
