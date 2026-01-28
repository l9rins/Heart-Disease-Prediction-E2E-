"""
Heart Disease Prediction API - Pydantic Schemas
================================================
Type-safe request/response models with UCI-validated constraints.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class HeartInput(BaseModel):
    """
    Input schema for heart disease prediction.
    
    All field constraints are derived from UCI Cleveland dataset research:
    - Categorical values use exact valid options from dataset
    - Numeric ranges cover 99th percentile of observed values
    """
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "age": 63,
                "sex": 1,
                "cp": 3,
                "trestbps": 145,
                "chol": 233,
                "fbs": 1,
                "restecg": 0,
                "thalach": 150,
                "exang": 0,
                "oldpeak": 2.3,
                "slope": 1,
                "ca": 0,
                "thal": 6
            }
        }
    )
    
    # Demographics
    age: int = Field(
        ge=25, le=80,
        description="Age in years (25-80)"
    )
    
    sex: Literal[0, 1] = Field(
        description="Sex: 0=Female, 1=Male"
    )
    
    # Chest Pain
    cp: Literal[1, 2, 3, 4] = Field(
        description="Chest pain type: 1=Typical angina, 2=Atypical angina, 3=Non-anginal pain, 4=Asymptomatic"
    )
    
    # Vitals
    trestbps: int = Field(
        ge=90, le=250,
        description="Resting blood pressure (mm Hg)"
    )
    
    chol: int = Field(
        ge=100, le=600,
        description="Serum cholesterol (mg/dl)"
    )
    
    fbs: Literal[0, 1] = Field(
        description="Fasting blood sugar > 120 mg/dl: 0=False, 1=True"
    )
    
    # ECG Data
    restecg: Literal[0, 1, 2] = Field(
        description="Resting ECG: 0=Normal, 1=ST-T wave abnormality, 2=Left ventricular hypertrophy"
    )
    
    # Exercise Test
    thalach: int = Field(
        ge=60, le=220,
        description="Maximum heart rate achieved"
    )
    
    exang: Literal[0, 1] = Field(
        description="Exercise induced angina: 0=No, 1=Yes"
    )
    
    oldpeak: float = Field(
        ge=0.0, le=7.0,
        description="ST depression induced by exercise relative to rest"
    )
    
    slope: Literal[1, 2, 3] = Field(
        description="Slope of peak exercise ST segment: 1=Upsloping, 2=Flat, 3=Downsloping"
    )
    
    # Fluoroscopy
    ca: Literal[0, 1, 2, 3, 4] = Field(
        description="Number of major vessels colored by fluoroscopy (0-4)"
    )
    
    thal: Literal[3, 6, 7] = Field(
        description="Thalassemia: 3=Normal, 6=Fixed defect, 7=Reversible defect"
    )


class PredictionResponse(BaseModel):
    """Response schema for heart disease prediction."""
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "risk_score": 0.85,
                "prediction_class": 1,
                "risk_label": "High Risk",
                "warning_message": "Immediate medical consultation recommended.",
                "confidence": 0.85
            }
        }
    )
    
    risk_score: float = Field(
        ge=0.0, le=1.0,
        description="Probability of heart disease (0-1)"
    )
    
    prediction_class: int = Field(
        description="Binary prediction: 0=No disease, 1=Disease"
    )
    
    risk_label: str = Field(
        description="Human-readable risk category: 'Low Risk', 'Medium Risk', or 'High Risk'"
    )
    
    warning_message: str | None = Field(
        default=None,
        description="Medical warning for high-risk predictions"
    )
    
    confidence: float = Field(
        ge=0.0, le=1.0,
        description="Model confidence score"
    )


class HealthResponse(BaseModel):
    """Health check response schema."""
    
    status: str = Field(default="healthy")
    model_loaded: bool = Field(default=False)
    version: str = Field(default="1.0.0")
