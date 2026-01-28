/**
 * HistoryPanel Component
 * Displays prediction history with quick-reload functionality
 */

import { motion, AnimatePresence } from 'framer-motion';
import { History, Clock, Trash2 } from 'lucide-react';
import type { PredictionHistoryEntry, HeartInputData } from '../types';

interface HistoryPanelProps {
    history: PredictionHistoryEntry[];
    onLoadEntry: (input: HeartInputData) => void;
    onClear: () => void;
}

const getRiskColor = (riskLabel: string) => {
    switch (riskLabel) {
        case 'Low Risk':
            return 'text-medical-green bg-medical-green/10 border-medical-green/30';
        case 'Medium Risk':
            return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
        case 'High Risk':
            return 'text-risk-red bg-risk-red/10 border-risk-red/30';
        default:
            return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
};

const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

    return date.toLocaleDateString();
};

export function HistoryPanel({ history, onLoadEntry, onClear }: HistoryPanelProps) {
    if (history.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-6"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-400">
                        Recent Predictions ({history.length})
                    </h3>
                </div>
                <button
                    onClick={onClear}
                    className="text-gray-500 hover:text-risk-red text-xs flex items-center gap-1 transition-colors"
                >
                    <Trash2 className="w-3 h-3" />
                    Clear
                </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                    {history.slice(0, 5).map((entry, index) => (
                        <motion.button
                            key={entry.id}
                            type="button"
                            onClick={() => onLoadEntry(entry.input)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ delay: index * 0.05 }}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-cyber-dark/50 border border-glass-border hover:border-gray-600 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`px-2 py-1 rounded text-xs font-medium border ${getRiskColor(entry.result.risk_label)}`}>
                                    {(entry.result.risk_score * 100).toFixed(0)}%
                                </div>
                                <div>
                                    <div className="text-sm text-gray-300">
                                        Age {entry.input.age}, {entry.input.sex === 1 ? 'Male' : 'Female'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {entry.result.risk_label}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {formatTime(entry.timestamp)}
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            <p className="text-xs text-gray-500 mt-2">
                Click an entry to reload that input
            </p>
        </motion.div>
    );
}

export default HistoryPanel;
