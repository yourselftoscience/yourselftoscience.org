// src/app/page.js

'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react'; // Import Suspense and useCallback
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import Footer from '@/components/Footer';
import { resources as allResources, PAYMENT_TYPES, citationMap, uniqueCitations } from '@/data/resources';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import CountryFlag from 'react-country-flag';
import { FaHeart, FaDollarSign, FaTimes, FaFilter } from 'react-icons/fa';
import Header from '@/components/Header';
import ResourceGrid from '@/components/ResourceGrid';
// --- START: Import useRouter, usePathname, useSearchParams ---
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// --- END: Import useRouter, usePathname, useSearchParams ---

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

// --- START: Helper function to parse comma-separated URL parameters ---
const parseUrlList = (param) => param ? param.split(',') : [];
// --- END: Helper function to parse comma-separated URL parameters ---

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
  // Wrap the component that uses useSearchParams in Suspense
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}


// Create a new component for the actual page content
function HomePageContent() {
  // --- START: Use Next.js navigation hooks ---
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // --- END: Use Next.js navigation hooks ---

  const [filters, setFilters] = useState({
    dataTypes: [],
    countries: [],
    compensationTypes: [],
    searchTerm: '',
  });
  const [showMoreDataTypes, setShowMoreDataTypes] = useState(false);
  const [showMoreCountries, setShowMoreCountries] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const { scrollY } = useScroll();

  // --- START: Effect to initialize state from URL on mount ---
  useEffect(() => {
    // This effect runs only once on the client after hydration
    const initialFilters = {
      dataTypes: parseUrlList(searchParams.get('dataTypes')),
      countries: parseUrlList(searchParams.get('countries')),
      // Map compensation values back to objects from PAYMENT_TYPES
      compensationTypes: parseUrlList(searchParams.get('compensationTypes')).map(val =>
        PAYMENT_TYPES.find(p => p.value === val)
      ).filter(Boolean), // Filter out any nulls if a value in URL is invalid
      searchTerm: searchParams.get('searchTerm') || '',
    };
    setFilters(initialFilters);
    setIsMounted(true); // Mark as mounted after initial state is set
  }, [searchParams]); // Add searchParams to dependency array
  // --- END: Effect to initialize state from URL on mount ---

  // --- START: Effect to update URL when filters change ---
  useEffect(() => {
    // Only run this effect if the component is mounted and filters have changed
    if (!isMounted) {
      return; // Don't update URL during initial render or before state is initialized
    }

    const params = new URLSearchParams();
    // --- START: Sort filter values before adding to URL ---
    if (filters.countries.length > 0) {
      // Sort countries alphabetically
      params.set('countries', [...filters.countries].sort((a, b) => a.localeCompare(b)).join(','));
    }
    if (filters.dataTypes.length > 0) {
      // Sort data types alphabetically
      params.set('dataTypes', [...filters.dataTypes].sort((a, b) => a.localeCompare(b)).join(','));
    }
    if (filters.compensationTypes.length > 0) {
      // Sort compensation types based on PAYMENT_TYPES order
      const paymentOrder = PAYMENT_TYPES.map(p => p.value);
      const sortedCompensationValues = [...filters.compensationTypes]
        .sort((a, b) => paymentOrder.indexOf(a.value) - paymentOrder.indexOf(b.value))
        .map(p => p.value);
      params.set('compensationTypes', sortedCompensationValues.join(','));
    }
    // --- END: Sort filter values before adding to URL ---
    if (filters.searchTerm) {
      params.set('searchTerm', filters.searchTerm);
    }

    const queryString = params.toString();
    // Use replaceState to update the URL without adding to browser history
    window.history.replaceState(null, '', queryString ? `?${queryString}` : pathname);

  }, [filters, isMounted, pathname]); // Re-run when filters, isMounted, or pathname changes
  // --- END: Effect to update URL when filters change ---


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
        const compensationTypeMatch = resource.compensationType && resource.compensationType.toLowerCase().includes(lowerSearchTerm);
        const citationMatch = resource.citations && resource.citations.some(cit =>
          (cit.title && cit.title.toLowerCase().includes(lowerSearchTerm)) ||
          (cit.link && cit.link.toLowerCase().includes(lowerSearchTerm))
        );
        const linkMatch = resource.link && resource.link.toLowerCase().includes(lowerSearchTerm);
        const instructionMatch = resource.instructions && resource.instructions.some(step => step.toLowerCase().includes(lowerSearchTerm));

        return titleMatch || descriptionMatch || dataTypeMatch || countryMatch || compensationTypeMatch || citationMatch || linkMatch || instructionMatch;
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

    const paymentValues = filters.compensationTypes.map(p => p.value);
    if (paymentValues.length > 0) {
      filteredData = filteredData.filter(resource =>
        resource.compensationType && paymentValues.includes(resource.compensationType)
      );
    }

    filteredData.sort((a, b) => a.title.localeCompare(b.title));

    return filteredData;
  }, [filters]); // Ensure filters is the dependency

  // --- START: Wrap filter handlers in useCallback ---
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
  }, []); // Empty dependency array as setFilters is stable

  const handlePaymentCheckboxChange = useCallback((option, isChecked) => {
    setFilters(prev => {
      const currentPayments = prev.compensationTypes;
      let newPayments;
      if (isChecked) {
        // Add the option object if it's not already present
        newPayments = currentPayments.some(p => p.value === option.value)
          ? currentPayments
          : [...currentPayments, option];
      } else {
        // Remove the option object based on its value
        newPayments = currentPayments.filter(p => p.value !== option.value);
      }
      return { ...prev, compensationTypes: newPayments };
    });
  }, []); // Empty dependency array

  const handleClearGroup = useCallback((filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: []
    }));
  }, []); // Empty dependency array

  const handleSearchChange = useCallback((event) => {
    setFilters(prev => ({ ...prev, searchTerm: event.target.value }));
  }, []); // Empty dependency array

  const toggleFilterDrawer = useCallback(() => {
    setIsFilterDrawerOpen(prev => !prev);
  }, []); // Empty dependency array

  const handleResetFilters = useCallback(() => {
    setFilters({
      dataTypes: [],
      countries: [],
      compensationTypes: [],
      searchTerm: '', // Reset search term as well
    });
    // Optionally close drawer after reset
    setIsFilterDrawerOpen(false);
  }, []); // Empty dependency array

  const handleSelectAll = useCallback((filterKey, options, selectAll) => {
    setFilters(prev => {
      let newValues;
      if (selectAll) {
        if (filterKey === 'compensationTypes') {
          newValues = [...options]; // Use the full option objects
        } else {
          // Map options to their values (handles both string arrays and object arrays)
          newValues = options.map(option => typeof option === 'string' ? option : option.value);
        }
      } else {
        newValues = [];
      }
      return { ...prev, [filterKey]: newValues };
    });
  }, []); // Empty dependency array
  // --- END: Wrap filter handlers in useCallback ---


  const renderFilterGroup = (title, options, filterKey, showMore, setShowMore) => {
    const selectedValues = filters[filterKey];
    const visibleOptions = showMore ? options : options.slice(0, 3);
    const allSelected = options.length > 0 && selectedValues.length === options.length;
    const someSelected = selectedValues.length > 0 && !allSelected;

    return (
      <div className="mb-4">
        <h3 className="font-normal text-base text-google-text mb-1">{title}</h3>
        <button
          onClick={() => handleSelectAll(filterKey, options, !allSelected)}
          className="text-sm font-medium text-google-blue hover:underline mb-2 block"
          aria-label={allSelected ? `Clear all ${title}` : `Select all ${title}`}
        >
          {allSelected ? 'Clear all' : 'Select all'}
        </button>

        {visibleOptions.map(option => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;
          const code = typeof option === 'object' ? option.code : null;
          // Check if the current value is included in the selected values for this filter key
          // For countries, check against the 'value' property
          const isChecked = filterKey === 'countries'
            ? selectedValues.includes(value)
            : (filterKey === 'compensationTypes'
                ? selectedValues.some(p => p.value === value) // Check against value for compensation
                : selectedValues.includes(value)); // Default check for dataTypes

          return (
            <div key={value} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`${filterKey}-${value}-mobile`} // Ensure unique IDs
                value={value}
                checked={isChecked}
                // Use the useCallback version of the handler
                onChange={(e) => {
                  if (filterKey === 'compensationTypes') {
                    // Find the full option object to pass
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
                  <CountryFlag countryCode={code} svg style={{ width: '1.1em', height: '0.9em', marginLeft: '0.3em', display: 'inline-block', verticalAlign: 'middle' }} />
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

      {/* Compensation Filter */}
      <div className="mb-4">
        <h3 className="font-normal text-base text-google-text mb-1">Compensation</h3>
        <button
          onClick={() => handleSelectAll('compensationTypes', PAYMENT_TYPES, filters.compensationTypes.length !== PAYMENT_TYPES.length)}
          className="text-sm font-medium text-google-blue hover:underline mb-2 block"
          aria-label={filters.compensationTypes.length === PAYMENT_TYPES.length ? `Clear all Compensation` : `Select all Compensation`}
        >
          {filters.compensationTypes.length === PAYMENT_TYPES.length ? 'Clear all' : 'Select all'}
        </button>

        {PAYMENT_TYPES.map(option => (
          <div key={option.value} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`payment-${option.value}-mobile`} // Ensure unique IDs
              value={option.value}
              // Check if the current option's value exists in the compensationTypes array
              checked={filters.compensationTypes.some(p => p.value === option.value)}
              // Use the useCallback version of the handler
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

  // --- START: Prevent rendering until mounted to avoid hydration mismatch ---
  // This check might be less critical now with Suspense, but keep for safety
  if (!isMounted) {
    // Render nothing or a basic loading state on the server and during initial client render
    // Suspense fallback will handle the initial loading state visually
    return null;
  }
  // --- END: Prevent rendering until mounted ---

  // Return the actual JSX content
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header scrollY={scrollY} />

      <div className="flex-grow w-full max-w-screen-xl mx-auto px-4 pb-8 pt-3">

        <p className="text-base text-google-text-secondary max-w-5xl mb-6">
          A comprehensive open-source list of services allowing individuals to contribute to scientific research.
          <br />
          Browse our curated resources to find ways to share your data, genome, body samples, and more.
        </p>

        <div className="grid grid-cols-layout lg:grid-cols-lg-layout gap-6">
          <aside className="hidden lg:block py-4 px-4 sticky top-[calc(45px+1rem+4px)] h-[calc(100vh-100px)] overflow-y-auto">
            <div className="border border-gray-200 rounded-lg mb-4">
              <h2 className="text-xs font-medium uppercase text-google-text-secondary px-4 pt-4 pb-2 border-b border-gray-200">
                Filter By
              </h2>
              <div className="p-4">
                {/* Render filter content using useCallback handlers */}
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

          <main className="py-4">
            <div className="mb-4 flex gap-2 items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Filter results by keyword, country, data type..."
                  value={filters.searchTerm}
                  // Use the useCallback version of the handler
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue focus:outline-none text-sm placeholder-google-text-secondary"
                />
                {filters.searchTerm && (
                  <button
                    // Use the useCallback version of the handler
                    onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))} // Direct state update is fine here
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-google-text-secondary hover:text-google-text"
                    aria-label="Clear search"
                  >
                    <FaTimes size="1em" />
                  </button>
                )}
              </div>
              <button
                // Use the useCallback version of the handler
                onClick={toggleFilterDrawer}
                className="lg:hidden px-4 py-2 rounded border border-gray-300 text-google-text text-sm font-medium hover:bg-gray-50 transition-colors flex items-center whitespace-nowrap"
              >
                <FaFilter className="mr-2" /> Filters
              </button>
            </div>

            {/* Active Filter Badges */}
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              {/* Sort countries alphabetically before mapping */}
              {[...filters.countries].sort((a, b) => a.localeCompare(b)).map(value => {
                const countryOption = countryOptions.find(opt => opt.value === value);
                const label = countryOption?.label || value;
                const code = countryOption?.code;
                return (
                  <span key={`sel-ctry-${value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                    {label}
                    {code && <CountryFlag countryCode={code} svg style={{ width: '1em', height: '0.8em', marginLeft: '4px' }} />}
                    <button
                      // Use the useCallback version of the handler
                      onClick={() => handleCheckboxChange('countries', value, false)}
                      className="ml-1 text-blue-500 hover:text-blue-700" aria-label={`Remove ${label}`}>
                      <FaTimes size="0.9em" />
                    </button>
                  </span>
                );
              })}
              {/* Sort data types alphabetically before mapping */}
              {[...filters.dataTypes].sort((a, b) => a.localeCompare(b)).map(value => (
                <span key={`sel-dt-${value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                  {value}
                  <button
                    // Use the useCallback version of the handler
                    onClick={() => handleCheckboxChange('dataTypes', value, false)}
                    className="ml-1 text-blue-500 hover:text-blue-700" aria-label={`Remove ${value}`}>
                    <FaTimes size="0.9em" />
                  </button>
                </span>
              ))}
              {/* Sort compensation types by PAYMENT_TYPES order before mapping */}
              {[...filters.compensationTypes]
                .sort((a, b) => PAYMENT_TYPES.map(p => p.value).indexOf(a.value) - PAYMENT_TYPES.map(p => p.value).indexOf(b.value))
                .map(option => (
                  <span key={`sel-pay-${option.value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                    {option.emoji} {option.label}
                    <button
                      // Use the useCallback version of the handler
                      onClick={() => handlePaymentCheckboxChange(option, false)}
                      className="ml-1 text-blue-500 hover:text-blue-700" aria-label={`Remove ${option.label}`}>
                      <FaTimes size="0.9em" />
                    </button>
                  </span>
              ))}
            </div>

            <ResourceGrid
              resources={processedResources}
              filters={filters}
              // Pass useCallback versions of handlers
              onFilterChange={handleCheckboxChange}
              onPaymentFilterChange={handlePaymentCheckboxChange}
              compensationTypesOptions={PAYMENT_TYPES}
              citationMap={citationMap}
            />

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

            {uniqueCitations && uniqueCitations.length > 0 && (
              <section id="references" className="w-full max-w-screen-xl mx-auto px-4 py-8 border-t mt-8">
                <h2 className="text-xl font-semibold mb-4 text-google-text">References</h2>
                <ol className="list-decimal pl-5 space-y-2">
                  {uniqueCitations.map((citation, idx) => (
                    <li key={idx} id={`ref-${idx + 1}`} className="text-sm text-google-text-secondary leading-relaxed">
                      {citation.link ? (
                        <a href={citation.link} target="_blank" rel="noopener noreferrer" className="text-google-blue hover:underline break-words">
                          {citation.title}
                        </a>
                      ) : (
                        <span className="break-words">{citation.title}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

          </main>
        </div> {/* End grid */}

      </div> {/* End flex-grow container */}

      {/* Filter Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // Use the useCallback version of the handler
              onClick={toggleFilterDrawer}
              className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-[280px] bg-white z-50 shadow-lg overflow-y-auto flex flex-col lg:hidden rounded-l-lg"
            >
              <div className="flex justify-between items-center p-3 border-b border-gray-200 sticky top-0 bg-white rounded-tl-lg">
                <h2 className="text-sm font-medium uppercase text-google-text-secondary">Filter By</h2>
                <button
                  // Use the useCallback version of the handler
                  onClick={toggleFilterDrawer} className="text-google-text-secondary hover:text-google-text p-1">
                  <FaTimes size="1.2em" />
                </button>
              </div>

              {(filters.countries.length > 0 || filters.dataTypes.length > 0 || filters.compensationTypes.length > 0) && (
                <div className="p-3 border-b border-gray-200 flex flex-wrap gap-1.5">
                  {/* Sort countries alphabetically before mapping */}
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
                           className="ml-1 text-blue-500 hover:text-blue-700" aria-label={`Remove ${label}`}>
                           <FaTimes size="0.9em" />
                         </button>
                       </span>
                     );
                  })}
                  {/* Sort data types alphabetically before mapping */}
                  {[...filters.dataTypes].sort((a, b) => a.localeCompare(b)).map(value => (
                    <span key={`sel-dt-${value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                      {value}
                      <button
                        onClick={() => handleCheckboxChange('dataTypes', value, false)}
                        className="ml-1 text-blue-500 hover:text-blue-700" aria-label={`Remove ${value}`}>
                        <FaTimes size="0.9em" />
                      </button>
                    </span>
                  ))}
                  {/* Sort compensation types by PAYMENT_TYPES order before mapping */}
                  {[...filters.compensationTypes]
                    .sort((a, b) => PAYMENT_TYPES.map(p => p.value).indexOf(a.value) - PAYMENT_TYPES.map(p => p.value).indexOf(b.value))
                    .map(option => (
                      <span key={`sel-pay-${option.value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                        {option.emoji} {option.label}
                        <button
                          onClick={() => handlePaymentCheckboxChange(option, false)}
                          className="ml-1 text-blue-500 hover:text-blue-700" aria-label={`Remove ${option.label}`}>
                          <FaTimes size="0.9em" />
                        </button>
                      </span>
                  ))}
                </div>
              )}

              <div className="flex-grow overflow-y-auto p-3">
                {/* Render filter content using useCallback handlers */}
                {renderFilterContent()}
              </div>

              <div className="p-3 border-t border-gray-200 flex justify-end gap-2 sticky bottom-0 bg-white rounded-bl-lg">
                <button
                  // Use the useCallback version of the handler
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded border border-gray-300 text-google-text text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  // Use the useCallback version of the handler
                  onClick={toggleFilterDrawer}
                  className="px-4 py-2 rounded bg-google-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
