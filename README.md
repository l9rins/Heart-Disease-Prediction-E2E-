# 🫀 Heart Disease Prediction E2E System

![Heart Disease Banner](https://capsule-render.vercel.app/api?type=waving&color=gradient&height=300&section=header&text=Heart%20Disease%20Prediction&fontSize=70&animation=fadeIn&fontAlignY=38&desc=Production-Grade%20Machine%20Learning%20Pipeline&descAlignY=51&descSize=20)

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg?logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.1+-orange.svg)](https://xgboost.readthedocs.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg?logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[Live App (Coming Soon)](#) • [Report Bug](https://github.com/l9rins/Heart-Disease-Prediction-E2E-/issues) • [Request Feature](https://github.com/l9rins/Heart-Disease-Prediction-E2E-/issues)**

</div>

---

## 🚀 Overview

**Heart Disease Prediction E2E System** is a production-grade machine learning application that provides instant risk assessment for heart disease based on clinical measurements. It is trained on the highly-validated **UCI Cleveland dataset** and features a modern architecture utilizing **FastAPI** and **React 19**.

Whether you are a researcher analyzing clinical data or a developer studying end-to-end ML deployments, this system offers a robust, dockerized environment with a beautiful Glassmorphism UI.

> "Predictive analytics in healthcare requires both high accuracy and clear, actionable insights."

---

## ✨ Features

*   **ML Pipeline:** XGBoost classifier with ~90% ROC-AUC accuracy.
*   **UCI-Validated:** Strict data validation based on Cleveland dataset research.
*   **Modern Stack:** FastAPI backend + React 19 frontend.
*   **Glassmorphism UI:** Beautiful Bento Grid layout with Framer Motion animations.
*   **Real-time Predictions:** Instant risk assessment with confidence scores.
*   **Docker Ready:** One-command deployment with Docker Compose.

---

## 📸 Screenshots

<div align="center">
  <img src="docs/screenshot.png" alt="Heart Disease Predictor Screenshot" width="800"/>
</div>

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- Git

### Option 1: Run with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/l9rins/Heart-Disease-Prediction-E2E-.git
cd Heart-Disease-Prediction-E2E-

# Build and run
docker-compose up --build

# Access the app
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/l9rins/Heart-Disease-Prediction-E2E-.git
cd Heart-Disease-Prediction-E2E-

# Install Python dependencies
pip install -r requirements.txt

# Train the model (generates model/heart_pipeline.pkl)
python train_model.py

# Start the backend API
cd backend
uvicorn main:app --reload --port 8000

# In a new terminal, start the frontend
cd frontend
npm install
npm run dev

# Access the app
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

---

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| ROC-AUC | ~0.90 |
| Accuracy | ~0.85 |
| Recall (Disease) | ≥0.85 |
| Cross-Validation | 5-fold stratified |

---

## 🏗️ Project Structure

```text
Heart-Disease-Prediction-E2E/
├── data/
│   └── heart.csv              # UCI Cleveland dataset
├── model/
│   └── heart_pipeline.pkl     # Trained model
├── backend/
│   ├── main.py                # FastAPI application
│   ├── schemas.py             # Pydantic models
│   └── test_main.py           # API tests
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── App.tsx            # Main application
│   │   └── types.ts           # TypeScript types
│   └── package.json
├── train_model.py             # ML training pipeline
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Backend container
├── Dockerfile.frontend        # Frontend container
├── docker-compose.yml         # Multi-container setup
└── README.md
```

---

## 🔬 Dataset

This project uses the [UCI Cleveland Heart Disease Dataset](https://archive.ics.uci.edu/ml/datasets/heart+disease):

- **Samples**: 303
- **Features**: 13 clinical measurements
- **Target**: Binary (0 = No Disease, 1 = Disease)

### Feature Descriptions

| Feature | Description | Valid Values |
|---------|-------------|--------------|
| age | Age in years | 25-80 |
| sex | Biological sex | 0=Female, 1=Male |
| cp | Chest pain type | 1-4 |
| trestbps | Resting blood pressure | 90-250 mmHg |
| chol | Serum cholesterol | 100-600 mg/dl |
| fbs | Fasting blood sugar >120 | 0=No, 1=Yes |
| restecg | Resting ECG results | 0-2 |
| thalach | Maximum heart rate | 60-220 bpm |
| exang | Exercise induced angina | 0=No, 1=Yes |
| oldpeak | ST depression | 0-7 |
| slope | ST segment slope | 1-3 |
| ca | Major vessels (fluoroscopy) | 0-4 |
| thal | Thalassemia | 3=Normal, 6=Fixed, 7=Reversible |

---

## 🔌 API Reference

### Health Check
```http
GET /health
```
Returns API status and model availability.

### Predict
```http
POST /predict
Content-Type: application/json

{
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
```

Response:
```json
{
  "risk_score": 0.85,
  "prediction_class": 1,
  "risk_label": "High Risk",
  "warning_message": "Immediate medical consultation recommended.",
  "confidence": 0.70
}
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest test_main.py -v

# Frontend type check
cd frontend
npx tsc --noEmit
```

---

## ⚠️ Medical Disclaimer

> **IMPORTANT**: This tool is for **educational and research purposes only**. It is **NOT** FDA-approved and should **NOT** be used for medical diagnosis or treatment decisions.
>
> - Model accuracy is approximately 90% ROC-AUC on the test set
> - Always consult a qualified healthcare professional for medical advice
> - This system is not a substitute for professional medical judgment
>
> The developers assume no liability for any decisions made based on this tool's predictions.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

1.  **Fork** the repository.
2.  Create your **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

---

<div align="center">

**Built with ❤️ by [l9rins](https://github.com/l9rins)**

Licensed under [MIT](./LICENSE) © 2026

</div>
