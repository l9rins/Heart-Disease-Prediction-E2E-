/**
 * API Client for Heart Disease Prediction Backend
 */

import axios from 'axios';
import type { HeartInputData, PredictionResponse, HealthResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

/**
 * Submit heart disease prediction request
 */
export async function predictHeartDisease(data: HeartInputData): Promise<PredictionResponse> {
    const response = await apiClient.post<PredictionResponse>('/predict', data);
    return response.data;
}

/**
 * Check API health status
 */
export async function checkHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
}

export default apiClient;
