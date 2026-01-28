#!/usr/bin/env python3
"""
Heart Disease Prediction - ML Pipeline
========================================
Production-grade XGBoost pipeline with UCI-validated preprocessing.
Features MLflow tracking, dynamic class balancing, and strict validation.

Author: Senior ML Engineer
Dataset: UCI Cleveland Heart Disease (303 samples, 14 features)
"""

import os
import warnings
from pathlib import Path
from typing import Any

import joblib
import matplotlib.pyplot as plt
import mlflow
import mlflow.sklearn
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

# Configuration
DATA_PATH = Path("data/heart.csv")
MODEL_DIR = Path("model")
MODEL_PATH = MODEL_DIR / "heart_pipeline.pkl"
RANDOM_STATE = 42
TEST_SIZE = 0.2
MIN_RECALL_THRESHOLD = 0.85

# UCI Cleveland Dataset Feature Definitions
NUMERIC_FEATURES = ["age", "trestbps", "chol", "thalach", "oldpeak", "ca"]
CATEGORICAL_FEATURES = ["sex", "cp", "fbs", "restecg", "exang", "slope", "thal"]

# Valid categorical values per UCI research
VALID_THAL_VALUES = {3, 6, 7}
THAL_MAPPING = {3: 0, 6: 1, 7: 2}


def load_and_clean_data(filepath: Path) -> tuple[pd.DataFrame, pd.Series]:
    """
    Load and sanitize the heart disease dataset.
    
    Performs:
    - Type conversion with error coercion
    - Thal value mapping (3,6,7 -> 0,1,2)
    - Missing value handling
    
    Returns:
        X: Feature DataFrame
        y: Target Series (binary: 0=no disease, 1=disease)
    """
    print("=" * 60)
    print("PHASE 1: DATA LOADING & SANITIZATION")
    print("=" * 60)
    
    if not filepath.exists():
        raise FileNotFoundError(
            f"Dataset not found at {filepath}. "
            f"Please download from UCI repository or run: "
            f"wget https://raw.githubusercontent.com/l9rins/Heart-Disease-Prediction-E2E-/main/data/heart.csv -O {filepath}"
        )
    
    df = pd.read_csv(filepath)
    print(f"[OK] Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")
    
    # Target column handling
    target_col = "target" if "target" in df.columns else "num"
    if target_col not in df.columns:
        raise ValueError(f"Target column not found. Expected 'target' or 'num'. Got: {df.columns.tolist()}")
    
    # Binarize target: 1 if num >= 1 else 0
    y = (df[target_col] >= 1).astype(int)
    X = df.drop(columns=[target_col])
    
    # Convert thal and ca to numeric, coercing errors
    for col in ["thal", "ca"]:
        if col in X.columns:
            X[col] = pd.to_numeric(X[col], errors="coerce")
    
    # Map thal values: 3->0, 6->1, 7->2. Invalid values become NaN
    if "thal" in X.columns:
        original_thal = X["thal"].copy()
        X["thal"] = X["thal"].apply(lambda x: THAL_MAPPING.get(x, np.nan) if pd.notna(x) else np.nan)
        valid_count = X["thal"].notna().sum()
        print(f"[OK] Mapped thal values: {valid_count}/{len(X)} valid (3->0, 6->1, 7->2)")
    
    # Report missing values
    missing = X.isnull().sum()
    if missing.any():
        print(f"[WARN] Missing values detected:\n{missing[missing > 0]}")
    
    print(f"[OK] Target distribution: {y.value_counts().to_dict()}")
    print(f"  Positive class (disease): {y.mean()*100:.1f}%")
    
    return X, y


def calculate_class_weight(y: pd.Series) -> float:
    """
    Dynamically calculate scale_pos_weight for XGBoost.
    
    Formula: total_negative / total_positive
    This helps balance the model for imbalanced datasets.
    """
    n_positive = y.sum()
    n_negative = len(y) - n_positive
    weight = n_negative / n_positive if n_positive > 0 else 1.0
    print(f"[OK] Calculated scale_pos_weight: {weight:.3f} (neg={n_negative}, pos={n_positive})")
    return weight


def build_preprocessor() -> ColumnTransformer:
    """
    Build sklearn ColumnTransformer with UCI-compliant preprocessing.
    
    Numeric pipeline: SimpleImputer(median) -> StandardScaler
    Categorical pipeline: SimpleImputer(most_frequent) -> OneHotEncoder
    """
    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    
    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, NUMERIC_FEATURES),
            ("cat", categorical_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )
    
    return preprocessor


def build_pipeline(scale_pos_weight: float) -> Pipeline:
    """
    Construct the full ML pipeline with XGBoostClassifier.
    
    Args:
        scale_pos_weight: Class balancing weight
        
    Returns:
        Complete sklearn Pipeline ready for training
    """
    print("\n" + "=" * 60)
    print("PHASE 2: PIPELINE CONSTRUCTION")
    print("=" * 60)
    
    preprocessor = build_preprocessor()
    
    model = XGBClassifier(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=6,
        min_child_weight=1,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=RANDOM_STATE,
        n_jobs=-1,
        verbosity=0
    )
    
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", model)
    ])
    
    print("[OK] Pipeline constructed:")
    print("  - Preprocessor: ColumnTransformer (Numeric + Categorical)")
    print("  - Model: XGBClassifier (200 trees, depth=6)")
    
    return pipeline


def train_and_evaluate(
    pipeline: Pipeline,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series
) -> dict[str, Any]:
    """
    Train the pipeline and compute comprehensive metrics.
    
    Returns:
        Dictionary of metrics including accuracy, ROC-AUC, recall, etc.
    """
    print("\n" + "=" * 60)
    print("PHASE 3: MODEL TRAINING & EVALUATION")
    print("=" * 60)
    
    # Train
    print("Training XGBoost classifier...")
    pipeline.fit(X_train, y_train)
    print("[OK] Training complete")
    
    # Predictions
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    
    # Metrics
    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_proba)
    recall_class1 = recall_score(y_test, y_pred, pos_label=1)
    recall_class0 = recall_score(y_test, y_pred, pos_label=0)
    
    # Cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="roc_auc")
    
    metrics = {
        "accuracy": accuracy,
        "roc_auc": roc_auc,
        "recall_positive": recall_class1,
        "recall_negative": recall_class0,
        "cv_roc_auc_mean": cv_scores.mean(),
        "cv_roc_auc_std": cv_scores.std()
    }
    
    print(f"\n=== TEST SET METRICS ===")
    print(f"   Accuracy:        {accuracy:.4f}")
    print(f"   ROC-AUC:         {roc_auc:.4f}")
    print(f"   Recall (Pos):    {recall_class1:.4f}")
    print(f"   Recall (Neg):    {recall_class0:.4f}")
    print(f"   CV ROC-AUC:      {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    return metrics


def print_confusion_matrix(y_test: pd.Series, y_pred: np.ndarray) -> None:
    """Print formatted confusion matrix text report."""
    cm = confusion_matrix(y_test, y_pred)
    
    print("\n" + "=" * 60)
    print("CONFUSION MATRIX")
    print("=" * 60)
    print(f"""
                    Predicted
                    Neg    Pos
    Actual Neg  [{cm[0,0]:4d}] [{cm[0,1]:4d}]
           Pos  [{cm[1,0]:4d}] [{cm[1,1]:4d}]
    
    True Negatives:  {cm[0,0]:4d}
    False Positives: {cm[0,1]:4d}
    False Negatives: {cm[1,0]:4d}
    True Positives:  {cm[1,1]:4d}
    """)


def save_confusion_matrix_plot(y_test: pd.Series, y_pred: np.ndarray, filepath: Path) -> None:
    """Generate and save confusion matrix heatmap."""
    cm = confusion_matrix(y_test, y_pred)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm, 
        annot=True, 
        fmt="d", 
        cmap="Blues",
        xticklabels=["No Disease", "Disease"],
        yticklabels=["No Disease", "Disease"]
    )
    plt.title("Heart Disease Prediction - Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.tight_layout()
    plt.savefig(filepath, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"[OK] Saved confusion matrix plot: {filepath}")


def save_feature_importance(pipeline: Pipeline, X: pd.DataFrame, filepath: Path) -> None:
    """Extract and save feature importance plot."""
    # Get feature names after preprocessing
    preprocessor = pipeline.named_steps["preprocessor"]
    classifier = pipeline.named_steps["classifier"]
    
    # Get transformed feature names
    try:
        feature_names = preprocessor.get_feature_names_out()
    except AttributeError:
        # Fallback for older sklearn versions
        feature_names = [f"feature_{i}" for i in range(len(classifier.feature_importances_))]
    
    importances = classifier.feature_importances_
    
    # Sort by importance
    indices = np.argsort(importances)[::-1][:15]  # Top 15
    
    plt.figure(figsize=(10, 8))
    plt.barh(range(len(indices)), importances[indices], align="center", color="#10b981")
    plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
    plt.xlabel("Feature Importance")
    plt.title("Heart Disease Prediction - Top Feature Importances")
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.savefig(filepath, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"[OK] Saved feature importance plot: {filepath}")


def validate_recall(recall: float, threshold: float = MIN_RECALL_THRESHOLD) -> None:
    """
    Safety check: Ensure recall meets minimum threshold.
    
    Raises:
        AssertionError if recall is below threshold (medical safety requirement)
    """
    print("\n" + "=" * 60)
    print("PHASE 4: SAFETY VALIDATION")
    print("=" * 60)
    
    if recall < threshold:
        raise AssertionError(
            f"[FAIL] SAFETY CHECK FAILED: Test Recall ({recall:.4f}) is below "
            f"minimum threshold ({threshold:.4f}). "
            f"This model may miss too many positive cases (disease). "
            f"Consider tuning scale_pos_weight or hyperparameters."
        )
    
    print(f"[PASS] SAFETY CHECK PASSED: Recall ({recall:.4f}) >= {threshold:.4f}")


def main() -> None:
    """Main training pipeline execution."""
    print("\n" + "=" * 70)
    print("   HEART DISEASE PREDICTION - ML PIPELINE")
    print("   Production-Grade XGBoost with MLflow Tracking")
    print("=" * 70 + "\n")
    
    # Ensure directories exist
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    Path("data").mkdir(parents=True, exist_ok=True)
    
    # Start MLflow experiment
    mlflow.set_experiment("heart-disease-prediction")
    
    with mlflow.start_run(run_name="xgboost-training"):
        # Load and clean data
        X, y = load_and_clean_data(DATA_PATH)
        
        # Calculate dynamic class weight
        scale_pos_weight = calculate_class_weight(y)
        
        # Build pipeline
        pipeline = build_pipeline(scale_pos_weight)
        
        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=TEST_SIZE, 
            stratify=y, 
            random_state=RANDOM_STATE
        )
        print(f"\n[OK] Train/Test split: {len(X_train)} train, {len(X_test)} test")
        
        # Train and evaluate
        metrics = train_and_evaluate(pipeline, X_train, X_test, y_train, y_test)
        
        # Get predictions for reports
        y_pred = pipeline.predict(X_test)
        
        # Print detailed reports
        print_confusion_matrix(y_test, y_pred)
        
        print("\n" + "=" * 60)
        print("CLASSIFICATION REPORT")
        print("=" * 60)
        print(classification_report(y_test, y_pred, target_names=["No Disease", "Disease"]))
        
        # Validate recall (safety check)
        validate_recall(metrics["recall_positive"])
        
        # Log to MLflow
        mlflow.log_params({
            "n_estimators": 200,
            "learning_rate": 0.1,
            "max_depth": 6,
            "scale_pos_weight": scale_pos_weight,
            "test_size": TEST_SIZE,
            "random_state": RANDOM_STATE
        })
        
        mlflow.log_metrics({
            "accuracy": metrics["accuracy"],
            "roc_auc": metrics["roc_auc"],
            "recall_positive": metrics["recall_positive"],
            "recall_negative": metrics["recall_negative"],
            "cv_roc_auc_mean": metrics["cv_roc_auc_mean"]
        })
        
        # Save artifacts
        save_confusion_matrix_plot(y_test, y_pred, MODEL_DIR / "confusion_matrix.png")
        save_feature_importance(pipeline, X, MODEL_DIR / "feature_importance.png")
        
        # Save model
        joblib.dump(pipeline, MODEL_PATH)
        print(f"\n[OK] Saved pipeline: {MODEL_PATH}")
        
        # Log model to MLflow
        mlflow.sklearn.log_model(pipeline, "heart_disease_model")
        mlflow.log_artifact(str(MODEL_PATH))
        mlflow.log_artifact(str(MODEL_DIR / "confusion_matrix.png"))
        mlflow.log_artifact(str(MODEL_DIR / "feature_importance.png"))
        
        print("\n" + "=" * 70)
        print("   [SUCCESS] TRAINING COMPLETE - PIPELINE READY FOR DEPLOYMENT")
        print("=" * 70)
        print(f"\n   Model saved to: {MODEL_PATH}")
        print(f"   MLflow Run ID: {mlflow.active_run().info.run_id}")
        print("\n   Next steps:")
        print("   1. cd backend && uvicorn main:app --reload")
        print("   2. cd frontend && npm run dev")


if __name__ == "__main__":
    main()
