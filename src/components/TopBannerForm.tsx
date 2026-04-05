'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiGlobe, FiPlusCircle } from 'react-icons/fi';
import { FaTransgender } from 'react-icons/fa';
import { BsCalendarEvent } from 'react-icons/bs';
// @ts-ignore
import { getData } from 'country-list';
import Select from 'react-select';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopBannerForm() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Exact Mailchimp spec fields
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [country, setCountry] = useState<any[]>([]);
    const [gender, setGender] = useState('');
    const [yearOfBirth, setYearOfBirth] = useState('');
    const [researchTopics, setResearchTopics] = useState('');
    
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const formRef = useRef<HTMLDivElement>(null);

    const countryOptions = useMemo(() => {
        return getData().map((c: any) => ({
            value: c.name,
            label: c.name,
        }));
    }, []);

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const dismissed = sessionStorage.getItem('yts_top_banner_dismissed');
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    // Handle clicking outside to collapse
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formRef.current && !formRef.current.contains(event.target as Node)) {
                if (isExpanded && email === '' && firstName === '') {
                    setIsExpanded(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded, email, firstName]);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('yts_top_banner_dismissed', 'true');
    };

    const handleCountryChange = (selectedOptions: any) => {
        setCountry(selectedOptions || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) return;

        setStatus('loading');
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    preferences: {
                        firstName,
                        country: country.map((c: any) => c.value),
                        gender,
                        yearOfBirth,
                        researchTopics,
                        signupSource: pathname
                    } 
                }),
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    handleDismiss();
                }, 3000);
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-gradient-to-r from-blue-700 to-indigo-800 text-white z-[100] overflow-visible"
                    ref={formRef}
                >
                    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 text-sm md:text-base">
                        
                        {/* Message */}
                        <div className={`flex-1 text-left font-medium text-blue-50 pr-8 md:pr-0 transition-all ${isExpanded ? 'md:mb-auto md:mt-2' : ''}`}>
                            Support open science. Subscribe to our newsletter for the latest research opportunities.
                        </div>

                        {/* Expandable Form Container */}
                        <div className="flex flex-col w-full md:w-auto relative">
                            <form onSubmit={handleSubmit} className="flex w-full items-center gap-2 relative z-10">
                                <div className={`relative w-full transition-all duration-300 ${isExpanded ? 'md:w-96' : 'md:w-64'}`}>
                                    <input
                                        type="email"
                                        value={email}
                                        onFocus={() => setIsExpanded(true)}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (status === 'error') setStatus('idle');
                                        }}
                                        placeholder="Enter your email..."
                                        disabled={status === 'loading' || status === 'success'}
                                        className="w-full px-3 py-1.5 text-gray-900 bg-white border border-transparent rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none focus:border-transparent text-sm placeholder-gray-500 disabled:opacity-70 shadow-sm"
                                        required
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || status === 'success'}
                                    className={`px-4 py-1.5 font-semibold text-sm rounded-md transition-all whitespace-nowrap shadow-sm ${
                                        status === 'success' 
                                        ? 'bg-green-500 text-white cursor-default'
                                        : 'bg-white text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-white focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed'
                                    }`}
                                >
                                    {status === 'loading' ? 'Sending...' : status === 'success' ? 'Joined!' : 'Subscribe'}
                                </button>
                            </form>

                            {/* Exact NewsletterSignup Expanded Parity */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full md:absolute md:top-full mt-2 md:mt-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 p-6 z-50 md:right-0 md:w-[600px] shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                                    >
                                        <div className="relative z-10 w-full max-w-full">
                                            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                                Personalize Your Experience (Optional)
                                            </h2>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* First Name */}
                                                <div className="relative flex-grow">
                                                    <label htmlFor="top-firstname" className="sr-only">First Name (Optional)</label>
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                                                        <FiUser />
                                                    </span>
                                                    <input 
                                                        id="top-firstname"
                                                        type="text" 
                                                        name="firstName"
                                                        placeholder="First Name"
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-gray-900"
                                                    />
                                                </div>

                                                {/* Country Select */}
                                                <div className="relative flex-grow">
                                                    <label htmlFor="top-country-select" className="sr-only">Country or Region</label>
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                                                        <FiGlobe />
                                                    </span>
                                                    <Select
                                                        inputId="top-country-select"
                                                        isMulti
                                                        name="country"
                                                        options={countryOptions}
                                                        onChange={handleCountryChange}
                                                        placeholder="Country or Region"
                                                        aria-label="Country or Region"
                                                        styles={{
                                                            control: (base) => ({
                                                                ...base,
                                                                paddingLeft: '2.5rem',
                                                                minHeight: '46px',
                                                                border: '1px solid #D1D5DB',
                                                                borderRadius: '0.5rem',
                                                                boxShadow: 'none',
                                                                '&:hover': { borderColor: '#9CA3AF' },
                                                            }),
                                                            menu: (base) => ({ ...base, zIndex: 110 }),
                                                            valueContainer: (base) => ({ ...base, padding: '0 4px' }),
                                                            placeholder: (base) => ({ ...base, color: '#6B7280' }),
                                                            input: (base) => ({ ...base, margin: '0', padding: '0' }),
                                                        }}
                                                    />
                                                </div>

                                                {/* Gender */}
                                                <div className="relative flex-grow">
                                                    <label htmlFor="top-gender" className="sr-only">Gender (Optional)</label>
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                                                        <FaTransgender />
                                                    </span>
                                                    <select
                                                        id="top-gender"
                                                        name="gender"
                                                        value={gender}
                                                        onChange={(e) => setGender(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-gray-900 appearance-none"
                                                    >
                                                        <option value="" disabled>Gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Non-binary">Non-binary</option>
                                                        <option value="Prefer not to say">Prefer not to say</option>
                                                    </select>
                                                </div>

                                                {/* Year of Birth */}
                                                <div className="relative flex-grow">
                                                    <label htmlFor="top-yob" className="sr-only">Year of Birth (Optional)</label>
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                                                        <BsCalendarEvent />
                                                    </span>
                                                    <select
                                                        id="top-yob"
                                                        name="yearOfBirth"
                                                        value={yearOfBirth}
                                                        onChange={(e) => setYearOfBirth(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-gray-900 appearance-none"
                                                    >
                                                        <option value="" disabled>Year of Birth</option>
                                                        {Array.from({ length: 100 }, (_, i) => (
                                                            <option key={i} value={currentYear - i}>{currentYear - i}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                {/* Topics */}
                                                <div className="md:col-span-2">
                                                    <label htmlFor="top-interests" className="block text-sm font-medium text-gray-700 mb-2 mt-2">
                                                        Topics you&apos;re interested in (Optional)
                                                    </label>
                                                    <div className="relative flex-grow">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                                                            <FiPlusCircle />
                                                        </span>
                                                        <input
                                                            id="top-interests"
                                                            type="text"
                                                            name="researchTopics"
                                                            placeholder="e.g., Cancer research, Longevity, Wearable data, Cystic Fibrosis research"
                                                            value={researchTopics}
                                                            onChange={(e) => setResearchTopics(e.target.value)}
                                                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Privacy Policy Text */}
                                            <p className="text-sm text-gray-600 mt-5 text-center px-4">
                                                By subscribing, you agree to receive our newsletter and curated opportunities based on your interests. See our{' '}
                                                <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    Privacy Policy
                                                </Link>
                                                .
                                            </p>
                                            
                                            <div className="text-center mt-6">
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleSubmit(e as unknown as React.FormEvent);
                                                    }}
                                                    disabled={status === 'loading'}
                                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 disabled:bg-gray-400 w-full md:w-auto"
                                                >
                                                    {status === 'loading' ? 'Subscribing...' : 'Subscribe to Newsletter'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Dismiss Box (X) */}
                        <div className={`md:ml-2 transition-all ${isExpanded ? 'md:mb-auto md:mt-1' : ''}`}>
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
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
