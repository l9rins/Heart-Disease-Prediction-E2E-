/**
 * HeartForm Component
 * Main form for heart disease prediction input
 */

import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
    User, Activity, Heart, Stethoscope, Zap,
    BarChart3, CircleDot, Loader2
} from 'lucide-react';
import { InputCard } from './InputCard';
import type { HeartInputData } from '../types';
import { FIELD_CONFIG, DEFAULT_VALUES } from '../types';

// Zod schema matching Pydantic backend validation
const heartSchema = z.object({
    age: z.number().min(25).max(80),
    sex: z.literal(0).or(z.literal(1)),
    cp: z.literal(1).or(z.literal(2)).or(z.literal(3)).or(z.literal(4)),
    trestbps: z.number().min(90).max(250),
    chol: z.number().min(100).max(600),
    fbs: z.literal(0).or(z.literal(1)),
    restecg: z.literal(0).or(z.literal(1)).or(z.literal(2)),
    thalach: z.number().min(60).max(220),
    exang: z.literal(0).or(z.literal(1)),
    oldpeak: z.number().min(0).max(7),
    slope: z.literal(1).or(z.literal(2)).or(z.literal(3)),
    ca: z.literal(0).or(z.literal(1)).or(z.literal(2)).or(z.literal(3)).or(z.literal(4)),
    thal: z.literal(3).or(z.literal(6)).or(z.literal(7)),
});

interface HeartFormProps {
    onSubmit: (data: HeartInputData) => void;
    isLoading: boolean;
    presetData?: HeartInputData | null;
    onPresetApplied?: () => void;
}

// Pill button component
interface PillButtonProps {
    options: { value: number; label: string }[];
    value: number;
    onChange: (value: number) => void;
    name: string;
}

function PillButton({ options, value, onChange, name }: PillButtonProps) {
    return (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={value === option.value}
                    onClick={() => onChange(option.value)}
                    className={`toggle-pill ${value === option.value ? 'toggle-pill-active' : ''}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

// Slider component
interface SliderInputProps {
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
    name: string;
    unit?: string;
}

function SliderInput({ min, max, step, value, onChange, name, unit = '' }: SliderInputProps) {
    const progress = ((value - min) / (max - min)) * 100;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{min}{unit}</span>
                <span className="text-lg font-semibold text-medical-green">{value}{unit}</span>
                <span className="text-sm text-gray-400">{max}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
                aria-label={name}
            />
        </div>
    );
}

export function HeartForm({ onSubmit, isLoading, presetData, onPresetApplied }: HeartFormProps) {
    const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<HeartInputData>({
        resolver: zodResolver(heartSchema),
        defaultValues: DEFAULT_VALUES,
        mode: 'onChange',
    });

    // Apply preset data when it changes
    useEffect(() => {
        if (presetData) {
            reset(presetData);
            onPresetApplied?.();
        }
    }, [presetData, reset, onPresetApplied]);

    const formValues = watch();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Demographics Section */}
                <InputCard title="Demographics" icon={<User />} className="lg:col-span-2">
                    <div className="space-y-6">
                        {/* Age Slider */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Age (years)
                            </label>
                            <Controller
                                name="age"
                                control={control}
                                render={({ field }) => (
                                    <SliderInput
                                        min={25}
                                        max={80}
                                        step={1}
                                        value={field.value}
                                        onChange={field.onChange}
                                        name="age"
                                    />
                                )}
                            />
                        </div>

                        {/* Sex Pills */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Biological Sex
                            </label>
                            <Controller
                                name="sex"
                                control={control}
                                render={({ field }) => (
                                    <PillButton
                                        options={FIELD_CONFIG.sex.options!}
                                        value={field.value}
                                        onChange={field.onChange}
                                        name="sex"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </InputCard>

                {/* Chest Pain Section */}
                <InputCard title="Chest Pain" icon={<Heart />} className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Chest Pain Type
                    </label>
                    <Controller
                        name="cp"
                        control={control}
                        render={({ field }) => (
                            <PillButton
                                options={FIELD_CONFIG.cp.options!}
                                value={field.value}
                                onChange={field.onChange}
                                name="chest-pain"
                            />
                        )}
                    />
                </InputCard>

                {/* Blood Pressure */}
                <InputCard title="Resting Blood Pressure" icon={<Activity />}>
                    <Controller
                        name="trestbps"
                        control={control}
                        render={({ field }) => (
                            <SliderInput
                                min={90}
                                max={250}
                                step={1}
                                value={field.value}
                                onChange={field.onChange}
                                name="blood-pressure"
                                unit=" mmHg"
                            />
                        )}
                    />
                </InputCard>

                {/* Cholesterol */}
                <InputCard title="Cholesterol" icon={<BarChart3 />}>
                    <Controller
                        name="chol"
                        control={control}
                        render={({ field }) => (
                            <SliderInput
                                min={100}
                                max={600}
                                step={1}
                                value={field.value}
                                onChange={field.onChange}
                                name="cholesterol"
                                unit=" mg/dl"
                            />
                        )}
                    />
                </InputCard>

                {/* Fasting Blood Sugar */}
                <InputCard title="Fasting Blood Sugar" icon={<CircleDot />}>
                    <Controller
                        name="fbs"
                        control={control}
                        render={({ field }) => (
                            <PillButton
                                options={FIELD_CONFIG.fbs.options!}
                                value={field.value}
                                onChange={field.onChange}
                                name="fasting-blood-sugar"
                            />
                        )}
                    />
                </InputCard>

                {/* Resting ECG */}
                <InputCard title="Resting ECG" icon={<Zap />}>
                    <Controller
                        name="restecg"
                        control={control}
                        render={({ field }) => (
                            <PillButton
                                options={FIELD_CONFIG.restecg.options!}
                                value={field.value}
                                onChange={field.onChange}
                                name="resting-ecg"
                            />
                        )}
                    />
                </InputCard>

                {/* Max Heart Rate */}
                <InputCard title="Max Heart Rate" icon={<Heart />}>
                    <Controller
                        name="thalach"
                        control={control}
                        render={({ field }) => (
                            <SliderInput
                                min={60}
                                max={220}
                                step={1}
                                value={field.value}
                                onChange={field.onChange}
                                name="max-heart-rate"
                                unit=" bpm"
                            />
                        )}
                    />
                </InputCard>

                {/* Exercise Angina */}
                <InputCard title="Exercise Induced Angina" icon={<Activity />}>
                    <Controller
                        name="exang"
                        control={control}
                        render={({ field }) => (
                            <PillButton
                                options={FIELD_CONFIG.exang.options!}
                                value={field.value}
                                onChange={field.onChange}
                                name="exercise-angina"
                            />
                        )}
                    />
                </InputCard>

                {/* ST Depression */}
                <InputCard title="ST Depression" icon={<BarChart3 />}>
                    <Controller
                        name="oldpeak"
                        control={control}
                        render={({ field }) => (
                            <SliderInput
                                min={0}
                                max={7}
                                step={0.1}
                                value={field.value}
                                onChange={field.onChange}
                                name="st-depression"
                            />
                        )}
                    />
                </InputCard>

                {/* ST Slope */}
                <InputCard title="ST Slope" icon={<BarChart3 />}>
                    <Controller
                        name="slope"
                        control={control}
                        render={({ field }) => (
                            <PillButton
                                options={FIELD_CONFIG.slope.options!}
                                value={field.value}
                                onChange={field.onChange}
                                name="st-slope"
                            />
                        )}
                    />
                </InputCard>

                {/* Major Vessels */}
                <InputCard title="Major Vessels (Fluoroscopy)" icon={<Stethoscope />}>
                    <Controller
                        name="ca"
                        control={control}
                        render={({ field }) => (
                            <PillButton
                                options={FIELD_CONFIG.ca.options!}
                                value={field.value}
                                onChange={field.onChange}
                                name="major-vessels"
                            />
                        )}
                    />
                </InputCard>

                {/* Thalassemia */}
                <InputCard title="Thalassemia" icon={<CircleDot />}>
                    <Controller
                        name="thal"
                        control={control}
                        render={({ field }) => (
                            <PillButton
                                options={FIELD_CONFIG.thal.options!}
                                value={field.value}
                                onChange={field.onChange}
                                name="thalassemia"
                            />
                        )}
                    />
                </InputCard>

            </div>

            {/* Submit Button */}
            <motion.div
                className="flex justify-center pt-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full max-w-md flex items-center justify-center gap-3 text-lg py-4"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Heart className="w-6 h-6" />
                            Analyze Heart Disease Risk
                        </>
                    )}
                </button>
            </motion.div>

            {/* Validation Errors */}
            {Object.keys(errors).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 bg-risk-red/10 border-risk-red/30"
                >
                    <p className="text-risk-red text-sm">
                        Please correct the following errors:
                    </p>
                    <ul className="list-disc list-inside text-risk-red-light text-xs mt-2">
                        {Object.entries(errors).map(([key, error]) => (
                            <li key={key}>{key}: {error?.message || 'Invalid value'}</li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </form>
    );
}

export default HeartForm;
