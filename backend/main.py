# Import necessary modules and libraries
from fastapi import FastAPI, File, UploadFile, HTTPException  # FastAPI for building API, UploadFile for handling file uploads
from fastapi.middleware.cors import CORSMiddleware  # To handle CORS (Cross-Origin Resource Sharing)
from pydantic import BaseModel  # To define response models using Pydantic
from typing import Dict  # For typing dictionaries
import pandas as pd  # For data manipulation
import numpy as np  # For numerical operations (though it's not used directly here)
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score  # For model evaluation metrics
import joblib  # To load serialized machine learning models
import os  # For interacting with the operating system (e.g., file handling)

# Initialize FastAPI app, this will expose API endpoints
app = FastAPI(title="ML Benchmark Platform")

# Configure CORS to allow cross-origin requests from all sources (important for the frontend to communicate with this backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://benchmark-platform-deployment.vercel.app/"],  # Allows all origins (front-end can be on any domain)
    allow_credentials=True,  # Allows sending credentials (cookies, etc.)
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all HTTP headers
)

# Create directories to store uploaded models and datasets if they don't already exist
os.makedirs("models", exist_ok=True)
os.makedirs("datasets", exist_ok=True)

# Define a Pydantic model for the response structure of benchmark results
class BenchmarkResult(BaseModel):
    metrics: Dict[str, float]

# Root endpoint to check if the API is running
@app.get("/")
def read_root():
    return {"status": "active", "message": "ML Benchmark Platform API is running"}

# Health check endpoint to confirm that the API is healthy
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Endpoint for uploading machine learning model files
@app.post("/upload-model")
async def upload_model(file: UploadFile = File(...)):  # The file is uploaded as 'file'
    """
    Endpoint to upload machine learning model files.
    - This is where the front-end will send the model file (e.g., a .pkl file)
    """
    try:
        # Check if the model file is in pkl format
        if not file.filename.endswith('.pkl'):
            raise HTTPException(status_code=400, detail="Model file must be a pkl file")
        # Save the uploaded model file to the 'models' directory
        file_path = f"models/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        return {"status": "success", "filename": file.filename}  # Return the filename to the front-end
    except Exception as e:
        # If there's an error, return a 400 Bad Request with the error message
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint for uploading datasets in CSV format
@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):  # The dataset is uploaded as 'file'
    """
    Endpoint to upload datasets (CSV format).
    - This is where the front-end will send the dataset file
    """
    try:
        # Check if the dataset is a CSV file
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Dataset must be a CSV file")
        
        # Save the dataset file to the 'datasets' directory
        file_path = f"datasets/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        return {"status": "success", "filename": file.filename}  # Return the filename to the front-end
    except Exception as e:
        # If there's an error, return a 400 Bad Request with the error message
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint for running the benchmarking process
@app.post("/benchmark")
async def run_benchmark(model_id: str, dataset_id: str):
    """
    Endpoint to benchmark a model against a dataset.
    - This is where the front-end will send the model ID and dataset ID (filenames)
    - The backend loads the model and dataset, runs the benchmark, and returns performance metrics.
    """
    try:
        # Load the uploaded machine learning model from the 'models' directory
        model_path = f"models/{model_id}"
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail=f"Model file '{model_id}' not found")
        model = joblib.load(model_path)  # Load the model using joblib

        # Load the uploaded dataset from the 'datasets' directory
        dataset_path = f"datasets/{dataset_id}"
        if not os.path.exists(dataset_path):
            raise HTTPException(status_code=404, detail=f"Dataset file '{dataset_id}' not found")
        
        # Load the CSV dataset into a Pandas DataFrame
        data = pd.read_csv(dataset_path)
        
        # Ensure that the dataset has at least two columns (one feature and one label)
        if data.shape[1] < 2:
            raise HTTPException(status_code=400, detail="Dataset must have at least one feature and one label column")
        
        X_test = data.iloc[:, :-1].values  # Features (all columns except the last one)
        y_test = data.iloc[:, -1].values  # Labels (last column)

        # Make predictions using the model on the test data
        y_pred = model.predict(X_test)

        # Calculate the evaluation metrics: accuracy, precision, recall, and F1 score
        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),  # Accuracy as percentage
            "precision": float(precision_score(y_test, y_pred, average='weighted')),  # Precision
            "recall": float(recall_score(y_test, y_pred, average='weighted')),  # Recall
            "f1_score": float(f1_score(y_test, y_pred, average='weighted'))  # F1 score
        }

        # Return the evaluation metrics as a response to the front-end
        return {"status": "success", "metrics": metrics}
    except Exception as e:
        # If there's an error, return a 500 Internal Server Error with the error message
        raise HTTPException(status_code=500, detail=str(e))
