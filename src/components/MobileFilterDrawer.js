'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountryFlag from 'react-country-flag';
import { FaTimes } from 'react-icons/fa';
// Import EU_COUNTRIES if it's used for any logic within this component directly
// For now, assuming countryOptions passed as props already factor this in or are sufficient.
// import { EU_COUNTRIES } from '@/data/resources'; // Example if needed

export default function MobileFilterDrawer({
  isOpen,
  toggleDrawer,
  filters,
  countryOptions, // Expecting this to be the full list of { label, value, code }
  dataTypeOptions, // Expecting this to be an array of strings
  paymentTypes, // Expecting this to be PAYMENT_TYPES from data/resources.js
  handleCheckboxChange,
  handlePaymentCheckboxChange,
  handleResetFilters,
  renderFilterContent // This function is passed from the parent to render the core filter UI
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleDrawer}
            className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
            aria-hidden="true" // Background dimmers are often decorative
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-3/4 max-w-[280px] bg-white z-50 shadow-lg overflow-y-auto flex flex-col lg:hidden rounded-l-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-drawer-title"
          >
            <div className="flex justify-between items-center p-3 border-b border-gray-200 sticky top-0 bg-white rounded-tl-lg z-10">
              <h2 id="filter-drawer-title" className="text-sm font-medium uppercase text-google-text-secondary">Filter By</h2>
              <button
                onClick={toggleDrawer}
                className="text-google-text-secondary hover:text-google-text p-1"
                aria-label="Close filter drawer"
              >
                <FaTimes size="1.2em" />
              </button>
            </div>

            {/* Active Filters Display Area */}
            {(filters.countries.length > 0 || filters.dataTypes.length > 0 || filters.compensationTypes.length > 0) && (
              <div className="p-3 border-b border-gray-200 flex flex-wrap gap-1.5">
                {/* Countries */}
                {[...filters.countries].sort((a, b) => a.localeCompare(b)).map(value => {
                  const countryOption = countryOptions.find(opt => opt.value === value);
                  const label = countryOption?.label || value;
                  const code = countryOption?.code;
                  return (
                    <span key={`sel-ctry-drawer-${value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                      {label}
                      {code && <CountryFlag countryCode={code} svg style={{ width: '1em', height: '0.8em', marginLeft: '4px' }} />}
                      <button
                        onClick={() => handleCheckboxChange('countries', value, false)}
                        className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${label} filter`}>
                        <FaTimes size="0.9em" />
                      </button>
                    </span>
                  );
                })}
                {/* Data Types */}
                {[...filters.dataTypes].sort((a, b) => a.localeCompare(b)).map(value => (
                  <span key={`sel-dt-drawer-${value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                    {value}
                    <button
                      onClick={() => handleCheckboxChange('dataTypes', value, false)}
                      className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${value} filter`}>
                      <FaTimes size="0.9em" />
                    </button>
                  </span>
                ))}
                {/* Compensation Types */}
                {[...filters.compensationTypes]
                  .sort((a, b) => paymentTypes.map(p => p.value).indexOf(a.value) - paymentTypes.map(p => p.value).indexOf(b.value))
                  .map(option => (
                    <span key={`sel-pay-drawer-${option.value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                      {option.emoji} {option.label}
                      <button
                        onClick={() => handlePaymentCheckboxChange(option, false)}
                        className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${option.label} filter`}>
                        <FaTimes size="0.9em" />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            <div className="flex-grow overflow-y-auto p-3">
              {/* Render filter content using the passed function */}
              {renderFilterContent()}
            </div>

            <div className="p-3 border-t border-gray-200 flex justify-end gap-2 sticky bottom-0 bg-white rounded-bl-lg z-10">
              <button
                onClick={() => {
                  handleResetFilters();
                }}
                className="px-4 py-2 rounded border border-gray-300 text-google-text text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={toggleDrawer}
                className="px-4 py-2 rounded bg-google-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 