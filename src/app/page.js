// src/app/page.js

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { resources as allResources } from '@/data/resources';
import { PAYMENT_TYPES, EU_COUNTRIES } from '@/data/constants';
import dynamic from 'next/dynamic';
import CountryFlag from 'react-country-flag';
import { FaTimes, FaDownload, FaSlidersH, FaPlus, FaSearch, FaCheck } from 'react-icons/fa';
import { usePathname, useSearchParams } from 'next/navigation';
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
// HomePageContent is defined in this file, so we don't need to dynamically import it from itself.
// If we want to lazy load it, we should move it to a separate file.
// For now, let's just use it directly to avoid the circular dependency/webpack error.
const HomePageContentDynamic = HomePageContent;

// Dynamically import ReferencesSection
const ReferencesSection = dynamic(() => import('@/components/ReferencesSection'), {
  ssr: false
});

import FilterGroup from '../components/FilterGroup';

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
    for (const c of EU_COUNTRIES) {
      set.add(c);
    }
    if (!chosen.includes('European Union')) {
      set.add('European Union');
    }
  } else if (hasAnyEUCountry) {
    set.add('European Union');
    for (const c of chosen) {
      if (EU_COUNTRIES.includes(c)) {
        set.add(c);
      }
    }
  }

  for (const c of chosen) {
    if (!EU_COUNTRIES.includes(c) && c !== 'European Union') {
      set.add(c);
    }
  }

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
      {[1, 2, 3, 4, 5, 6].map((id) => ( // Show 6 placeholder cards
        <div key={id} className="bg-white border border-slate-200 rounded-3xl p-6 h-[420px] flex flex-col animate-pulse shadow-sm">

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
    if (globalThis.window === undefined) return; // Check if window is defined
    const handleScroll = () => {
      const y = globalThis.window.scrollY || globalThis.window.pageYOffset || 0;
      setScrollY(y);
    };

    handleScroll();
    globalThis.window.addEventListener('scroll', handleScroll, { passive: true });
    return () => globalThis.window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Suspense fallback={<ContentAreaSkeleton />}>
        <HomePageContentDynamic scrollY={scrollY} />
      </Suspense>
    </div>
  );
}


// --- FilterPill Component ---
function FilterPill({ label, summary, isActive, onClick, isStickyFilterBar }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex-1 flex flex-col justify-center px-6 py-3 text-left transition-colors hover:bg-slate-100/50 rounded-full"
    >
      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
        {label}
      </span>
      {!isStickyFilterBar && summary && (
        <span className="text-sm text-slate-600">
          {summary}
        </span>
      )}
    </button>
  );
}

FilterPill.propTypes = {
  label: PropTypes.string.isRequired,
  summary: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  isStickyFilterBar: PropTypes.bool,
};

// Helper function for data type matching to reduce nesting
const matchesDataType = (resourceDataTypes, filterType) => {
  if (filterType === 'Wearable data') {
    return resourceDataTypes.some(rdt => rdt.startsWith('Wearable data'));
  }
  return resourceDataTypes.includes(filterType);
};

// Helper function for filter summaries
const getFilterSummary = (selectedValues, defaultText, labelFn = (v) => v) => {
  if (!selectedValues || selectedValues.length === 0) return defaultText;
  if (selectedValues.length === 1) return labelFn(selectedValues[0]);
  return `${selectedValues.length} selected`;
};

// --- HomePageContent Component (Handles dynamic content) ---
// Accept scrollY as a prop
// Accept scrollY as a prop
function HomePageContent({ scrollY }) {
  const pathname = usePathname();
  const searchParams = useSearchParams(); // This causes the component to suspend

  // ... state declarations (filters, showMore, isMounted, etc.) ...

  // --- Filter State ---
  const [filters, setFilters] = useState({
    macroCategories: [],
    countries: [],
    dataTypes: [],

    compensationTypes: [],
    sectors: []
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [openFilterPanel, setOpenFilterPanel] = useState(null);
  const filterContainerRef = useRef(null);

  // Extract highlighted resource from URL
  const highlightedResourceSlug = searchParams.get('resource') || null;

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
    // Initialize filters from searchParams ONLY ON MOUNT
    // Do not re-run when searchParams changes, as that would reset user's filter selections
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run on mount
    const macroCategoriesParam = searchParams.get('macroCategories');
    const parsedMacroCategories = parseMacroCategories(macroCategoriesParam);

    const initialFilters = {
      dataTypes: parseUrlList(searchParams.get('dataTypes')),
      sectors: parseUrlList(searchParams.get('sectors')),
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
  }, [searchParams]); // Include searchParams but only run effect logic on mount
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
    if (filters.sectors.length > 0) {
      // Sort sectors alphabetically
      params.set('sectors', [...filters.sectors].sort((a, b) => a.localeCompare(b)).join(','));
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

    // Preserve the resource parameter if it exists
    if (highlightedResourceSlug) {
      params.set('resource', highlightedResourceSlug);
    }

    const queryString = params.toString();
    // Use replaceState to update the URL without adding to browser history
    globalThis.window.history.replaceState(null, '', queryString ? `?${queryString}` : pathname);

  }, [filters, isMounted, pathname, highlightedResourceSlug]); // Re-run when filters, isMounted, pathname, or highlightedResourceSlug changes
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
    for (const resource of allResources) {
      const resourceCountries = resource.countries || [];
      for (const [index, country] of resourceCountries.entries()) {
        if (typeof country === 'string' && country.length > 0) {
          countries.add(country);
        }
        if (resource.countryCodes?.[index] && !countryCodeMap.has(country)) {
          countryCodeMap.set(country, resource.countryCodes[index]);
        }
      }
    }
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
        resource.dataTypes && filters.dataTypes.some(filterType => matchesDataType(resource.dataTypes, filterType))
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

    if (filters.sectors.length > 0) {
      filteredData = filteredData.filter(resource => {
        const isCommercial = resource.entityCategory === 'Commercial';
        // If it's not Commercial, it counts as Public & Non-Profit
        const isPublic = resource.entityCategory !== 'Commercial';

        return filters.sectors.some(sector =>
          (sector === 'Commercial' && isCommercial) ||
          (sector === 'Public & Non-Profit' && isPublic)
        );
      });
    }

    filteredData.sort((a, b) => a.title.localeCompare(b.title));

    return filteredData;
  }, [filters]); // Ensure filters is the dependency

  // Derive citations in page order
  const citationList = useMemo(() => {
    const list = [];
    for (const resource of processedResources) {
      const citations = resource.citations || [];
      for (const citation of citations) {
        if (!list.some(c => (c.link || '').trim() === (citation.link || '').trim() &&
          (c.title || '') === citation.title)) {
          list.push(citation);
        }
      }
    }
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

        // If Donation or Payment was removed, check if the other is still selected. If not, remove Mixed.
        if ((option.value === 'donation' && !newPaymentValues.has('payment')) ||
          (option.value === 'payment' && !newPaymentValues.has('donation'))) {
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
      sectors: [],
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

  const handleWearableFilterToggle = () => {
    const isWearableActive = filters.dataTypes.includes('Wearable data');
    handleCheckboxChange('dataTypes', 'Wearable data', !isWearableActive);
  };

  const handleFilterChange = useCallback((filterKey, value, isChecked) => {
    if (filterKey === 'compensationTypes') {
      const paymentOption = PAYMENT_TYPES.find(p => p.value === value);
      if (paymentOption) {
        handlePaymentCheckboxChange(paymentOption, isChecked);
      }
    } else if (filterKey === 'macroCategories') {
      handleMacroCategoryFilterChange(value);
    } else {
      handleCheckboxChange(filterKey, value, isChecked);
    }
  }, [handlePaymentCheckboxChange, handleMacroCategoryFilterChange, handleCheckboxChange]);







  // --- Prevent rendering until mounted (Keep this check) ---
  // This ensures filters are initialized from URL before rendering dynamic content
  if (!isMounted) {
    // Return the skeleton here to match the Suspense fallback during initial client render phase
    return <ContentAreaSkeleton />;
  }

  // --- Return the JSX for the main content area ONLY ---
  // --- Derived State for Filter Summaries ---
  const macroCategorySummary = getFilterSummary(filters.macroCategories, 'Any type');
  const countrySummary = getFilterSummary(filters.countries, 'Anywhere');
  const dataTypeSummary = getFilterSummary(filters.dataTypes, 'All');
  const compensationSummary = getFilterSummary(filters.compensationTypes, 'Any', (v) => v.label);

  const isStickyFilterBar = scrollY > 50;

  return (
    <div className="flex-grow w-full max-w-screen-xl mx-auto px-4 pb-8 pt-3">

      {/* Intro Text */}
      <p className="text-base text-google-text-secondary max-w-5xl mb-6">
        A comprehensive open-source catalogue of services allowing individuals to contribute to scientific research.
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
                : 'bg-white/95 border-slate-200/75 relative md:max-w-4xl w-full mx-auto'
              }`}
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
                  summary={macroCategorySummary}
                  isActive={openFilterPanel === 'macroCategories'}
                  onClick={() => setOpenFilterPanel(openFilterPanel === 'macroCategories' ? null : 'macroCategories')}
                  isStickyFilterBar={isStickyFilterBar}
                />
                <div className="w-px bg-slate-200 my-3"></div>
                <FilterPill
                  label="Available in"
                  summary={countrySummary}
                  isActive={openFilterPanel === 'countries'}
                  onClick={() => setOpenFilterPanel(openFilterPanel === 'countries' ? null : 'countries')}
                  isStickyFilterBar={isStickyFilterBar}
                />
                <div className="w-px bg-slate-200 my-3"></div>
                <FilterPill
                  label="Data type"
                  summary={dataTypeSummary}
                  isActive={openFilterPanel === 'dataTypes'}
                  onClick={() => setOpenFilterPanel(openFilterPanel === 'dataTypes' ? null : 'dataTypes')}
                  isStickyFilterBar={isStickyFilterBar}
                />
                <div className="w-px bg-slate-200 my-3"></div>
                <FilterPill
                  label="Compensation"
                  summary={compensationSummary}
                  isActive={openFilterPanel === 'compensationTypes'}
                  onClick={() => setOpenFilterPanel(openFilterPanel === 'compensationTypes' ? null : 'compensationTypes')}
                  isStickyFilterBar={isStickyFilterBar}
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
                      {openFilterPanel === 'macroCategories' && (
                        <>
                          <FilterGroup
                            title="Category"
                            options={macroCategoryOptions}
                            filterKey="macroCategories"
                            selectedValues={filters.macroCategories}
                            onFilterChange={(k, v, c) => handleFilterChange(k, v, c)}
                            onSelectAll={(shouldSelect) => handleSelectAll('macroCategories', macroCategoryOptions, shouldSelect)}
                            config={{ alwaysExpanded: true, columns: 2, HeadingTag: 'h2' }}
                          />

                          <div className="w-full h-px bg-slate-100 my-6"></div>

                          <div className="mb-2">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Sector</h3>
                            <div className="flex flex-wrap gap-3">
                              {['Commercial', 'Public & Non-Profit'].map(sector => {
                                const isSelected = filters.sectors.includes(sector);
                                return (
                                  <button
                                    key={sector}
                                    onClick={() => handleFilterChange('sectors', sector, !isSelected)}
                                    className={`
                                      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border
                                      ${isSelected
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                                    `}
                                  >
                                    <div className={`
                                      w-4 h-4 rounded border flex items-center justify-center
                                      ${isSelected
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'bg-white border-slate-300'}
                                    `}>
                                      {isSelected && <FaCheck className="text-[8px]" />}
                                    </div>
                                    {sector}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                      {openFilterPanel === 'countries' && (
                        <FilterGroup
                          title="Available in"
                          options={countryOptions}
                          filterKey="countries"
                          selectedValues={filters.countries}
                          onFilterChange={(k, v, c) => handleFilterChange(k, v, c)}
                          onSelectAll={(shouldSelect) => handleSelectAll('countries', countryOptions, shouldSelect)}
                          config={{ alwaysExpanded: true, columns: 2, HeadingTag: 'h2' }}
                        />
                      )}
                      {openFilterPanel === 'dataTypes' && (
                        <FilterGroup
                          title="Data type"
                          options={dataTypeOptions}
                          filterKey="dataTypes"
                          selectedValues={filters.dataTypes}
                          onFilterChange={(k, v, c) => handleFilterChange(k, v, c)}
                          onSelectAll={(shouldSelect) => handleSelectAll('dataTypes', dataTypeOptions, shouldSelect)}
                          config={{ alwaysExpanded: true, columns: 2, HeadingTag: 'h2' }}
                        />
                      )}
                      {openFilterPanel === 'compensationTypes' && (
                        <FilterGroup
                          title="Compensation"
                          options={PAYMENT_TYPES}
                          filterKey="compensationTypes"
                          selectedValues={filters.compensationTypes}
                          onFilterChange={(k, v, c) => handleFilterChange(k, v, c)}
                          onSelectAll={(shouldSelect) => handleSelectAll('compensationTypes', PAYMENT_TYPES, shouldSelect)}
                          config={{ alwaysExpanded: true, columns: 2, HeadingTag: 'h2' }}
                        />
                      )}

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



          {/* Active Sector Badges */}
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            {filters.sectors.map(sector => (
              <button
                key={sector}
                onClick={() => handleFilterChange('sectors', sector, false)}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 hover:bg-indigo-200 transition-colors"
              >
                {sector}
                <FaTimes className="ml-2 h-3 w-3" />
              </button>
            ))}

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
                    className="ml-1 text-google-blue hover:opacity-75"
                    aria-label={`Remove ${value}`}
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
                <span key={`sel - ctry - ${value} `} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                  {label}
                  {code && <CountryFlag countryCode={code} svg style={{ width: '1em', height: '0.8em', marginLeft: '4px' }} />}
                  <button
                    onClick={() => handleCheckboxChange('countries', value, false)}
                    className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${label} `}>
                    <FaTimes size="0.9em" />
                  </button>
                </span>
              );
            })}
            {/* Sort data types alphabetically before mapping */}
            {[...filters.dataTypes].sort((a, b) => a.localeCompare(b)).map(value => (
              <span key={`sel - dt - ${value} `} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                {value}
                <button
                  onClick={() => handleCheckboxChange('dataTypes', value, false)}
                  className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${value} `}>
                  <FaTimes size="0.9em" />
                </button>
              </span>
            ))}
            {/* Sort compensation types by PAYMENT_TYPES order before mapping */}
            {[...filters.compensationTypes]
              .sort((a, b) => PAYMENT_TYPES.map(p => p.value).indexOf(a.value) - PAYMENT_TYPES.map(p => p.value).indexOf(b.value))
              .map(option => (
                <span key={`sel - pay - ${option.value} `} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                  {option.value === 'payment' ? '💲' : option.emoji} {option.label}
                  <button
                    onClick={() => handlePaymentCheckboxChange(option, false)}
                    className="ml-1 text-google-blue hover:opacity-75" aria-label={`Remove ${option.label} `}>
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
              highlightedResourceSlug={highlightedResourceSlug}
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
        </main >
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
            handleCheckboxChange={handleCheckboxChange}
            handlePaymentCheckboxChange={handlePaymentCheckboxChange}
            handleResetFilters={handleResetFilters}
            renderFilterContent={() => (
              <>
                {isMounted && (
                  <>
                    <FilterGroup
                      title="Category"
                      options={macroCategoryOptions}
                      filterKey="macroCategories"
                      selectedValues={filters.macroCategories}
                      onFilterChange={(k, v, c) => handleFilterChange(k, v, c)}
                      onSelectAll={(shouldSelect) => handleSelectAll('macroCategories', macroCategoryOptions, shouldSelect)}
                      config={{ alwaysExpanded: true, HeadingTag: 'h2' }}
                    />
                    <FilterGroup
                      title="Available In"
                      options={countryOptions}
                      filterKey="countries"
                      selectedValues={filters.countries}
                      onFilterChange={(k, v, c) => handleFilterChange(k, v, c)}
                      onSelectAll={(shouldSelect) => handleSelectAll('countries', countryOptions, shouldSelect)}
                      config={{ HeadingTag: 'h2' }}
                    />
                    <FilterGroup
                      title="Data Type"
                      options={dataTypeOptions}
                      filterKey="dataTypes"
                      selectedValues={filters.dataTypes}
                      onFilterChange={(k, v, c) => handleFilterChange(k, v, c)}
                      onSelectAll={(shouldSelect) => handleSelectAll('dataTypes', dataTypeOptions, shouldSelect)}
                      config={{ HeadingTag: 'h2' }}
                    />
                    <FilterGroup
                      title="Compensation"
                      options={PAYMENT_TYPES}
                      filterKey="compensationTypes"
                      selectedValues={filters.compensationTypes}
                      onFilterChange={(k, v, c) => handleFilterChange(k, v, c)}
                      onSelectAll={(shouldSelect) => handleSelectAll('compensationTypes', PAYMENT_TYPES, shouldSelect)}
                      config={{ HeadingTag: 'h2' }}
                    />

                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <h2 className="text-lg font-bold mb-3 text-slate-800">Sector</h2>
                      <div className="flex flex-wrap gap-2">
                        {['Commercial', 'Public & Non-Profit'].map(sector => {
                          const isSelected = filters.sectors.includes(sector);
                          return (
                            <button
                              key={sector}
                              onClick={() => handleFilterChange('sectors', sector, !isSelected)}
                              className={`
                                flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border
                                ${isSelected
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                              `}
                            >
                              <div className={`
                                w-4 h-4 rounded border flex items-center justify-center
                                ${isSelected
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'bg-white border-slate-300'}
                              `}>
                                {isSelected && <FaCheck className="text-[8px]" />}
                              </div>
                              {sector}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          />
        )
      }
    </div > // End flex-grow container
  );
}

HomePageContent.propTypes = {
  scrollY: PropTypes.number.isRequired,
};
