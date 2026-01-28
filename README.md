# Heart Disease Prediction E2E System

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.1+-orange.svg)](https://xgboost.readthedocs.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🫀 Production-grade heart disease prediction system using machine learning, trained on the UCI Cleveland dataset.

![Heart Disease Predictor Screenshot](docs/screenshot.png)

## ✨ Features

- **ML Pipeline**: XGBoost classifier with ~90% ROC-AUC accuracy
- **UCI-Validated**: Strict data validation based on Cleveland dataset research
- **Modern Stack**: FastAPI backend + React 19 frontend
- **Glassmorphism UI**: Beautiful Bento Grid layout with Framer Motion animations
- **Real-time Predictions**: Instant risk assessment with confidence scores
- **Docker Ready**: One-command deployment with Docker Compose

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

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| ROC-AUC | ~0.90 |
| Accuracy | ~0.85 |
| Recall (Disease) | ≥0.85 |
| Cross-Validation | 5-fold stratified |

## 🏗️ Project Structure

```
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

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest test_main.py -v

# Frontend type check
cd frontend
npx tsc --noEmit
```

## ⚠️ Medical Disclaimer

> **IMPORTANT**: This tool is for **educational and research purposes only**. It is **NOT** FDA-approved and should **NOT** be used for medical diagnosis or treatment decisions.
>
> - Model accuracy is approximately 90% ROC-AUC on the test set
> - Always consult a qualified healthcare professional for medical advice
> - This system is not a substitute for professional medical judgment
>
> The developers assume no liability for any decisions made based on this tool's predictions.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [UCI Machine Learning Repository](https://archive.ics.uci.edu/ml/datasets/heart+disease) for the Cleveland Heart Disease dataset
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python web framework
- [XGBoost](https://xgboost.readthedocs.io/) for the gradient boosting implementation
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/l9rins">l9rins</a>
</p>
