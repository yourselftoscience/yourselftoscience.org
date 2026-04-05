'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBannerForm() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    useEffect(() => {
        // Only show if not previously dismissed in this session
        const dismissed = sessionStorage.getItem('yts_top_banner_dismissed');
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('yts_top_banner_dismissed', 'true');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) return;

        setStatus('loading');
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, preferences: {} }),
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    handleDismiss();
                }, 3000); // Auto dismiss after showing success
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 text-white"
                >
                    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-sm md:text-base">
                        
                        {/* Message */}
                        <div className="flex-1 text-center md:text-left font-medium text-blue-50">
                            Support open science. Join our registry for the latest research opportunities.
                        </div>

                        {/* Compact Form */}
                        <form onSubmit={handleSubmit} className="flex w-full md:w-auto items-center gap-2">
                            <div className="relative w-full md:w-64">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (status === 'error') setStatus('idle');
                                    }}
                                    placeholder="Enter your email..."
                                    disabled={status === 'loading' || status === 'success'}
                                    className="w-full px-3 py-1.5 text-gray-900 bg-white border border-transparent rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none focus:border-transparent text-sm placeholder-gray-500 disabled:opacity-70"
                                    required
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={status === 'loading' || status === 'success'}
                                className={`px-4 py-1.5 font-semibold text-sm rounded-md transition-all whitespace-nowrap ${
                                    status === 'success' 
                                    ? 'bg-green-500 text-white cursor-default'
                                    : 'bg-white text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-white focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed'
                                }`}
                            >
                                {status === 'loading' ? 'Sending...' : status === 'success' ? 'Joined!' : 'Subscribe'}
                            </button>
                        </form>

                        {/* Dismiss Box (X) */}
                        <button
                            onClick={handleDismiss}
                            className="absolute right-2 top-2 md:relative md:right-0 md:top-0 p-1 text-blue-200 hover:text-white rounded-full transition-colors focus:ring-2 focus:ring-white focus:outline-none"
                            aria-label="Dismiss banner"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
