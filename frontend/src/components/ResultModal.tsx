/**
 * ResultModal Component
 * Animated modal for displaying prediction results
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, AlertCircle, Heart } from 'lucide-react';
import type { PredictionResponse } from '../types';
import { RiskGauge } from './RiskGauge';

interface ResultModalProps {
    result: PredictionResponse | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ResultModal({ result, isOpen, onClose }: ResultModalProps) {
    if (!result) return null;

    const isHighRisk = result.risk_score >= 0.7;
    const riskPercentage = result.risk_score * 100;

    const getRiskIcon = () => {
        if (result.risk_score < 0.3) return <CheckCircle className="w-8 h-8 text-medical-green" />;
        if (result.risk_score < 0.7) return <AlertCircle className="w-8 h-8 text-risk-yellow" />;
        return <AlertTriangle className="w-8 h-8 text-risk-red" />;
    };

    const getBackgroundGradient = () => {
        if (result.risk_score < 0.3) return 'from-medical-green/5 to-transparent';
        if (result.risk_score < 0.7) return 'from-risk-yellow/5 to-transparent';
        return 'from-risk-red/5 to-transparent';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                       w-full max-w-md z-50 glass-card p-8 
                       bg-gradient-to-br ${getBackgroundGradient()}`}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            {getRiskIcon()}
                            <h2 className="text-2xl font-bold text-white">Prediction Result</h2>
                        </div>

                        {/* Gauge */}
                        <div className="flex justify-center mb-6">
                            <motion.div
                                animate={isHighRisk ? { scale: [1, 1.05, 1] } : {}}
                                transition={isHighRisk ? { repeat: Infinity, duration: 1.5 } : {}}
                            >
                                <RiskGauge value={riskPercentage} size={180} />
                            </motion.div>
                        </div>

                        {/* Risk Label */}
                        <div className="text-center mb-6">
                            <motion.div
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold
                           ${result.risk_label === 'Low Risk' ? 'bg-medical-green/20 text-medical-green' :
                                        result.risk_label === 'Medium Risk' ? 'bg-risk-yellow/20 text-risk-yellow' :
                                            'bg-risk-red/20 text-risk-red'}`}
                                animate={isHighRisk ? { scale: [1, 1.02, 1] } : {}}
                                transition={isHighRisk ? { repeat: Infinity, duration: 0.8 } : {}}
                            >
                                {isHighRisk && (
                                    <Heart className="w-5 h-5 animate-heartbeat" />
                                )}
                                {result.risk_label}
                            </motion.div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="glass-card p-4 text-center">
                                <p className="text-gray-400 text-sm mb-1">Prediction</p>
                                <p className="text-xl font-bold text-white">
                                    {result.prediction_class === 1 ? 'Disease Likely' : 'No Disease'}
                                </p>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <p className="text-gray-400 text-sm mb-1">Confidence</p>
                                <p className="text-xl font-bold text-white">
                                    {Math.round(result.confidence * 100)}%
                                </p>
                            </div>
                        </div>

                        {/* Warning Message */}
                        {result.warning_message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 p-4 bg-risk-red/10 border border-risk-red/30 rounded-xl mb-6"
                            >
                                <AlertTriangle className="w-5 h-5 text-risk-red flex-shrink-0 mt-0.5" />
                                <p className="text-risk-red-light text-sm">{result.warning_message}</p>
                            </motion.div>
                        )}

                        {/* Disclaimer */}
                        <p className="text-gray-500 text-xs text-center">
                            This is a screening tool only. Please consult a healthcare professional for diagnosis.
                        </p>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="w-full mt-6 btn-primary"
                        >
                            Close
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default ResultModal;
