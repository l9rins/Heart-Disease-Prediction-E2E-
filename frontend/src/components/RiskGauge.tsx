/**
 * RiskGauge Component
 * Animated SVG gauge for displaying risk score
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface RiskGaugeProps {
    value: number; // 0-100 percentage
    size?: number;
    strokeWidth?: number;
}

export function RiskGauge({ value, size = 200, strokeWidth = 12 }: RiskGaugeProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Calculate the arc: 75% of circle (270 degrees)
    const arcLength = circumference * 0.75;
    const dashOffset = arcLength - (value / 100) * arcLength;

    const color = useMemo(() => {
        if (value < 30) return '#10b981'; // green
        if (value < 70) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    }, [value]);

    const riskLabel = useMemo(() => {
        if (value < 30) return 'Low Risk';
        if (value < 70) return 'Medium Risk';
        return 'High Risk';
    }, [value]);

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-[135deg]"
            >
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${arcLength} ${circumference}`}
                    strokeLinecap="round"
                />

                {/* Animated progress arc */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${arcLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: arcLength }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        filter: `drop-shadow(0 0 10px ${color})`,
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-4xl font-bold"
                    style={{ color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                >
                    {Math.round(value)}%
                </motion.span>
                <motion.span
                    className="text-sm font-medium text-gray-400 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    {riskLabel}
                </motion.span>
            </div>
        </div>
    );
}

export default RiskGauge;
