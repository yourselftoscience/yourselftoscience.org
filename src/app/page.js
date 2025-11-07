// src/app/page.js

'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
// Import motionValue ONLY if needed elsewhere, otherwise remove. useScroll is now used here.
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import Footer from '@/components/Footer';
import { resources as allResources } from '@/data/resources';
import { PAYMENT_TYPES, EU_COUNTRIES } from '@/data/constants';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import CountryFlag from 'react-country-flag';
import { FaHeart, FaDollarSign, FaTimes, FaFilter, FaDownload, FaSlidersH, FaUndo, FaPlus, FaExternalLinkAlt } from 'react-icons/fa';
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
      if (currentCats.length === 1 && currentCats[0] === category) {
        // If the clicked category is the only one selected, deselect it.
        return { ...prev, macroCategories: [] };
      } else {
        // Otherwise, select only the clicked category.
        return { ...prev, macroCategories: [category] };
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
  const renderFilterGroup = (title, options, filterKey, showMore, setShowMore) => {
    const selectedValues = filters[filterKey];
    const visibleOptions = showMore ? options : options.slice(0, 3);
    // --- START: Modify condition for showing Clear all ---
    // Show "Clear all" if more than one item is selected
    const showClearAll = selectedValues.length > 1;
    // --- END: Modify condition for showing Clear all ---
    // Note: allSelected and someSelected are no longer directly used for the button logic, but kept for potential future use or clarity
    const allSelected = options.length > 0 && selectedValues.length === options.length;
    const someSelected = selectedValues.length > 0 && !allSelected;


    return (
      <div className="mb-4">
        <h3 className="font-normal text-base text-google-text mb-1">{title}</h3>
        <button
          // --- START: Update onClick and text based on showClearAll ---
          onClick={() => handleSelectAll(filterKey, options, !showClearAll)} // If showing "Clear all", pass false to selectAll; otherwise pass true
          className="text-sm font-medium text-google-blue hover:underline mb-2 block"
          aria-label={showClearAll ? `Clear all ${title}` : `Select all ${title}`}
        >
          {showClearAll ? 'Clear all' : 'Select all'}
          {/* --- END: Update onClick and text based on showClearAll --- */}
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

      {/* Compensation Filter */}
      <div className="mb-4">
        <h3 className="font-normal text-base text-google-text mb-1">Compensation</h3>
        {/* --- START: Apply same logic to Compensation button --- */}
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
        {/* --- END: Apply same logic to Compensation button --- */}

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
            <label htmlFor={`payment-${option.value}-mobile`} className="text-base font-normal text-google-text-secondary flex items-center gap-2 cursor-pointer">
              <span>{option.value === 'payment' ? '💲' : option.emoji}</span>
              <span>{option.label}</span>
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
      <div className="grid grid-cols-layout lg:grid-cols-lg-layout gap-6">
        {/* Sidebar */}
        {/* --- START: Adjust sticky top value --- */}
        {/* Final sticky header height is ~51px (35px logo + 8px*2 padding). Add a gap. */}
        <aside className="hidden lg:block py-4 px-4 sticky top-[55px] h-[calc(100vh-100px)] overflow-y-auto">
        {/* --- END: Adjust sticky top value --- */}
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
            <Link
              href="/contribute"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-apple-accent rounded-lg hover:bg-opacity-90 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors"
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
        </aside>

        {/* Main Content Area */}
        <main className="py-4">
          {/* Search and Mobile Filter Button */}
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

          {/* Mobile Buttons */}
          <div className="mt-8 flex flex-col items-center gap-2 w-full max-w-xs mx-auto lg:hidden">
             <Link
                href="/contribute"
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
      </div> {/* End grid */}

      {/* Filter Drawer - Now uses the dynamically imported MobileFilterDrawer */}
      {isMounted && (
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
      )}
    </div> // End flex-grow container
  );
}
