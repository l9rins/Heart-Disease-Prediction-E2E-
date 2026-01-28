/**
 * SamplePresets Component
 * Quick-fill buttons for demo profiles
 */

import { motion } from 'framer-motion';
import { Zap, Shield, AlertTriangle } from 'lucide-react';
import type { SamplePreset } from '../types';
import { SAMPLE_PRESETS } from '../types';

interface SamplePresetsProps {
    onSelect: (preset: SamplePreset) => void;
}

const riskIcons = {
    low: Shield,
    medium: Zap,
    high: AlertTriangle,
};

const riskColors = {
    low: 'text-medical-green border-medical-green/30 hover:bg-medical-green/10',
    medium: 'text-amber-400 border-amber-400/30 hover:bg-amber-400/10',
    high: 'text-risk-red border-risk-red/30 hover:bg-risk-red/10',
};

export function SamplePresets({ onSelect }: SamplePresetsProps) {
    return (
        <div className="glass-card p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
                Quick Fill: Sample Profiles
            </h3>
            <div className="flex flex-wrap gap-3">
                {SAMPLE_PRESETS.map((preset) => {
                    const Icon = riskIcons[preset.riskLevel];
                    return (
                        <motion.button
                            key={preset.name}
                            type="button"
                            onClick={() => onSelect(preset)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${riskColors[preset.riskLevel]}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{preset.name}</span>
                        </motion.button>
                    );
                })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Click a profile to auto-fill the form with sample data
            </p>
        </div>
    );
}

export default SamplePresets;
