"""
Heart Disease Prediction API - Test Suite
==========================================
Pytest tests for FastAPI endpoints.
"""

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


class TestHealthEndpoint:
    """Tests for /health endpoint."""
    
    def test_health_returns_200(self):
        """Health endpoint should return 200 OK."""
        response = client.get("/health")
        assert response.status_code == 200
    
    def test_health_response_structure(self):
        """Health response should have expected fields."""
        response = client.get("/health")
        data = response.json()
        
        assert "status" in data
        assert "model_loaded" in data
        assert "version" in data
        assert data["status"] == "healthy"


class TestPredictEndpoint:
    """Tests for /predict endpoint."""
    
    @pytest.fixture
    def high_risk_payload(self) -> dict:
        """Sample high-risk patient data."""
        return {
            "age": 70,
            "sex": 1,
            "cp": 4,  # Asymptomatic - highest risk
            "trestbps": 180,
            "chol": 350,
            "fbs": 1,
            "restecg": 2,
            "thalach": 100,
            "exang": 1,
            "oldpeak": 4.0,
            "slope": 2,
            "ca": 3,
            "thal": 7  # Reversible defect
        }
    
    @pytest.fixture
    def low_risk_payload(self) -> dict:
        """Sample low-risk patient data."""
        return {
            "age": 35,
            "sex": 0,
            "cp": 1,  # Typical angina - lower risk
            "trestbps": 120,
            "chol": 200,
            "fbs": 0,
            "restecg": 0,
            "thalach": 180,
            "exang": 0,
            "oldpeak": 0.5,
            "slope": 1,
            "ca": 0,
            "thal": 3  # Normal
        }
    
    def test_predict_high_risk_returns_class_1(self, high_risk_payload):
        """High-risk input should predict class 1 (disease)."""
        response = client.post("/predict", json=high_risk_payload)
        
        # Skip if model not loaded
        if response.status_code == 503:
            pytest.skip("Model not loaded - run train_model.py first")
        
        assert response.status_code == 200
        data = response.json()
        
        # High risk patient should be class 1
        assert data["prediction_class"] == 1
        assert data["risk_label"] == "High Risk"
        assert data["risk_score"] > 0.5
    
    def test_predict_response_structure(self, high_risk_payload):
        """Prediction response should have expected fields."""
        response = client.post("/predict", json=high_risk_payload)
        
        if response.status_code == 503:
            pytest.skip("Model not loaded")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "risk_score" in data
        assert "prediction_class" in data
        assert "risk_label" in data
        assert "confidence" in data
        
        # Validate ranges
        assert 0 <= data["risk_score"] <= 1
        assert data["prediction_class"] in [0, 1]
        assert data["risk_label"] in ["Low Risk", "Medium Risk", "High Risk"]
        assert 0 <= data["confidence"] <= 1
    
    def test_predict_high_risk_has_warning(self, high_risk_payload):
        """High-risk predictions should include warning message."""
        response = client.post("/predict", json=high_risk_payload)
        
        if response.status_code == 503:
            pytest.skip("Model not loaded")
        
        data = response.json()
        
        if data["risk_score"] >= 0.60:
            assert data["warning_message"] is not None


class TestInputValidation:
    """Tests for input validation."""
    
    def test_invalid_age_below_range(self):
        """Age below 25 should be rejected."""
        payload = {
            "age": 20,  # Below minimum
            "sex": 1, "cp": 1, "trestbps": 120, "chol": 200,
            "fbs": 0, "restecg": 0, "thalach": 150, "exang": 0,
            "oldpeak": 1.0, "slope": 1, "ca": 0, "thal": 3
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 422
    
    def test_invalid_cp_value(self):
        """CP value outside valid range should be rejected."""
        payload = {
            "age": 50, "sex": 1,
            "cp": 0,  # Invalid - should be 1-4
            "trestbps": 120, "chol": 200, "fbs": 0, "restecg": 0,
            "thalach": 150, "exang": 0, "oldpeak": 1.0, "slope": 1,
            "ca": 0, "thal": 3
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 422
    
    def test_invalid_thal_value(self):
        """Thal value outside valid options should be rejected."""
        payload = {
            "age": 50, "sex": 1, "cp": 1, "trestbps": 120, "chol": 200,
            "fbs": 0, "restecg": 0, "thalach": 150, "exang": 0,
            "oldpeak": 1.0, "slope": 1, "ca": 0,
            "thal": 5  # Invalid - should be 3, 6, or 7
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 422
    
    def test_missing_required_field(self):
        """Missing required field should return 422."""
        payload = {
            "age": 50,
            "sex": 1
            # Missing all other required fields
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
