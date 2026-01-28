/**
 * Heart Disease Prediction - Main Application
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, Wifi, WifiOff, Github, AlertCircle } from 'lucide-react';
import { HeartForm } from './components/HeartForm';
import { ResultModal } from './components/ResultModal';
import { SamplePresets } from './components/SamplePresets';
import { HistoryPanel } from './components/HistoryPanel';
import { predictHeartDisease, checkHealth } from './api';
import type { HeartInputData, PredictionResponse, PredictionHistoryEntry, SamplePreset } from './types';
import './index.css';

const HISTORY_STORAGE_KEY = 'heart-disease-prediction-history';
const MAX_HISTORY_ENTRIES = 10;

function App() {
    const [result, setResult] = useState<PredictionResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [history, setHistory] = useState<PredictionHistoryEntry[]>([]);
    const [presetData, setPresetData] = useState<HeartInputData | null>(null);

    // Load history from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    }, []);

    // Save history to localStorage when it changes
    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }, [history]);

    // Check API health on mount
    useEffect(() => {
        const checkApiStatus = async () => {
            try {
                const health = await checkHealth();
                setApiStatus(health.model_loaded ? 'online' : 'offline');
            } catch {
                setApiStatus('offline');
            }
        };

        checkApiStatus();
        // Recheck every 30 seconds
        const interval = setInterval(checkApiStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (data: HeartInputData) => {
        setIsLoading(true);
        setError(null);

        try {
            const prediction = await predictHeartDisease(data);
            setResult(prediction);
            setIsModalOpen(true);

            // Add to history
            const entry: PredictionHistoryEntry = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                input: data,
                result: prediction,
            };

            setHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY_ENTRIES));
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || 'Failed to get prediction. Please try again.');
            } else {
                setError('Failed to get prediction. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePresetSelect = useCallback((preset: SamplePreset) => {
        setPresetData(preset.data);
    }, []);

    const handleLoadHistoryEntry = useCallback((input: HeartInputData) => {
        setPresetData(input);
    }, []);

    const handleClearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(HISTORY_STORAGE_KEY);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-black">
            {/* Header */}
            <header className="sticky top-0 z-30 glass-card backdrop-blur-2xl border-b border-glass-border rounded-none">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="relative">
                                <Heart className="w-10 h-10 text-medical-green" />
                                <motion.div
                                    className="absolute inset-0 text-medical-green"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <Heart className="w-10 h-10" />
                                </motion.div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Heart Disease Predictor</h1>
                                <p className="text-xs text-gray-400">ML-Powered Risk Assessment</p>
                            </div>
                        </motion.div>

                        <div className="flex items-center gap-4">
                            {/* API Status Indicator */}
                            <div className="flex items-center gap-2">
                                {apiStatus === 'checking' && (
                                    <Activity className="w-4 h-4 text-gray-400 animate-pulse" />
                                )}
                                {apiStatus === 'online' && (
                                    <Wifi className="w-4 h-4 text-medical-green" />
                                )}
                                {apiStatus === 'offline' && (
                                    <WifiOff className="w-4 h-4 text-risk-red" />
                                )}
                                <span className={`text-xs ${apiStatus === 'online' ? 'text-medical-green' :
                                    apiStatus === 'offline' ? 'text-risk-red' : 'text-gray-400'
                                    }`}>
                                    {apiStatus === 'online' ? 'API Online' :
                                        apiStatus === 'offline' ? 'API Offline' : 'Checking...'}
                                </span>
                            </div>

                            {/* GitHub Link */}
                            <a
                                href="https://github.com/l9rins/Heart-Disease-Prediction-E2E-"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="View on GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Title Section */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Heart Disease Risk Assessment
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Enter patient clinical data below to receive an AI-powered heart disease risk prediction.
                        This tool uses machine learning trained on the UCI Cleveland dataset.
                    </p>
                </motion.div>

                {/* API Offline Warning */}
                <AnimatePresence>
                    {apiStatus === 'offline' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass-card p-4 bg-risk-red/10 border-risk-red/30 mb-6 flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-risk-red flex-shrink-0" />
                            <div>
                                <p className="text-risk-red font-medium">Backend API is offline</p>
                                <p className="text-gray-400 text-sm">
                                    Start the backend server: <code className="bg-gray-800 px-2 py-0.5 rounded">cd backend && uvicorn main:app --reload</code>
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass-card p-4 bg-risk-red/10 border-risk-red/30 mb-6"
                        >
                            <p className="text-risk-red">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sample Presets */}
                <SamplePresets onSelect={handlePresetSelect} />

                {/* History Panel */}
                <HistoryPanel
                    history={history}
                    onLoadEntry={handleLoadHistoryEntry}
                    onClear={handleClearHistory}
                />

                {/* Form */}
                <HeartForm
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    presetData={presetData}
                    onPresetApplied={() => setPresetData(null)}
                />

                {/* Medical Disclaimer */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="glass-card inline-block px-6 py-3 text-gray-500 text-xs max-w-2xl">
                        <strong className="text-gray-400">Medical Disclaimer:</strong> This tool is for educational
                        and screening purposes only. It is not FDA-approved and should not replace professional
                        medical advice, diagnosis, or treatment. Model accuracy ~90% AUC. Always consult a
                        qualified healthcare provider.
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-glass-border mt-16 py-6">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>Built with FastAPI, XGBoost, React, and ❤️</p>
                    <p className="text-xs mt-1">UCI Cleveland Heart Disease Dataset | ~303 samples</p>
                </div>
            </footer>

            {/* Result Modal */}
            <ResultModal
                result={result}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default App;
