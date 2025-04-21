// src/app/page.js

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import Footer from '@/components/Footer';
import { resources as allResources, citationMap, uniqueCitations } from '@/data/resources';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import CountryFlag from 'react-country-flag';
import { FaHeart, FaDollarSign, FaTimes, FaFilter } from 'react-icons/fa';
import Header from '@/components/Header';
import ResourceGrid from '@/components/ResourceGrid';

// Dynamically import react-select
const Select = dynamic(() => import('react-select'), { ssr: false });

// --- Constants and Helper Functions ---
const EU_COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden'
];

const PAYMENT_TYPES = [
  { value: 'donation', label: 'Donation', emoji: '❤️' },
  { value: 'payment', label: 'Payment', emoji: '💵' },
  { value: 'mixed', label: 'Mixed', emoji: '❤️💵' }
];

function expandCountries(chosen) {
  const set = new Set(chosen);
  const hasEU = set.has('European Union');
  const hasAnyEUCountry = chosen.some(c => EU_COUNTRIES.includes(c));

  if (hasEU) {
    EU_COUNTRIES.forEach((c) => set.add(c));
    if (!chosen.includes('European Union')) {
      set.add('European Union');
    }
  } else if (hasAnyEUCountry) {
    set.add('European Union');
    chosen.forEach(c => {
      if (EU_COUNTRIES.includes(c)) {
        set.add(c);
      }
    });
  }

  chosen.forEach(c => {
    if (!EU_COUNTRIES.includes(c) && c !== 'European Union') {
      set.add(c);
    }
  });

  return Array.from(set);
}

// --- Main Page Component ---
export default function Home() {
  const [filters, setFilters] = useState({
    dataTypes: [],
    countries: [],
    paymentTypes: [],
    searchTerm: '',
  });
  const [showMoreDataTypes, setShowMoreDataTypes] = useState(false);
  const [showMoreCountries, setShowMoreCountries] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const { scrollY } = useScroll();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dataTypeOptions = useMemo(() => Array.from(
    new Set(allResources.flatMap((resource) => resource.dataTypes || []))
  )
    .sort((a, b) => a.localeCompare(b))
    , []);

  const countryOptions = useMemo(() => {
    const countries = new Set();
    const countryCodeMap = new Map();
    allResources.forEach((resource) => {
      resource.countries?.forEach((country, index) => {
        countries.add(country);
        if (resource.countryCodes?.[index] && !countryCodeMap.has(country)) {
          countryCodeMap.set(country, resource.countryCodes[index]);
        }
      });
    });
    if (allResources.some(r => r.countries?.includes('European Union'))) {
      countries.add('European Union');
      if (!countryCodeMap.has('European Union')) {
        countryCodeMap.set('European Union', 'EU');
      }
    }
    return Array.from(countries)
      .sort((a, b) => a.localeCompare(b))
      .map(country => ({ label: country, value: country, code: countryCodeMap.get(country) }));
  }, []);

  const processedResources = useMemo(() => {
    let filteredData = [...allResources];
    const lowerSearchTerm = filters.searchTerm.toLowerCase().trim();

    if (lowerSearchTerm) {
      filteredData = filteredData.filter(resource => {
        const titleMatch = resource.title && resource.title.toLowerCase().includes(lowerSearchTerm);
        const descriptionMatch = resource.description && resource.description.toLowerCase().includes(lowerSearchTerm);
        const dataTypeMatch = resource.dataTypes && resource.dataTypes.some(dt => dt.toLowerCase().includes(lowerSearchTerm));
        const countryMatch = resource.countries && resource.countries.some(c => c.toLowerCase().includes(lowerSearchTerm));
        const paymentTypeMatch = resource.paymentType && resource.paymentType.toLowerCase().includes(lowerSearchTerm);
        const citationMatch = resource.citations && resource.citations.some(cit =>
          (cit.title && cit.title.toLowerCase().includes(lowerSearchTerm)) ||
          (cit.link && cit.link.toLowerCase().includes(lowerSearchTerm))
        );
        return titleMatch || descriptionMatch || dataTypeMatch || countryMatch || paymentTypeMatch || citationMatch;
      });
    }

    if (filters.dataTypes.length > 0) {
      filteredData = filteredData.filter(resource =>
        resource.dataTypes && resource.dataTypes.some(rdt => filters.dataTypes.includes(rdt))
      );
    }

    const expandedCountries = expandCountries(filters.countries);
    if (expandedCountries.length > 0) {
      filteredData = filteredData.filter(resource =>
        !resource.countries || resource.countries.length === 0 ||
        (resource.countries && resource.countries.some(rc => expandedCountries.includes(rc)))
      );
    }

    const paymentValues = filters.paymentTypes.map(p => p.value);
    if (paymentValues.length > 0) {
      filteredData = filteredData.filter(resource =>
        resource.paymentType && paymentValues.includes(resource.paymentType)
      );
    }

    filteredData.sort((a, b) => a.title.localeCompare(b.title));

    return filteredData;
  }, [filters]);

  const handleCheckboxChange = (filterKey, value, isChecked) => {
    setFilters(prev => {
      const currentValues = prev[filterKey];
      let newValues;
      if (isChecked) {
        newValues = currentValues.includes(value) ? currentValues : [...currentValues, value];
      } else {
        newValues = currentValues.filter(item => item !== value);
      }
      return { ...prev, [filterKey]: newValues };
    });
  };

  const handlePaymentCheckboxChange = (option, isChecked) => {
    setFilters(prev => {
      const currentPayments = prev.paymentTypes;
      let newPayments;
      if (isChecked) {
        newPayments = currentPayments.some(p => p.value === option.value)
          ? currentPayments
          : [...currentPayments, option];
      } else {
        newPayments = currentPayments.filter(p => p.value !== option.value);
      }
      return { ...prev, paymentTypes: newPayments };
    });
  };

  const handleClearGroup = (filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: []
    }));
  };

  const handleSearchChange = (event) => {
    setFilters(prev => ({ ...prev, searchTerm: event.target.value }));
  };

  const toggleFilterDrawer = () => {
    setIsFilterDrawerOpen(!isFilterDrawerOpen);
  };

  const renderFilterGroup = (title, options, filterKey, showMore, setShowMore) => {
    const selectedValues = filters[filterKey];
    const visibleOptions = showMore ? options : options.slice(0, 3);
    const hasActiveFilters = selectedValues.length > 0;

    return (
      <div className="mb-4">
        <h3 className="font-medium text-xs uppercase text-google-text-secondary mb-1">{title}</h3>
        {hasActiveFilters && (
          <button
            onClick={() => handleClearGroup(filterKey)}
            className="text-base text-google-blue hover:underline mb-2 block"
            aria-label={`Clear ${title} filters`}
          >
            Clear all
          </button>
        )}
        {visibleOptions.map(option => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;
          const code = typeof option === 'object' ? option.code : null;

          return (
            <div key={value} className="flex items-center mb-1">
              <input
                type="checkbox"
                id={`${filterKey}-${value}`}
                value={value}
                checked={selectedValues.includes(value)}
                onChange={(e) => handleCheckboxChange(filterKey, value, e.target.checked)}
                className="mr-2 h-4 w-4 text-google-blue border-gray-300 rounded focus:ring-google-blue focus:ring-offset-0 focus:ring-1"
              />
              <label htmlFor={`${filterKey}-${value}`} className="text-base text-google-text flex items-center">
                {label}
                {code && (
                  <CountryFlag countryCode={code} svg style={{ width: '1em', height: '1em', marginLeft: '0.25em', display: 'inline-block', verticalAlign: 'middle' }} />
                )}
              </label>
            </div>
          );
        })}
        {options.length > 3 && (
          <button onClick={() => setShowMore(!showMore)} className="text-base text-google-blue hover:underline mt-1">
            {showMore ? 'Less' : `More (${options.length - 3})`}
          </button>
        )}
      </div>
    );
  };

  function handleDownloadCSV() {
    const headers = ['Title', 'Link', 'Data Types', 'Countries', 'Country Codes', 'Instructions', 'Payment Type', 'Description', 'Citations'];
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.map(h => `"${h}"`).join(',') + '\n';

    processedResources.forEach((resource) => {
      const data = [
        resource.title || '',
        resource.link || '',
        resource.dataTypes?.join('; ') || '',
        resource.countries?.join('; ') || '',
        resource.countryCodes?.join('; ') || '',
        resource.instructions?.join('; ') || '',
        resource.paymentType || '',
        resource.description || '',
        resource.citations?.map(c => `${c.title} (${c.link})`).join('; ') || ''
      ];
      csvContent += data.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'yourselftoscience_resources.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const renderFilterContent = () => (
    <>
      {isMounted && renderFilterGroup('Data Type', dataTypeOptions, 'dataTypes', showMoreDataTypes, setShowMoreDataTypes)}
      {isMounted && renderFilterGroup('Available In', countryOptions, 'countries', showMoreCountries, setShowMoreCountries)}
      <div className="mb-0">
        <h3 className="font-medium text-xs uppercase text-google-text-secondary mb-1">Compensation</h3>
        {filters.paymentTypes.length > 0 && (
          <button
            onClick={() => handleClearGroup('paymentTypes')}
            className="text-base text-google-blue hover:underline mb-2 block"
            aria-label="Clear Compensation filters"
          >
            Clear all
          </button>
        )}
        {PAYMENT_TYPES.map(option => (
          <div key={option.value} className="flex items-center mb-1">
            <input
              type="checkbox"
              id={`payment-${option.value}-mobile`}
              value={option.value}
              checked={filters.paymentTypes.some(p => p.value === option.value)}
              onChange={(e) => handlePaymentCheckboxChange(option, e.target.checked)}
              className="mr-2 h-4 w-4 text-google-blue border-gray-300 rounded focus:ring-google-blue focus:ring-offset-0 focus:ring-1"
            />
            <label htmlFor={`payment-${option.value}-mobile`} className="text-base text-google-text flex items-center">
              <span className="mr-1">{option.emoji}</span> {option.label}
            </label>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header scrollY={scrollY} />

      <div className="flex-grow w-full max-w-screen-xl mx-auto px-4 pb-8 pt-3">

        <p className="text-base text-google-text-secondary max-w-4xl mb-6">
          YourselfToScience.org provides a comprehensive list of services allowing individuals to contribute to scientific research. Browse our curated resources to find ways to share your data, genome, body samples, and more.
        </p>

        <div className="grid grid-cols-layout lg:grid-cols-lg-layout gap-6">
          <aside className="hidden lg:block py-4 px-4 sticky top-[calc(45px+1rem+4px)] h-[calc(100vh-100px)] overflow-y-auto">
            <div className="border border-gray-200 rounded-lg">
              <h2 className="text-xs font-medium uppercase text-google-text-secondary px-4 pt-4 pb-2 border-b border-gray-200">
                Filter By
              </h2>
              <div className="p-4">
                {renderFilterContent()}
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.open('https://github.com/yourselftoscience/yourselftoscience.org/issues/new?template=suggest-a-service.md', '_blank')}
                className="w-full px-4 py-2 rounded bg-google-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Suggest a Service
              </button>
              <button
                onClick={handleDownloadCSV}
                className="w-full mt-2 px-4 py-2 rounded border border-gray-300 text-google-text text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Download Dataset
              </button>
            </div>
          </aside>

          <main className="py-4">
            <div className="mb-4 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Filter results by keyword, country, data type..."
                value={filters.searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-google-blue focus:border-google-blue text-sm placeholder-google-text-secondary"
              />
              <button
                onClick={toggleFilterDrawer}
                className="lg:hidden px-4 py-2 rounded border border-gray-300 text-google-text text-sm font-medium hover:bg-gray-50 transition-colors flex items-center whitespace-nowrap"
              >
                <FaFilter className="mr-2" /> Filters
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2 items-center">
              {filters.dataTypes.map(value => (
                <span key={`badge-dt-${value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {value}
                  <button
                    onClick={() => handleCheckboxChange('dataTypes', value, false)}
                    className="ml-1.5 text-blue-500 hover:text-blue-700"
                    aria-label={`Remove ${value} filter`}
                  >
                    <FaTimes size="0.8em" />
                  </button>
                </span>
              ))}
              {filters.countries.map(value => {
                const countryOption = countryOptions.find(opt => opt.value === value);
                const label = countryOption?.label || value;
                const code = countryOption?.code;
                return (
                  <span key={`badge-ctry-${value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {label}
                    {code && <CountryFlag countryCode={code} svg style={{ width: '1em', height: '0.8em', marginLeft: '4px' }} />}
                    <button
                      onClick={() => handleCheckboxChange('countries', value, false)}
                      className="ml-1.5 text-blue-500 hover:text-blue-700"
                      aria-label={`Remove ${label} filter`}
                    >
                      <FaTimes size="0.8em" />
                    </button>
                  </span>
                );
              })}
              {filters.paymentTypes.map(option => (
                <span key={`badge-pay-${option.value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {option.emoji} {option.label}
                  <button
                    onClick={() => handlePaymentCheckboxChange(option, false)}
                    className="ml-1.5 text-blue-500 hover:text-blue-700"
                    aria-label={`Remove ${option.label} filter`}
                  >
                    <FaTimes size="0.8em" />
                  </button>
                </span>
              ))}
            </div>

            <ResourceGrid
              resources={processedResources}
              filters={filters}
              onFilterChange={handleCheckboxChange}
              onPaymentFilterChange={handlePaymentCheckboxChange}
              paymentTypesOptions={PAYMENT_TYPES}
            />

            {uniqueCitations.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-base font-medium mb-3 text-google-text">References</h2>
                <ol className="list-decimal pl-5 space-y-1">
                  {uniqueCitations.map((citation, idx) => (
                    <li key={idx} id={`ref-${idx + 1}`} className="text-sm text-google-text-secondary">
                      <a
                        href={citation.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-google-blue hover:underline break-words"
                        aria-label={`Reference ${idx + 1}: ${citation.title}`}
                      >
                        {citation.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleFilterDrawer}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-50 shadow-xl overflow-y-auto lg:hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-google-text">Filters</h2>
                  <button onClick={toggleFilterDrawer} className="text-google-text-secondary hover:text-google-text">
                    <FaTimes size="1.2em" />
                  </button>
                </div>
                {renderFilterContent()}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => window.open('https://github.com/yourselftoscience/yourselftoscience.org/issues/new?template=suggest-a-service.md', '_blank')}
                    className="w-full px-4 py-2 rounded bg-google-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Suggest a Service
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="w-full mt-2 px-4 py-2 rounded border border-gray-300 text-google-text text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Download Dataset
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
