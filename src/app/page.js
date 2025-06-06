// src/app/page.js

'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
// Import motionValue ONLY if needed elsewhere, otherwise remove. useScroll is now used here.
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import Footer from '@/components/Footer';
import { PAYMENT_TYPES, EU_COUNTRIES } from '@/data/resources';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import CountryFlag from 'react-country-flag';
import { FaHeart, FaDollarSign, FaTimes, FaFilter } from 'react-icons/fa';
import Header from '@/components/Header';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Dynamically import ResourceGrid
const ResourceGrid = dynamic(() => import('@/components/ResourceGrid'), {
  loading: () => <ResourceGridSkeleton />,
  ssr: false // Since it depends on client-side filters and interactions
});

// Dynamically import MobileFilterDrawer
const MobileFilterDrawer = dynamic(() => import('@/components/MobileFilterDrawer'), {
  ssr: false // Depends on client-side state for filters and open/close
});

// Dynamically import HomePageContent
const HomePageContentDynamic = dynamic(() => Promise.resolve(HomePageContent), { // Need to wrap HomePageContent because it's not a default export
  loading: () => <ContentAreaSkeleton />,
  ssr: false, // It heavily relies on client-side hooks like useSearchParams
});

// --- Constants and Helper Functions (keep as is) ---
const parseUrlList = (param) => param ? param.split(',') : [];

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

// --- Simple Content Area Skeleton ---
function ContentAreaSkeleton() {
  // Basic skeleton mimicking the main content layout BELOW the header
  return (
    // Revert to pt-3. The Header's placeholder reserves the initial space.
    <div className="flex-grow w-full max-w-screen-xl mx-auto px-4 pb-8 pt-3 animate-pulse">

      {/* Skeleton Intro Text */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>

      {/* Skeleton Layout Grid */}
      <div className="grid grid-cols-layout lg:grid-cols-lg-layout gap-6">
        {/* Skeleton Sidebar */}
        <aside className="hidden lg:block py-4 px-4">
          {/* Filter Box */}
          <div className="border border-gray-200 rounded-lg mb-4">
            <div className="h-10 bg-gray-200 rounded-t-lg border-b px-4 pt-4 pb-2 flex items-center">
               <div className="h-3 bg-gray-300 rounded w-1/4"></div> {/* "Filter By" title */}
            </div>
            <div className="p-4 space-y-4"> {/* Adjusted spacing */}
              {/* Compensation Group Skeleton */}
              <div className="mb-4">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div> {/* Compensation Title */}
                <div className="h-3 bg-blue-200 rounded w-1/4 mb-2"></div> {/* Select/Clear All */}
                <div className="flex items-center mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div> {/* Checkbox */}
                  <div className="h-4 bg-gray-200 rounded w-2/5"></div> {/* Label (e.g., ❤️ Donation) */}
                </div>
                <div className="flex items-center mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div> {/* Checkbox */}
                  <div className="h-4 bg-gray-200 rounded w-2/5"></div> {/* Label (e.g., 💵 Payment) */}
                </div>
                <div className="flex items-center mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div> {/* Checkbox */}
                  <div className="h-4 bg-gray-200 rounded w-2/5"></div> {/* Label (e.g., ❤️💵 Mixed) */}
                </div>
              </div>
              {/* Available In Group Skeleton */}
              <div className="mb-4">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div> {/* Available In Title */}
                <div className="h-3 bg-blue-200 rounded w-1/4 mb-2"></div> {/* Select All */}
                <div className="flex items-center mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div> {/* Checkbox */}
                  <div className="h-4 bg-gray-200 rounded w-3/5"></div> {/* Label (e.g., Australia) */}
                </div>
                <div className="flex items-center mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div> {/* Checkbox */}
                  <div className="h-4 bg-gray-200 rounded w-2/5"></div> {/* Label (e.g., Austria) */}
                </div>
                <div className="flex items-center mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div> {/* Checkbox */}
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div> {/* Label (e.g., Canada) */}
                </div>
                <div className="h-3 bg-blue-200 rounded w-1/3 mt-1"></div> {/* More button */}
              </div>
               {/* Data Type Group Skeleton */}
              <div>
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div> {/* Data Type Title */}
                <div className="h-3 bg-blue-200 rounded w-1/4 mb-2"></div> {/* Select All */}
                 <div className="flex items-center mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div> {/* Checkbox */}
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div> {/* Label (e.g., Body) */}
                </div>
                <div className="flex items-center mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div> {/* Checkbox */}
                  <div className="h-4 bg-gray-200 rounded w-2/5"></div> {/* Label (e.g., Clinical trials) */}
                </div>
                <div className="flex items-center mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div> {/* Checkbox */}
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div> {/* Label (e.g., Eggs) */}
                </div>
                <div className="h-3 bg-blue-200 rounded w-1/3 mt-1"></div> {/* More button */}
              </div>
            </div>
          </div>
          {/* Sidebar Buttons */}
          <div className="h-10 bg-blue-200 rounded w-full mt-4"></div> {/* Suggest Button */}
          <div className="h-10 bg-gray-200 rounded w-full mt-2"></div> {/* Download Button */}
        </aside>

        {/* Skeleton Main Content */}
        <main className="py-4">
          {/* Search Bar */}
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          {/* Resource Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-gray-100 border border-gray-200 rounded-lg p-4 h-40 flex flex-col">
                 <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div> {/* Card Title */}
                 <div className="h-3 bg-gray-200 rounded w-full mb-1 flex-grow"></div> {/* Card Desc line 1 */}
                 <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div> {/* Card Desc line 2 */}
                 <div className="flex flex-wrap gap-1 mt-auto">
                    <div className="h-5 w-12 bg-gray-300 rounded-full"></div> {/* Tag */}
                    <div className="h-5 w-16 bg-gray-300 rounded-full"></div> {/* Tag */}
                 </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Skeleton for ResourceGrid (add this) ---
function ResourceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => ( // Show 6 placeholder cards
        <div key={i} className="bg-gray-100 border border-gray-200 rounded-lg p-4 h-48 flex flex-col animate-pulse">
          <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div> {/* Card Title */}
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div> {/* Card Subtitle/Org */}
          <div className="space-y-1 mb-3">
            <div className="h-3 bg-gray-200 rounded w-full"></div> {/* Card Desc line 1 */}
            <div className="h-3 bg-gray-200 rounded w-5/6"></div> {/* Card Desc line 2 */}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-auto">
            <div className="h-6 w-16 bg-gray-300 rounded-full"></div> {/* Tag */}
            <div className="h-6 w-20 bg-gray-300 rounded-full"></div> {/* Tag */}
            <div className="h-6 w-12 bg-gray-300 rounded-full"></div> {/* Tag */}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main Page Component ---
export default function Home() {
  const { scrollY } = useScroll();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* The Header is rendered here, immediately */}
      <Header scrollY={scrollY} />

      {/* Suspense shows ContentAreaSkeleton while HomePageContent loads */}
      <HomePageContentDynamic scrollY={scrollY} />

      <Footer />
    </div>
  );
}


// --- HomePageContent Component (Handles dynamic content) ---
// Accept scrollY as a prop
function HomePageContent({ scrollY }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // This causes the component to suspend

  const [filters, setFilters] = useState({ dataTypes: [], countries: [], compensationTypes: [], searchTerm: '' });
  const [showMoreDataTypes, setShowMoreDataTypes] = useState(false);
  const [showMoreCountries, setShowMoreCountries] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [processedResources, setProcessedResources] = useState([]);
  const [dataTypeOptions, setDataTypeOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

  useEffect(() => {
    // Fetch filter options on mount
    fetch('/api/filter-options')
      .then(res => res.json())
      .then(data => {
        setDataTypeOptions(data.dataTypeOptions);
        setCountryOptions(data.countryOptions);
      });
  }, []);

  useEffect(() => {
    const initialFilters = {
      dataTypes: parseUrlList(searchParams.get('dataTypes')),
      countries: parseUrlList(searchParams.get('countries')),
      compensationTypes: parseUrlList(searchParams.get('compensationTypes')).map(val =>
        PAYMENT_TYPES.find(p => p.value === val)
      ).filter(Boolean),
      searchTerm: searchParams.get('searchTerm') || '',
    };
    setFilters(initialFilters);
    setIsMounted(true);
  }, [searchParams]);

  useEffect(() => {
    if (!isMounted) return;

    const params = new URLSearchParams();
    if (filters.countries.length > 0) {
      params.set('countries', [...filters.countries].sort((a, b) => a.localeCompare(b)).join(','));
    }
    if (filters.dataTypes.length > 0) {
      params.set('dataTypes', [...filters.dataTypes].sort((a, b) => a.localeCompare(b)).join(','));
    }
    if (filters.compensationTypes.length > 0) {
      const paymentOrder = PAYMENT_TYPES.map(p => p.value);
      const sortedCompensationValues = [...filters.compensationTypes]
        .sort((a, b) => paymentOrder.indexOf(a.value) - paymentOrder.indexOf(b.value))
        .map(p => p.value);
      params.set('compensationTypes', sortedCompensationValues.join(','));
    }
    if (filters.searchTerm) {
      params.set('searchTerm', filters.searchTerm);
    }
    const queryString = params.toString();
    window.history.replaceState(null, '', queryString ? `?${queryString}` : pathname);

    // Fetch resources based on filters
    fetch(`/api/resources?${queryString}`)
      .then(res => res.json())
      .then(data => {
        setProcessedResources(data);
      });

  }, [filters, isMounted, pathname]);

  const citationList = useMemo(() => {
    const list = [];
    processedResources.forEach(resource => {
      (resource.citations || []).forEach(citation => {
        if (!list.some(c => (c.link || '').trim() === (citation.link || '').trim() &&
                            (c.title || '') === citation.title)) {
          list.push(citation);
        }
      });
    });
    return list;
  }, [processedResources]);

  const citationMap = useMemo(() => {
    return citationList.reduce((map, citation, idx) => {
      const key = citation.link
        ? citation.link.trim()
        : citation.title.trim().toLowerCase().substring(0, 50);
      map[key] = idx + 1;
      return map;
    }, {});
  }, [citationList]);

  const handleCheckboxChange = useCallback((filterKey, value, isChecked) => {
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
  }, []);

  const handlePaymentCheckboxChange = useCallback((option, isChecked) => {
    setFilters(prev => {
      const currentPaymentValues = new Set(prev.compensationTypes.map(p => p.value));
      let newPaymentValues = new Set(currentPaymentValues);

      if (isChecked) {
        newPaymentValues.add(option.value);
        if (option.value === 'donation' || option.value === 'payment') {
          newPaymentValues.add('mixed');
        }
      } else {
        newPaymentValues.delete(option.value);

        if (option.value === 'donation' && !newPaymentValues.has('payment')) {
          newPaymentValues.delete('mixed');
        }
        else if (option.value === 'payment' && !newPaymentValues.has('donation')) {
          newPaymentValues.delete('mixed');
        }
      }

      const newPaymentsArray = PAYMENT_TYPES.filter(p => newPaymentValues.has(p.value));

      return { ...prev, compensationTypes: newPaymentsArray };
    });
  }, []);

  const handleClearGroup = useCallback((filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: []
    }));
  }, []);

  const handleSearchChange = useCallback((event) => {
    setFilters(prev => ({ ...prev, searchTerm: event.target.value }));
  }, []);

  const toggleFilterDrawer = useCallback(() => {
    setIsFilterDrawerOpen(prev => !prev);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      dataTypes: [],
      countries: [],
      compensationTypes: [],
      searchTerm: '',
    });
    setIsFilterDrawerOpen(false);
  }, []);

  const handleSelectAll = useCallback((filterKey, options, selectAll) => {
    setFilters(prev => {
      let newValues;
      if (selectAll) {
        if (filterKey === 'compensationTypes') {
          newValues = [...options];
        } else {
          newValues = options.map(option => typeof option === 'string' ? option : option.value);
        }
      } else {
        newValues = [];
      }
      return { ...prev, [filterKey]: newValues };
    });
  }, []);

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey].includes(value)
        ? prev[filterKey].filter(item => item !== value)
        : [...prev[filterKey], value]
    }));
  };

  const handleWearableFilterToggle = () => {
    const isWearableActive = filters.dataTypes.includes('Wearable data');
    handleCheckboxChange('dataTypes', 'Wearable data', !isWearableActive);
  };

  const renderFilterGroup = (title, options, filterKey, showMore, setShowMore) => {
    const selectedValues = filters[filterKey];
    const visibleOptions = showMore ? options : options.slice(0, 3);
    const showClearAll = selectedValues.length > 1;
    const allSelected = options.length > 0 && selectedValues.length === options.length;
    const someSelected = selectedValues.length > 0 && !allSelected;

    return (
      <div className="mb-4">
        <h3 className="font-normal text-base text-google-text mb-1">{title}</h3>
        <button
          onClick={() => handleSelectAll(filterKey, options, !showClearAll)}
          className="text-sm font-medium text-google-blue hover:underline mb-2 block"
          aria-label={showClearAll ? `Clear all ${title}` : `Select all ${title}`}
        >
          {showClearAll ? 'Clear all' : 'Select all'}
        </button>

        {visibleOptions.map(option => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;
          const code = typeof option === 'object' ? option.code : null;
          const isChecked = filterKey === 'countries'
            ? selectedValues.includes(value)
            : (filterKey === 'compensationTypes'
                ? selectedValues.some(p => p.value === value)
                : selectedValues.includes(value));

          return (
            <div key={value} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`${filterKey}-${value}-mobile`}
                value={value}
                checked={isChecked}
                onChange={(e) => {
                  if (filterKey === 'compensationTypes') {
                    const paymentOption = PAYMENT_TYPES.find(p => p.value === value);
                    if (paymentOption) {
                      handlePaymentCheckboxChange(paymentOption, e.target.checked);
                    }
                  } else {
                    handleCheckboxChange(filterKey, value, e.target.checked);
                  }
                }}
                className="mr-2 h-4 w-4 text-google-blue border-gray-400 rounded focus:ring-google-blue focus:ring-offset-0 focus:ring-1"
              />
              <label htmlFor={`${filterKey}-${value}-mobile`} className="text-base font-normal text-google-text-secondary flex items-center cursor-pointer">
                {label}
                {code && (
                  <CountryFlag
                    countryCode={code}
                    svg
                    aria-label={label}
                    style={{ width: '1.1em', height: '0.9em', marginLeft: '0.3em', display: 'inline-block', verticalAlign: 'middle' }}
                  />
                )}
              </label>
            </div>
          );
        })}

        {options.length > 3 && (
          <button onClick={() => setShowMore(!showMore)} className="text-sm font-medium text-google-blue hover:underline mt-1 flex items-center">
             <svg className={`w-3 h-3 mr-1 transform transition-transform ${showMore ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            {showMore ? 'Less' : `More (${options.length - 3})`}
          </button>
        )}
      </div>
    );
  };

  const renderFilterContent = () => (
    <>
      {isMounted && renderFilterGroup('Available In', countryOptions, 'countries', showMoreCountries, setShowMoreCountries)}
      {isMounted && renderFilterGroup('Data Type', dataTypeOptions, 'dataTypes', showMoreDataTypes, setShowMoreDataTypes)}

      <div className="mb-4">
        <h3 className="font-normal text-base text-google-text mb-1">Compensation</h3>
        {(() => {
          const showClearAllCompensation = filters.compensationTypes.length > 1;
          return (
            <button
              onClick={() => handleSelectAll('compensationTypes', PAYMENT_TYPES, !showClearAllCompensation)}
              className="text-sm font-medium text-google-blue hover:underline mb-2 block"
              aria-label={showClearAllCompensation ? `Clear all Compensation` : `Select all Compensation`}
            >
              {showClearAllCompensation ? 'Clear all' : 'Select all'}
            </button>
          );
        })()}

        {PAYMENT_TYPES.map(option => (
          <div key={option.value} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`payment-${option.value}-mobile`}
              value={option.value}
              checked={filters.compensationTypes.some(p => p.value === option.value)}
              onChange={(e) => handlePaymentCheckboxChange(option, e.target.checked)}
              className="mr-2 h-4 w-4 text-google-blue border-gray-400 rounded focus:ring-google-blue focus:ring-offset-0 focus:ring-1"
            />
            <label htmlFor={`payment-${option.value}-mobile`} className="text-base font-normal text-google-text-secondary flex items-center cursor-pointer">
              <span className="mr-1.5">{option.emoji}</span> {option.label}
            </label>
          </div>
        ))}
      </div>
    </>
  );

  function handleDownloadCSV() {
    const headers = ['Title', 'Organization', 'Link', 'Data Types', 'Countries', 'Country Codes', 'Instructions', 'Compensation Type', 'Description', 'Citations'];
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.map(h => `"${h}"`).join(',') + '\n';

    processedResources.forEach((resource) => {
      const data = [
        resource.title || '',
        resource.organization || '',
        resource.link || '',
        resource.dataTypes?.join('; ') || '',
        resource.countries?.join('; ') || '',
        resource.countryCodes?.join('; ') || '',
        resource.instructions?.join('; ') || '',
        resource.compensationType || '',
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

  if (!isMounted) {
    return <ContentAreaSkeleton />;
  }
  
  return (
    <div className="flex-grow w-full max-w-screen-xl mx-auto px-4 pb-8 pt-3">

      {/* Intro Text */}
      <p className="text-base text-google-text-secondary max-w-5xl mb-6">
        A comprehensive open-source list of services allowing individuals to contribute to scientific research.
        <br />
        Browse our curated resources to find ways to share your data, genome, body samples, and more.
      </p>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-layout lg:grid-cols-lg-layout gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block py-4 px-4 sticky top-[55px] h-[calc(100vh-100px)] overflow-y-auto">
          <div className="border border-gray-200 rounded-lg mb-4">
            <h2 className="text-xs font-medium uppercase text-google-text-secondary px-4 pt-4 pb-2 border-b border-gray-200">
              Filter By
            </h2>
            <div className="p-4">
              {renderFilterContent()}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => window.open('https://github.com/yourselftoscience/yourselftoscience.org/issues/new?template=suggest-a-service.md', '_blank')}
              className="w-full px-4 py-2 rounded bg-google-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Suggest a Service
            </button>
            <button
              onClick={handleDownloadCSV}
              className="w-full px-4 py-2 rounded border border-gray-300 text-google-text text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Download Dataset
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="py-4">
          <div className="mb-4 flex gap-2 items-center">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Filter results by keyword, country, data type..."
                value={filters.searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue focus:outline-none text-sm placeholder-google-text-secondary"
              />
              {filters.searchTerm && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-google-text-secondary hover:text-google-text"
                  aria-label="Clear search"
                >
                  <FaTimes size="1em" />
                </button>
              )}
            </div>
            <button
              onClick={toggleFilterDrawer}
              className="lg:hidden px-4 py-2 rounded border border-gray-300 text-google-text text-sm font-medium hover:bg-gray-50 transition-colors flex items-center whitespace-nowrap"
            >
              <FaFilter className="mr-2" /> Filters
            </button>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 items-center">
            {[...filters.countries].sort((a, b) => a.localeCompare(b)).map(value => {
              const countryOption = countryOptions.find(opt => opt.value === value);
              const label = countryOption?.label || value;
              const code = countryOption?.code;
              return (
                <span key={`sel-ctry-${value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                  {label}
                  {code && <CountryFlag countryCode={code} svg style={{ width: '1em', height: '0.8em', marginLeft: '4px' }} />}
                  <button
                    onClick={() => handleCheckboxChange('countries', value, false)}
                    className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${label}`}>
                    <FaTimes size="0.9em" />
                  </button>
                </span>
              );
            })}
            {[...filters.dataTypes].sort((a, b) => a.localeCompare(b)).map(value => (
              <span key={`sel-dt-${value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                {value}
                <button
                  onClick={() => handleCheckboxChange('dataTypes', value, false)}
                  className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${value}`}>
                  <FaTimes size="0.9em" />
                </button>
              </span>
            ))}
            {[...filters.compensationTypes]
              .sort((a, b) => PAYMENT_TYPES.map(p => p.value).indexOf(a.value) - PAYMENT_TYPES.map(p => p.value).indexOf(b.value))
              .map(option => (
                <span key={`sel-pay-${option.value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                  {option.emoji} {option.label}
                  <button
                    onClick={() => handlePaymentCheckboxChange(option, false)}
                    className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${option.label}`}>
                    <FaTimes size="0.9em" />
                  </button>
                </span>
            ))}
          </div>

          <div className="lg:col-span-1">
             <ResourceGrid
                resources={processedResources}
                filters={filters}
                onFilterChange={handleCheckboxChange}
                onPaymentFilterChange={handlePaymentCheckboxChange}
                compensationTypesOptions={PAYMENT_TYPES}
                citationMap={citationMap}
                onWearableFilterToggle={handleWearableFilterToggle}
              />
          </div>

          <div className="mt-8 flex flex-col items-center gap-2 w-full max-w-xs mx-auto lg:hidden">
             <button
                onClick={() => window.open('https://github.com/yourselftoscience/yourselftoscience.org/issues/new?template=suggest-a-service.md', '_blank')}
                className="w-full px-4 py-2 rounded bg-google-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Suggest a Service
              </button>
              <button
                onClick={handleDownloadCSV}
                className="w-full px-4 py-2 rounded border border-gray-300 text-google-text text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Download Dataset
              </button>
          </div>

          {citationList.length > 0 && (
            <section id="references" className="w-full max-w-screen-xl mx-auto px-4 py-8 border-t mt-8">
              <h2 className="text-xl font-semibold mb-4 text-google-text">References</h2>
              <ol className="list-decimal pl-5 space-y-2">
                {citationList.map((citation, idx) => (
                  <li
                    key={idx}
                    id={`ref-${idx + 1}`}
                    className="text-sm text-google-text-secondary leading-relaxed"
                  >
                    <a
                      href={citation.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-google-blue hover:underline break-words"
                    >
                      {citation.title}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </main>
      </div>

      {isMounted && (
        <MobileFilterDrawer
          isOpen={isFilterDrawerOpen}
          toggleDrawer={toggleFilterDrawer}
          filters={filters}
          countryOptions={countryOptions}
          dataTypeOptions={dataTypeOptions}
          paymentTypes={PAYMENT_TYPES}
          handleCheckboxChange={handleCheckboxChange}
          handlePaymentCheckboxChange={handlePaymentCheckboxChange}
          handleResetFilters={handleResetFilters}
          renderFilterContent={renderFilterContent}
        />
      )}
    </div>
  );
}
