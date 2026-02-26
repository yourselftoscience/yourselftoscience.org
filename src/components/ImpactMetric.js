'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

export default function ImpactMetric({ value, label, suffix = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.5 });

    // Spring physics for smooth counting
    const springValue = useSpring(0, {
        stiffness: 75,
        damping: 15,
        mass: 1,
        restDelta: 0.001
    });

    // Determine target value (handle non-numeric gracefully if needed, though value usually number)
    const targetValue = typeof value === 'number' ? value : 0;

    useEffect(() => {
        if (isInView) {
            springValue.set(targetValue);
        } else {
            // Optional: reset when out of view if you want it to animate every time
            // springValue.set(0); 
        }
    }, [isInView, targetValue, springValue]);

    // Format the number for display (no decimal points)
    const displayValue = useTransform(springValue, (current) => Math.round(current).toLocaleString());

    return (
        <div ref={ref} className="flex flex-col items-center">
            <motion.div
                className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-indigo-700 tracking-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <motion.span>{displayValue}</motion.span>
                {suffix && <span className="text-4xl md:text-5xl ml-1 text-indigo-400">{suffix}</span>}
            </motion.div>
            <motion.div
                className="mt-2 text-sm md:text-base font-semibold text-gray-500 uppercase tracking-widest"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {label}
            </motion.div>
        </div>
    );
}
