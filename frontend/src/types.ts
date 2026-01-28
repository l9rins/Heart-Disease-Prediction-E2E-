/**
 * Heart Disease Prediction - Type Definitions
 */

// Form input types matching UCI Cleveland dataset
export interface HeartInputData {
    age: number;
    sex: 0 | 1;
    cp: 1 | 2 | 3 | 4;
    trestbps: number;
    chol: number;
    fbs: 0 | 1;
    restecg: 0 | 1 | 2;
    thalach: number;
    exang: 0 | 1;
    oldpeak: number;
    slope: 1 | 2 | 3;
    ca: 0 | 1 | 2 | 3 | 4;
    thal: 3 | 6 | 7;
}

// API response type
export interface PredictionResponse {
    risk_score: number;
    prediction_class: 0 | 1;
    risk_label: 'Low Risk' | 'Medium Risk' | 'High Risk';
    warning_message: string | null;
    confidence: number;
}

// API health check response
export interface HealthResponse {
    status: string;
    model_loaded: boolean;
    version: string;
}

// Field metadata for dynamic rendering
export interface FieldMetadata {
    name: keyof HeartInputData;
    label: string;
    description: string;
    type: 'slider' | 'toggle' | 'select' | 'pills';
    min?: number;
    max?: number;
    step?: number;
    options?: { value: number; label: string }[];
}

// Field configurations
export const FIELD_CONFIG: Record<string, FieldMetadata> = {
    age: {
        name: 'age',
        label: 'Age',
        description: 'Patient age in years',
        type: 'slider',
        min: 25,
        max: 80,
        step: 1,
    },
    sex: {
        name: 'sex',
        label: 'Sex',
        description: 'Biological sex',
        type: 'pills',
        options: [
            { value: 0, label: 'Female' },
            { value: 1, label: 'Male' },
        ],
    },
    cp: {
        name: 'cp',
        label: 'Chest Pain Type',
        description: 'Type of chest pain experienced',
        type: 'pills',
        options: [
            { value: 1, label: 'Typical Angina' },
            { value: 2, label: 'Atypical Angina' },
            { value: 3, label: 'Non-anginal' },
            { value: 4, label: 'Asymptomatic' },
        ],
    },
    trestbps: {
        name: 'trestbps',
        label: 'Resting Blood Pressure',
        description: 'Resting BP in mm Hg',
        type: 'slider',
        min: 90,
        max: 250,
        step: 1,
    },
    chol: {
        name: 'chol',
        label: 'Cholesterol',
        description: 'Serum cholesterol in mg/dl',
        type: 'slider',
        min: 100,
        max: 600,
        step: 1,
    },
    fbs: {
        name: 'fbs',
        label: 'Fasting Blood Sugar',
        description: '> 120 mg/dl',
        type: 'pills',
        options: [
            { value: 0, label: 'Normal (≤120)' },
            { value: 1, label: 'Elevated (>120)' },
        ],
    },
    restecg: {
        name: 'restecg',
        label: 'Resting ECG',
        description: 'ECG results at rest',
        type: 'pills',
        options: [
            { value: 0, label: 'Normal' },
            { value: 1, label: 'ST-T Abnormality' },
            { value: 2, label: 'LV Hypertrophy' },
        ],
    },
    thalach: {
        name: 'thalach',
        label: 'Max Heart Rate',
        description: 'Maximum heart rate achieved',
        type: 'slider',
        min: 60,
        max: 220,
        step: 1,
    },
    exang: {
        name: 'exang',
        label: 'Exercise Angina',
        description: 'Exercise induced angina',
        type: 'pills',
        options: [
            { value: 0, label: 'No' },
            { value: 1, label: 'Yes' },
        ],
    },
    oldpeak: {
        name: 'oldpeak',
        label: 'ST Depression',
        description: 'Exercise vs rest ST depression',
        type: 'slider',
        min: 0,
        max: 7,
        step: 0.1,
    },
    slope: {
        name: 'slope',
        label: 'ST Slope',
        description: 'Peak exercise ST segment slope',
        type: 'pills',
        options: [
            { value: 1, label: 'Upsloping' },
            { value: 2, label: 'Flat' },
            { value: 3, label: 'Downsloping' },
        ],
    },
    ca: {
        name: 'ca',
        label: 'Major Vessels',
        description: 'Vessels colored by fluoroscopy',
        type: 'pills',
        options: [
            { value: 0, label: '0' },
            { value: 1, label: '1' },
            { value: 2, label: '2' },
            { value: 3, label: '3' },
            { value: 4, label: '4' },
        ],
    },
    thal: {
        name: 'thal',
        label: 'Thalassemia',
        description: 'Thalassemia type',
        type: 'pills',
        options: [
            { value: 3, label: 'Normal' },
            { value: 6, label: 'Fixed Defect' },
            { value: 7, label: 'Reversible Defect' },
        ],
    },
};

// Default form values
export const DEFAULT_VALUES: HeartInputData = {
    age: 50,
    sex: 1,
    cp: 1,
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 0,
    thalach: 150,
    exang: 0,
    oldpeak: 1.0,
    slope: 1,
    ca: 0,
    thal: 3,
};

// Prediction history entry
export interface PredictionHistoryEntry {
    id: string;
    timestamp: number;
    input: HeartInputData;
    result: PredictionResponse;
}

// Sample presets for demo
export interface SamplePreset {
    name: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
    data: HeartInputData;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
    {
        name: 'Low Risk Profile',
        description: 'Young, healthy female with normal values',
        riskLevel: 'low',
        data: {
            age: 35,
            sex: 0,
            cp: 1,
            trestbps: 115,
            chol: 180,
            fbs: 0,
            restecg: 0,
            thalach: 175,
            exang: 0,
            oldpeak: 0.5,
            slope: 1,
            ca: 0,
            thal: 3,
        },
    },
    {
        name: 'Medium Risk Profile',
        description: 'Middle-aged male with elevated markers',
        riskLevel: 'medium',
        data: {
            age: 55,
            sex: 1,
            cp: 2,
            trestbps: 145,
            chol: 260,
            fbs: 1,
            restecg: 1,
            thalach: 140,
            exang: 0,
            oldpeak: 1.8,
            slope: 2,
            ca: 1,
            thal: 6,
        },
    },
    {
        name: 'High Risk Profile',
        description: 'Elderly male with multiple risk factors',
        riskLevel: 'high',
        data: {
            age: 70,
            sex: 1,
            cp: 4,
            trestbps: 180,
            chol: 350,
            fbs: 1,
            restecg: 2,
            thalach: 100,
            exang: 1,
            oldpeak: 4.0,
            slope: 2,
            ca: 3,
            thal: 7,
        },
    },
];

