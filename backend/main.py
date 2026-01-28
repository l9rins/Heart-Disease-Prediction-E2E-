"""
Heart Disease Prediction API - FastAPI Application
===================================================
Production-grade REST API with model inference and health monitoring.
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from schemas import HeartInput, HealthResponse, PredictionResponse

# Configuration
MODEL_PATH = Path(__file__).parent.parent / "model" / "heart_pipeline.pkl"

# Thal value mapping (must match training)
THAL_MAPPING = {3: 0, 6: 1, 7: 2}

# Feature order (must match training)
FEATURE_ORDER = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", 
    "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"
]

# Global model reference
ml_pipeline: Any = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI.
    Loads model on startup and handles cleanup on shutdown.
    """
    global ml_pipeline
    
    print("=" * 50)
    print("HEART DISEASE PREDICTION API - STARTUP")
    print("=" * 50)
    
    if not MODEL_PATH.exists():
        print(f"⚠ WARNING: Model not found at {MODEL_PATH}")
        print("  Run 'python train_model.py' first to train the model.")
        ml_pipeline = None
    else:
        try:
            ml_pipeline = joblib.load(MODEL_PATH)
            print(f"✓ Model loaded from: {MODEL_PATH}")
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            ml_pipeline = None
    
    print("✓ API ready to serve requests")
    print("=" * 50)
    
    yield  # Application is now running
    
    # Cleanup on shutdown
    print("Shutting down API...")
    ml_pipeline = None


# Initialize FastAPI
app = FastAPI(
    title="Heart Disease Prediction API",
    description="Production-grade ML API for heart disease risk assessment. Uses XGBoost model trained on UCI Cleveland dataset.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_risk_label(probability: float) -> str:
    """Convert probability to human-readable risk label."""
    if probability < 0.30:
        return "Low Risk"
    elif probability < 0.70:
        return "Medium Risk"
    else:
        return "High Risk"


def prepare_input(data: HeartInput) -> pd.DataFrame:
    """
    Convert HeartInput to DataFrame matching training format.
    
    Applies thal mapping (3,6,7 -> 0,1,2) to match preprocessing.
    """
    input_dict = data.model_dump()
    
    # Apply thal mapping
    input_dict["thal"] = THAL_MAPPING.get(input_dict["thal"], input_dict["thal"])
    
    # Create DataFrame with correct column order
    df = pd.DataFrame([input_dict])[FEATURE_ORDER]
    
    return df


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint redirect to docs."""
    return {"message": "Heart Disease Prediction API", "docs": "/docs"}


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        HealthResponse with status, model state, and version.
    """
    return HealthResponse(
        status="healthy",
        model_loaded=ml_pipeline is not None,
        version="1.0.0"
    )


@app.post(
    "/predict",
    response_model=PredictionResponse,
    tags=["Prediction"],
    summary="Predict heart disease risk",
    description="Analyze patient data and predict heart disease probability using XGBoost model."
)
async def predict(data: HeartInput) -> PredictionResponse:
    """
    Heart disease prediction endpoint.
    
    Args:
        data: HeartInput with patient measurements
        
    Returns:
        PredictionResponse with risk score, class, and label
        
    Raises:
        HTTPException 503: If model is not loaded
        HTTPException 500: If prediction fails
    """
    if ml_pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded. Run 'python train_model.py' first."
        )
    
    try:
        # Prepare input DataFrame
        input_df = prepare_input(data)
        
        # Get prediction and probability
        prediction = int(ml_pipeline.predict(input_df)[0])
        probabilities = ml_pipeline.predict_proba(input_df)[0]
        risk_score = float(probabilities[1])  # Probability of positive class
        
        # Determine risk label
        risk_label = get_risk_label(risk_score)
        
        # Add warning for high risk
        warning_message = None
        if risk_score >= 0.80:
            warning_message = "Immediate medical consultation recommended."
        elif risk_score >= 0.60:
            warning_message = "Consider scheduling a medical evaluation."
        
        # Calculate confidence (distance from 0.5)
        confidence = float(abs(risk_score - 0.5) * 2)
        
        return PredictionResponse(
            risk_score=round(risk_score, 4),
            prediction_class=prediction,
            risk_label=risk_label,
            warning_message=warning_message,
            confidence=round(confidence, 4)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
