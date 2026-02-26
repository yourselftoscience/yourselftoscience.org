'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaChevronDown } from 'react-icons/fa';

/**
 * A reusable multi-select dropdown component used in the wizard-style pages.
 * Supports both inline (sentence-builder) and pill-button styles.
 */
export default function MultiSelectDropdown({
    label,
    selectedValues,
    options,
    isOpen,
    setIsOpen,
    onToggle,
    buttonClassName,
    textClassName,
}) {
    // Derived display text
    const getDisplayText = () => {
        if (selectedValues.length === 0) return label;
        if (selectedValues.includes('Any Country')) return 'Any Country';
        if (selectedValues.length === 1) {
            const selectedVal = selectedValues[0];
            const optionMatch = options.find(opt =>
                (typeof opt === 'string' ? opt : opt.value) === selectedVal
            );
            return optionMatch ? (typeof optionMatch === 'string' ? optionMatch : optionMatch.label) : selectedVal;
        }
        return `${selectedValues.length} selected`;
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={buttonClassName || "inline-flex items-center gap-2 mx-1 border-b-2 border-blue-600 border-dashed text-blue-700 font-bold hover:text-blue-800 hover:border-blue-800 transition-colors px-1"}
            >
                <span className={textClassName || ""}>{getDisplayText()}</span>
                <FaChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 max-h-80 overflow-y-auto bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-20"
                        >
                            <div className="py-1">
                                {options.map((opt) => {
                                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                                    const optValue = typeof opt === 'string' ? opt : opt.value;
                                    const isSelected = selectedValues.includes(optValue);

                                    return (
                                        <button
                                            key={optValue || 'default'}
                                            onClick={() => onToggle(optValue)}
                                            className={`flex w-full items-center justify-between px-4 py-2.5 text-sm md:text-base hover:bg-slate-50 text-left ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                                                }`}
                                        >
                                            <span className="pr-4">{optLabel}</span>
                                            {isSelected && <FaCheck className="w-3 h-3 text-blue-600 flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
