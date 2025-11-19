// src/app/page.js

'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import { resources as allResources } from '@/data/resources';
import { PAYMENT_TYPES, EU_COUNTRIES } from '@/data/constants';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import CountryFlag from 'react-country-flag';
import { FaHeart, FaDollarSign, FaTimes, FaFilter, FaDownload, FaSlidersH, FaUndo, FaPlus, FaExternalLinkAlt, FaSearch } from 'react-icons/fa';
import Header from '@/components/Header';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NewsletterSignup from '../components/NewsletterSignup';

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

// Dynamically import ReferencesSection
const ReferencesSection = dynamic(() => import('@/components/ReferencesSection'), {
  ssr: false
});

// --- Constants and Helper Functions (keep as is) ---
const parseUrlList = (param) => param ? param.split(',') : [];
// Helper functions for macro categories (which contain commas, so we use pipe delimiter)
const parseMacroCategories = (param) => param ? param.split('|') : [];
const stringifyMacroCategories = (categories) => categories.join('|');

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
    <div className="flex-grow w-full max-w-screen-xl mx-auto px-4 pb-8 pt-3 animate-pulse">

      {/* Skeleton Intro Text */}
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-5 bg-gray-200 rounded w-1/2 mb-8"></div>

      {/* Skeleton Newsletter */}
      <div className="h-14 bg-gray-200 rounded-xl w-full max-w-xl mb-10 mx-auto"></div>

      {/* Skeleton Top Filter Bar */}
      <div className="w-full max-w-4xl mx-auto h-[72px] bg-gray-100 rounded-[999px] border border-gray-200 mb-8 hidden lg:block"></div>
      <div className="w-full h-[60px] bg-gray-100 rounded-xl border border-gray-200 mb-6 lg:hidden"></div>

      {/* Skeleton Main Content */}
      <main className="py-4">
        <ResourceGridSkeleton />
      </main>
    </div>
  );
}

// --- Skeleton for ResourceGrid (add this) ---
function ResourceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => ( // Show 6 placeholder cards
        <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 h-[420px] flex flex-col animate-pulse shadow-sm">

          {/* Top Row: Badges & Icons */}
          <div className="flex justify-between items-start mb-4">
            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
            <div className="flex gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
            </div>
          </div>

          {/* Title & Org */}
          <div className="h-7 bg-gray-200 rounded w-3/4 mb-2"></div> {/* Card Title */}
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div> {/* Card Subtitle/Org */}

          {/* Description */}
          <div className="space-y-2 mb-6 flex-grow">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          </div>

          {/* Bottom Action Button */}
          <div className="h-10 w-32 bg-blue-100 rounded-xl mt-auto"></div>
        </div>
      ))}
    </div>
  );
}

// --- Main Page Component ---
export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = typeof window !== 'undefined'
        ? window.scrollY || window.pageYOffset || 0
        : 0;
      setScrollY(y);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HomePageContentDynamic scrollY={scrollY} />
    </div>
  );
}


// --- HomePageContent Component (Handles dynamic content) ---
// Accept scrollY as a prop
function HomePageContent({ scrollY }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // This causes the component to suspend

  // ... state declarations (filters, showMore, isMounted, etc.) ...
  const [filters, setFilters] = useState({ dataTypes: [], countries: [], compensationTypes: [], searchTerm: '', macroCategories: [] });
  const [showMoreDataTypes, setShowMoreDataTypes] = useState(false);
  const [showMoreCountries, setShowMoreCountries] = useState(false);
  const [showMoreMacroCategories, setShowMoreMacroCategories] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const filterContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
        setOpenFilterPanel(null);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);


  // --- REMOVE useScroll from here ---
  // const { scrollY } = useScroll();
  // --- You can now use the scrollY prop if needed ---

  // --- Effects and Memos (keep as is) ---
  useEffect(() => {
    // Initialize filters from searchParams
    const macroCategoriesParam = searchParams.get('macroCategories');
    const parsedMacroCategories = parseMacroCategories(macroCategoriesParam);

    const initialFilters = {
      dataTypes: parseUrlList(searchParams.get('dataTypes')),
      countries: parseUrlList(searchParams.get('countries')),
      macroCategories: parsedMacroCategories,
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
    if (filters.macroCategories.length > 0) {
      const sortedMacroCategories = [...filters.macroCategories].sort((a, b) => a.localeCompare(b));
      const stringified = stringifyMacroCategories(sortedMacroCategories);
      params.set('macroCategories', stringified);
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


  const dataTypeOptions = useMemo(() => {
    const allTypes = allResources.flatMap(resource => resource.dataTypes || []);
    const mappedTypes = allTypes
      .filter((type) => typeof type === 'string' && type.length > 0)
      .map(type => type.startsWith('Wearable data') ? 'Wearable data' : type);
    const uniqueTypes = [...new Set(mappedTypes)];
    return uniqueTypes.sort((a, b) => a.localeCompare(b));
  }, []);

  const macroCategoryOptions = useMemo(() => {
    const allCategories = allResources.flatMap(resource => resource.macroCategories || []);
    const uniqueCategories = [...new Set(allCategories)];
    return uniqueCategories.sort((a, b) => a.localeCompare(b));
  }, []);

  const countryOptions = useMemo(() => {
    const countries = new Set();
    const countryCodeMap = new Map();
    allResources.forEach((resource) => {
      resource.countries?.forEach((country, index) => {
        if (typeof country === 'string' && country.length > 0) {
          countries.add(country);
        }
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

  // Show-more state for desktop compensation filter panel (mirrors other filters)
  const [showMoreCompensationTypes, setShowMoreCompensationTypes] = useState(false);

  const processedResources = useMemo(() => {
    let filteredData = [...allResources];
    const lowerSearchTerm = (filters.searchTerm || '').toString().toLowerCase().trim();

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

    if (filters.macroCategories.length > 0) {
      filteredData = filteredData.filter(resource =>
        resource.macroCategories && filters.macroCategories.some(filterCat => resource.macroCategories.includes(filterCat))
      );
    }

    if (filters.dataTypes.length > 0) {
      filteredData = filteredData.filter(resource =>
        resource.dataTypes && filters.dataTypes.some(filterType => {
          // If the filter is 'Wearable data', match any resource that starts with it
          if (filterType === 'Wearable data') {
            return resource.dataTypes.some(rdt => rdt.startsWith('Wearable data'));
          }
          // Otherwise, require an exact match
          return resource.dataTypes.includes(filterType);
        })
      );
    }

    const expandedCountries = expandCountries(filters.countries || []);
    if (expandedCountries.length > 0) {
      filteredData = filteredData.filter(resource =>
        !resource.countries || resource.countries.length === 0 ||
        (resource.countries && resource.countries.some(rc => expandedCountries.includes(rc)))
      );
    }

    const paymentValues = (filters.compensationTypes || []).map(p => p.value);
    if (paymentValues.length > 0) {
      filteredData = filteredData.filter(resource =>
        resource.compensationType && paymentValues.includes(resource.compensationType)
      );
    }

    filteredData.sort((a, b) => a.title.localeCompare(b.title));

    return filteredData;
  }, [filters]); // Ensure filters is the dependency

  // Derive citations in page order
  const citationList = useMemo(() => {
    const list = [];
    processedResources.forEach(resource => {
      (resource.citations || []).forEach(citation => {
        const key = citation.link
          ? citation.link.trim()
          : citation.title.trim().toLowerCase().substring(0, 50);
        if (!list.some(c => (c.link || '').trim() === (citation.link || '').trim() &&
          (c.title || '') === citation.title)) {
          list.push(citation);
        }
      });
    });
    return list;
  }, [processedResources]);

  // Map citation key to its number
  const citationMap = useMemo(() => {
    return citationList.reduce((map, citation, idx) => {
      const key = citation.link
        ? citation.link.trim()
        : citation.title.trim().toLowerCase().substring(0, 50);
      map[key] = idx + 1;
      return map;
    }, {});
  }, [citationList]);

  const handleMacroCategoryFilterChange = useCallback((category) => {
    setFilters(prev => {
      const currentCats = prev.macroCategories;
      const isSelected = currentCats.includes(category);

      if (isSelected) {
        // Remove category if already selected
        return { ...prev, macroCategories: currentCats.filter(c => c !== category) };
      } else {
        // Add category if not selected
        return { ...prev, macroCategories: [...currentCats, category] };
      }
    });
  }, []);


  // --- Callbacks (keep as is) ---
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
      const currentPaymentValues = new Set(prev.compensationTypes.map(p => p.value));
      let newPaymentValues = new Set(currentPaymentValues);

      if (isChecked) {
        // Add the primary type clicked
        newPaymentValues.add(option.value);
        // If Donation or Payment was added, also add Mixed
        if (option.value === 'donation' || option.value === 'payment') {
          newPaymentValues.add('mixed');
        }
      } else {
        // Remove the primary type being deselected
        newPaymentValues.delete(option.value);

        // If Donation was removed, check if Payment is still selected. If not, remove Mixed.
        if (option.value === 'donation' && !newPaymentValues.has('payment')) {
          newPaymentValues.delete('mixed');
        }
        // If Payment was removed, check if Donation is still selected. If not, remove Mixed.
        else if (option.value === 'payment' && !newPaymentValues.has('donation')) {
          newPaymentValues.delete('mixed');
        }
        // If Mixed was deselected directly, it's handled by the initial delete.
      }

      // Convert the final set of values back to the array of objects
      const newPaymentsArray = PAYMENT_TYPES.filter(p => newPaymentValues.has(p.value));

      return { ...prev, compensationTypes: newPaymentsArray };
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
      macroCategories: [],
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

  // --- Render Functions (keep as is) ---
  const renderFilterGroup = (title, options, filterKey, showMore, setShowMore, config = {}) => {
    const { alwaysExpanded = false, columns = 1 } = config;
    const selectedValues = filters[filterKey];
    const visibleOptions = alwaysExpanded || showMore ? options : options.slice(0, 3);
    // --- START: Modify condition for showing Clear all ---
    // Show "Clear all" if more than one item is selected
    const showClearAll = selectedValues.length > 1;
    // --- END: Modify condition for showing Clear all ---
    // Note: allSelected and someSelected are no longer directly used for the button logic, but kept for potential future use or clarity
    const allSelected = options.length > 0 && selectedValues.length === options.length;
    const someSelected = selectedValues.length > 0 && !allSelected;


    const optionLayoutClass = columns > 1
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
      : 'space-y-2';

    return (
      <div className="mb-6">
        <h3 className="font-semibold text-base text-slate-900 mb-1">{title}</h3>
        <button
          // --- START: Update onClick and text based on showClear all ---
          onClick={() => handleSelectAll(filterKey, options, !showClearAll)} // If showing "Clear all", pass false to selectAll; otherwise pass true
          className="text-xs font-semibold text-google-blue hover:underline mb-3 block"
          aria-label={showClearAll ? `Clear all ${title}` : `Select all ${title}`}
        >
          {showClearAll ? 'Clear all' : 'Select all'}
          {/* --- END: Update onClick and text based on showClear all --- */}
        </button>

        <div className={optionLayoutClass}>
          {visibleOptions.map(option => {
            const value = typeof option === 'string' ? option : option.value;
            const label = typeof option === 'string' ? option : option.label;
            const code = typeof option === 'object' ? option.code : null;
            const emoji = typeof option === 'object' ? option.emoji : null;
            const idSuffix = alwaysExpanded ? 'desktop' : 'mobile';
            const isChecked = filterKey === 'countries'
              ? selectedValues.includes(value)
              : (filterKey === 'compensationTypes'
                ? selectedValues.some(p => p.value === value)
                : selectedValues.includes(value));

            // Define category styles locally to match ResourceCard
            const categoryStyles = {
              'Organ, Body & Tissue Donation': 'bg-rose-100 text-rose-800 border-rose-200',
              'Biological Samples': 'bg-blue-100 text-blue-800 border-blue-200',
              'Clinical Trials': 'bg-green-100 text-green-800 border-green-200',
              'Health & Digital Data': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            };

            let itemClass = "flex items-center gap-3 rounded-2xl border px-3 py-2 shadow-[0_5px_20px_rgba(15,23,42,0.06)] transition-colors cursor-pointer ";

            if (filterKey === 'macroCategories' && categoryStyles[value]) {
              // Apply specific category style if it's a macro category
              itemClass += categoryStyles[value] + (isChecked ? " ring-2 ring-offset-1 ring-slate-400" : " hover:opacity-80");
            } else {
              // Default style for other filters
              itemClass += "border-white/60 bg-white/70 hover:bg-white/90 hover:border-white/80";
            }


            return (
              <label
                key={value}
                htmlFor={`${filterKey}-${value}-${idSuffix}`}
                className={itemClass}
              >
                <input
                  type="checkbox"
                  id={`${filterKey}-${value}-${idSuffix}`}
                  value={value}
                  checked={isChecked}
                  onChange={(e) => {
                    if (filterKey === 'compensationTypes') {
                      const paymentOption = PAYMENT_TYPES.find(p => p.value === value);
                      if (paymentOption) {
                        handlePaymentCheckboxChange(paymentOption, e.target.checked);
                      }
                    } else if (filterKey === 'macroCategories') {
                      handleMacroCategoryFilterChange(value);
                    } else {
                      handleCheckboxChange(filterKey, value, e.target.checked);
                    }
                  }}
                  className="h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 focus:ring-offset-0 focus:ring-1"
                />
                <span className={`flex items-center gap-2 text-sm sm:text-base font-medium ${filterKey === 'macroCategories' ? 'text-inherit' : 'text-slate-800'}`}>
                  {emoji && <span className="text-base sm:text-lg leading-none">{emoji}</span>}
                  {label}
                  {code && (
                    <CountryFlag
                      countryCode={code}
                      svg
                      aria-label={label}
                      style={{ width: '1.1em', height: '0.9em', display: 'inline-block', verticalAlign: 'middle' }}
                    />
                  )}
                </span>
              </label>
            );
          })}
        </div>

        {options.length > 3 && !alwaysExpanded && typeof setShowMore === 'function' && (
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
      {isMounted && renderFilterGroup('Category', macroCategoryOptions, 'macroCategories', showMoreMacroCategories, setShowMoreMacroCategories, { alwaysExpanded: true })}
      {isMounted && renderFilterGroup('Available In', countryOptions, 'countries', showMoreCountries, setShowMoreCountries)}
      {isMounted && renderFilterGroup('Data Type', dataTypeOptions, 'dataTypes', showMoreDataTypes, setShowMoreDataTypes)}
      {isMounted && renderFilterGroup('Compensation', PAYMENT_TYPES, 'compensationTypes', showMoreCompensationTypes, setShowMoreCompensationTypes)}
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

  // --- Derived UI state ---
  const [openFilterPanel, setOpenFilterPanel] = useState(null); // 'macroCategories' | 'countries' | 'dataTypes' | 'compensationTypes' | null

  const stickyThreshold = 140;
  const safeScrollY = typeof scrollY === 'number' && !Number.isNaN(scrollY) ? scrollY : 0;
  const isStickyFilterBar = safeScrollY > stickyThreshold;

  const macroCategorySummary = (() => {
    const values = filters.macroCategories || [];
    if (!values.length) return 'Any type';
    if (values.length === 1) return values[0];
    return `${values[0]} +${values.length - 1}`;
  })();

  const countrySummary = (() => {
    const values = filters.countries || [];
    if (!values.length) return 'Anywhere';
    if (values.length === 1) {
      const opt = countryOptions.find(o => o.value === values[0]);
      return opt?.label || values[0];
    }
    const first = countryOptions.find(o => o.value === values[0]);
    return `${first?.label || values[0]} +${values.length - 1}`;
  })();

  const dataTypeSummary = (() => {
    const values = filters.dataTypes || [];
    if (!values.length) return 'All';
    if (values.length === 1) return values[0];
    return `${values[0]} +${values.length - 1}`;
  })();

  const compensationSummary = (() => {
    const values = filters.compensationTypes || [];
    if (!values.length) return 'Any';
    if (values.length === 1) return values[0].label || values[0].value;
    const first = values[0];
    return `${first.label || first.value} +${values.length - 1}`;
  })();

  const shouldHideDefaultSummary = (summary) => {
    if (!isStickyFilterBar) return false;
    if (!summary) return false;
    const lowered = summary.toLowerCase();
    return lowered.startsWith('any') || lowered === 'all';
  };

  const FilterPill = ({ label, summary, isActive, onClick, showSummary = true }) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 flex flex-col justify-center px-6 py-3 text-left transition-colors hover:bg-slate-100/50 rounded-full
        ${isActive ? 'bg-slate-100/70' : ''}
      `}
    >
      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{label}</span>
      {summary && showSummary && (
        <span className={`text-sm ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>
          {summary}
        </span>
      )}
    </button>
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterContainerRef.current && !event.composedPath().includes(filterContainerRef.current)) {
        setOpenFilterPanel(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, []);

  // --- Prevent rendering until mounted (Keep this check) ---
  // This ensures filters are initialized from URL before rendering dynamic content
  if (!isMounted) {
    // Return the skeleton here to match the Suspense fallback during initial client render phase
    return <ContentAreaSkeleton />;
  }

  // --- Return the JSX for the main content area ONLY ---
  return (
    <div className="flex-grow w-full max-w-screen-xl mx-auto px-4 pb-8 pt-3">

      {/* Intro Text */}
      <p className="text-base text-google-text-secondary max-w-5xl mb-6">
        A comprehensive open-source list of services allowing individuals to contribute to scientific research.
        <br />
        Browse our curated resources to find ways to share your data, genome, body samples, and more.
      </p>

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)] gap-6">

        {/* Main Content Area */}
        <main className="py-4">
          {/* Unified desktop search + filter bar */}
          <motion.div
            ref={filterContainerRef}
            layout
            initial={false}
            animate={isStickyFilterBar ? 'sticky' : 'default'}
            variants={{
              default: {
                y: 0,
                scale: 1,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                borderRadius: 999,
              },
              sticky: {
                y: 0,
                scale: 1,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                borderRadius: 999,
              },
            }}
            transition={{
              type: 'tween',
              duration: 0.2,
              ease: 'circOut',
            }}
            className={`group relative border backdrop-blur-3xl z-40 mb-4
              ${openFilterPanel ? 'overflow-visible' : 'overflow-hidden'}
              ${isStickyFilterBar
                ? 'bg-white/95 border-slate-200/75 sticky top-[80px] md:max-w-4xl w-full mx-auto'
                : 'bg-white/95 border-slate-200/75 relative md:max-w-4xl w-full mx-auto'}`}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className={`absolute inset-0 bg-gradient-to-br from-white/95 via-white/85 to-white/70 transition-opacity duration-500 ${isStickyFilterBar ? 'opacity-100' : 'opacity-80'}`} />
              <div className={`absolute -top-10 -right-6 w-40 h-40 rounded-full bg-white/80 blur-3xl transition-all duration-500 ${isStickyFilterBar ? 'opacity-85 translate-y-1' : 'opacity-0'}`} />
              <div className={`absolute -bottom-14 left-4 w-44 h-44 rounded-full bg-transparent blur-3xl transition-all duration-500 ${isStickyFilterBar ? 'opacity-75 translate-y-2' : 'opacity-0'}`} />
            </div>

            <div className={`relative flex items-center transition-all duration-300 ease-in-out`}>
              {/* Filter pills */}
              <div
                className="hidden lg:flex flex-1 items-stretch"
              >
                <FilterPill
                  label="Category"
                  summary={isStickyFilterBar ? null : macroCategorySummary}
                  isActive={openFilterPanel === 'macroCategories'}
                  onClick={() => setOpenFilterPanel(openFilterPanel === 'macroCategories' ? null : 'macroCategories')}
                />
                <div className="w-px bg-slate-200 my-3"></div>
                <FilterPill
                  label="Available in"
                  summary={isStickyFilterBar ? null : countrySummary}
                  isActive={openFilterPanel === 'countries'}
                  onClick={() => setOpenFilterPanel(openFilterPanel === 'countries' ? null : 'countries')}
                />
                <div className="w-px bg-slate-200 my-3"></div>
                <FilterPill
                  label="Data type"
                  summary={isStickyFilterBar ? null : dataTypeSummary}
                  isActive={openFilterPanel === 'dataTypes'}
                  onClick={() => setOpenFilterPanel(openFilterPanel === 'dataTypes' ? null : 'dataTypes')}
                />
                <div className="w-px bg-slate-200 my-3"></div>
                <FilterPill
                  label="Compensation"
                  summary={isStickyFilterBar ? null : compensationSummary}
                  isActive={openFilterPanel === 'compensationTypes'}
                  onClick={() => setOpenFilterPanel(openFilterPanel === 'compensationTypes' ? null : 'compensationTypes')}
                />
              </div>

              {/* Desktop search field */}
              <div className={`flex items-center transition-all duration-300 ease-in-out pl-4 w-full lg:w-auto`}>
                <div className="relative flex-1 flex items-center">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={filters.searchTerm}
                    onChange={handleSearchChange}
                    className={`w-full py-3 pl-10 pr-4 text-slate-900 placeholder-slate-500 focus:outline-none text-sm bg-transparent`}
                  />
                </div>
                {/* Mobile Filter Button */}
                <button
                  onClick={toggleFilterDrawer}
                  className="lg:hidden ml-2 p-2.5 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors flex-shrink-0"
                  aria-label="Open filters"
                >
                  <FaSlidersH className="text-lg" />
                </button>
              </div>
            </div>

            {/* Expanding filter panels on desktop */}
            <AnimatePresence>
              {openFilterPanel && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                  className="hidden lg:block absolute inset-x-0 top-full mt-4 z-50 px-1"
                >
                  <div className="mx-auto w-full max-w-5xl relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-[0_25px_65px_rgba(15,23,42,0.18)] px-4 lg:px-8 pt-5 pb-6">
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-transparent" />
                      <div className="absolute -top-10 left-10 w-32 h-32 bg-white/70 blur-3xl rounded-full" />
                      <div className="absolute -bottom-16 right-12 w-48 h-48 bg-blue-100/40 blur-[90px] rounded-full" />
                    </div>
                    <div className="relative border-t border-slate-100 pt-4">
                      {openFilterPanel === 'macroCategories' && renderFilterGroup('Category', macroCategoryOptions, 'macroCategories', true, null, { alwaysExpanded: true, columns: 2 })}
                      {openFilterPanel === 'countries' && renderFilterGroup('Available in', countryOptions, 'countries', true, null, { alwaysExpanded: true, columns: 2 })}
                      {openFilterPanel === 'dataTypes' && renderFilterGroup('Data type', dataTypeOptions, 'dataTypes', true, null, { alwaysExpanded: true, columns: 2 })}
                      {openFilterPanel === 'compensationTypes' && renderFilterGroup('Compensation', PAYMENT_TYPES, 'compensationTypes', true, null, { alwaysExpanded: true, columns: 2 })}

                      <div className="mt-3 flex justify-between items-center text-xs">
                        <button
                          type="button"
                          onClick={() => openFilterPanel && handleClearGroup(openFilterPanel)}
                          className="text-google-text-secondary hover:text-google-text"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenFilterPanel(null)}
                          className="font-semibold text-google-blue hover:underline"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Active Filter Badges */}
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            {/* Sort macro categories alphabetically before mapping */}
            {[...filters.macroCategories].sort((a, b) => a.localeCompare(b)).map(value => {
              const categoryStyles = {
                'Organ, Body & Tissue Donation': 'bg-rose-100 text-rose-800',
                'Biological Samples': 'bg-blue-100 text-blue-800',
                'Clinical Trials': 'bg-green-100 text-green-800',
                'Health & Digital Data': 'bg-yellow-100 text-yellow-800',
              };
              const style = categoryStyles[value] || 'bg-gray-100 text-gray-800';

              return (
                <span key={`sel-mc-${value}`} className={`inline-flex items-center text-sm font-medium px-2 py-1 rounded-full ${style}`}>
                  {value}
                  <button
                    onClick={() => handleCheckboxChange('macroCategories', value, false)}
                    className="ml-1 hover:opacity-75"
                    aria-label={`Remove ${value}`}
                    style={{ color: 'inherit' }}
                  >
                    <FaTimes size="0.9em" />
                  </button>
                </span>
              );
            })}
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
                    className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${label}`}>
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
                  className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${value}`}>
                  <FaTimes size="0.9em" />
                </button>
              </span>
            ))}
            {/* Sort compensation types by PAYMENT_TYPES order before mapping */}
            {[...filters.compensationTypes]
              .sort((a, b) => PAYMENT_TYPES.map(p => p.value).indexOf(a.value) - PAYMENT_TYPES.map(p => p.value).indexOf(b.value))
              .map(option => (
                <span key={`sel-pay-${option.value}`} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                  {option.value === 'payment' ? '💲' : option.emoji} {option.label}
                  <button
                    onClick={() => handlePaymentCheckboxChange(option, false)}
                    className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${option.label}`}>
                    <FaTimes size="0.9em" />
                  </button>
                </span>
              ))}
          </div>

          {/* Resource Grid */}
          <div className="lg:col-span-1">
            <ResourceGrid
              resources={processedResources}
              filters={filters}
              onFilterChange={handleCheckboxChange}
              onPaymentFilterChange={handlePaymentCheckboxChange}
              compensationTypesOptions={PAYMENT_TYPES}
              citationMap={citationMap}
              onWearableFilterToggle={handleWearableFilterToggle}
              onMacroCategoryFilterChange={handleMacroCategoryFilterChange}
            />
          </div>

          {/* Desktop & Mobile Buttons under cards */}
          <div className="mt-8 flex flex-col items-center gap-2 w-full max-w-sm mx-auto">
            <Link
              href="/get-involved"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-apple-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FaPlus />
              Suggest a Service
            </Link>
            <Link
              href="/data"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded border border-apple-accent text-apple-accent text-sm font-medium hover:bg-apple-accent/10 transition-colors"
            >
              <FaDownload />
              Download Dataset
            </Link>
          </div>

          {/* References Section */}
          <ReferencesSection citations={citationList} />
        </main>
      </div > {/* End grid */}

      {/* Filter Drawer - Now uses the dynamically imported MobileFilterDrawer */}
      {
        isMounted && (
          <MobileFilterDrawer
            isOpen={isFilterDrawerOpen}
            toggleDrawer={toggleFilterDrawer}
            filters={filters}
            countryOptions={countryOptions}
            dataTypeOptions={dataTypeOptions}
            paymentTypes={PAYMENT_TYPES}
            handleCheckboxChange={(filterKey, value) => handleFilterChange(filterKey, value)}
            handlePaymentCheckboxChange={(option) => handleFilterChange('compensationType', option.value)}
            handleResetFilters={handleResetFilters}
            renderFilterContent={renderFilterContent} // Pass the existing render function
          />
        )
      }
    </div > // End flex-grow container
  );
}
