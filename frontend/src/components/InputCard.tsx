/**
 * InputCard Component
 * Glassmorphism container for form sections
 */

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface InputCardProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    className?: string;
    span?: number;
}

export function InputCard({ title, icon, children, className = '', span = 1 }: InputCardProps) {
    const gridSpan = span > 1 ? `col-span-1 md:col-span-${span}` : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`glass-card-hover p-6 ${gridSpan} ${className}`}
        >
            <div className="flex items-center gap-3 mb-4">
                <span className="text-medical-green text-xl">{icon}</span>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            {children}
        </motion.div>
    );
}

export default InputCard;
