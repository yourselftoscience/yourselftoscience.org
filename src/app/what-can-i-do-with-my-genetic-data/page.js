'use client';

// Force rebuild timestamp: 1
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { activeResources } from '@/data/resources';
export const dynamic = 'force-dynamic';
import { EU_COUNTRIES } from '@/data/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDna, FaGlobeAmericas, FaInfoCircle, FaCheck, FaChevronDown, FaFilter } from 'react-icons/fa';
import GeneticResourceCard from '@/components/GeneticResourceCard';
import Head from 'next/head';

// Service Options
const SERVICES = [
    { value: '', label: 'Select Provider...' },
    { value: '23andMe', label: '23andMe' },
    { value: 'AncestryDNA', label: 'AncestryDNA' },
    { value: 'MyHeritage', label: 'MyHeritage' },
    { value: 'FamilyTreeDNA', label: 'FamilyTreeDNA' },
    { value: 'tellmeGen', label: 'tellmeGen' },
    { value: 'Sequencing.com', label: 'Sequencing.com' },
    { value: 'Raw Data', label: 'Other DNA Kit (e.g. Microarray)' },
    { value: 'WGS', label: 'Other Whole Genome (e.g. 30x WGS)' }
];

const SECTORS = [
    { value: 'Any Sector', label: 'Any Sector' },
    { value: 'Commercial', label: 'Commercial Projects' },
    { value: 'Public & Non-Profit', label: 'Non-Profit Projects' }
];

const COMPENSATIONS = [
    { value: 'Any Compensation', label: 'Any Compensation' },
    { value: 'donation', label: 'Donation' },
    { value: 'payment', label: 'Payment' }
];

// Extract origins dynamically for "Based In" filter
const geneticResourcesList = activeResources.filter(resource =>
    resource.dataTypes?.some(t => t.includes('Genome') || t.includes('DNA') || t.includes('Genetic'))
);
const originsStringList = Array.from(new Set(geneticResourcesList.map(r => r.origin).filter(Boolean))).sort();
const hasInternational = geneticResourcesList.some(r => !r.origin);
const BASED_IN_OPTIONS = [
    { value: 'Any HQ Location', label: 'Any HQ Location' },
    ...originsStringList.map(o => ({ value: o, label: o })),
    ...(hasInternational ? [{ value: 'International', label: 'International' }] : [])
];

// Extracted from resources.js via script
// The script found only "United States" as a specific country for genetic resources.
// "Worldwide" resources will be available to everyone.
const DETECTED_COUNTRIES = [
    "United States"
];

// Country Options (Priority + Others)
const ALL_COUNTRIES_SORTED = [
    "United States"
];


function GeneticDataWizard() {
    const searchParams = useSearchParams();

    const [selectedCountries, setSelectedCountries] = useState(() => {
        const val = searchParams.get('country');
        return val ? val.split(',').filter(Boolean) : ['Any Country'];
    });
    const [selectedServices, setSelectedServices] = useState(() => {
        const val = searchParams.get('provider');
        return val ? val.split(',').filter(Boolean) : [];
    });
    const [selectedSector, setSelectedSector] = useState(searchParams.get('sector') || 'Any Sector');
    const [selectedCompensation, setSelectedCompensation] = useState(searchParams.get('compensation') || 'Any Compensation');
    const [selectedBasedIn, setSelectedBasedIn] = useState(searchParams.get('basedIn') || 'Any HQ Location');

    const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
    const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
    const [isSectorMenuOpen, setIsSectorMenuOpen] = useState(false);
    const [isCompensationMenuOpen, setIsCompensationMenuOpen] = useState(false);
    const [isBasedInMenuOpen, setIsBasedInMenuOpen] = useState(false);

    // UI states
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(() => {
        return searchParams.has('sector') || searchParams.has('compensation') || searchParams.has('basedIn');
    });

    // --- URL Sync ---
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedCountries.length > 0 && !selectedCountries.includes('Any Country')) params.set('country', selectedCountries.join(','));
        if (selectedServices.length > 0) params.set('provider', selectedServices.join(','));
        if (selectedSector !== 'Any Sector') params.set('sector', selectedSector);
        if (selectedCompensation !== 'Any Compensation') params.set('compensation', selectedCompensation);
        if (selectedBasedIn !== 'Any HQ Location') params.set('basedIn', selectedBasedIn);

        const newSearch = params.toString();
        const currentSearch = window.location.search.replace('?', '');

        // Grab current hash explicitly to prevent Next.js from wiping it on param sync
        const currentHash = window.location.hash;

        if (newSearch !== currentSearch) {
            const newUrl = newSearch ? `${window.location.pathname}?${newSearch}${currentHash}` : window.location.pathname + currentHash;
            window.history.replaceState(null, '', newUrl);
        }
    }, [selectedCountries, selectedServices, selectedSector, selectedCompensation, selectedBasedIn]);



    // --- Filtering Logic ---
    // --- Filtering Logic ---
    const sortedFilteredResources = useMemo(() => {
        let results = activeResources.filter(resource => {
            // 1. Must use Genetic Data
            const hasGenetic = resource.dataTypes?.some(t =>
                t.includes('Genome') || t.includes('DNA') || t.includes('Genetic')
            );
            if (!hasGenetic) return false;

            // 2. Country Filter
            // If "Any Country" is selected (alone or among others), show global + specific matches
            const isAnyCountrySelected = selectedCountries.includes('Any Country');
            const isWorldwideResource = !resource.countries || resource.countries.length === 0 || resource.countries.includes('Worldwide');

            if (isAnyCountrySelected) {
                // If "Any Country" is active, show Worldwide. 
                if (isWorldwideResource) return true;

                // Check if resource matches any OTHER selected country
                const specificMatch = selectedCountries.some(c => c !== 'Any Country' && resource.countries?.includes(c));
                if (specificMatch) return true;

                return false;
            } else {
                // "Any Country" NOT selected. Strict filtering.
                const matchesSpecific = selectedCountries.some(c => resource.countries?.includes(c));
                const matchesEU = selectedCountries.some(c => EU_COUNTRIES.includes(c)) && resource.countries?.includes('European Union');

                if (isWorldwideResource || matchesSpecific || matchesEU) return true;

                return false;
            }
        });

        // 3. Service Filter
        if (selectedServices.length > 0 && !selectedServices.includes('')) {
            results = results.filter(resource => {
                if (resource.compatibleSources) {
                    const acceptsGeneric = resource.compatibleSources.includes('Raw Data');
                    const acceptsWgs = resource.compatibleSources.includes('WGS');

                    if (selectedServices.includes('WGS') && acceptsWgs) return true;
                    if (selectedServices.some(s => s !== 'WGS') && acceptsGeneric) return true;

                    return selectedServices.some(s => resource.compatibleSources.includes(s));
                }
                return false;
            });
        }

        // 4. Sector Filter
        if (selectedSector !== 'Any Sector') {
            results = results.filter(resource => {
                const isCommercial = resource.entityCategory === 'Commercial';
                const isPublic = resource.entityCategory !== 'Commercial';

                if (selectedSector === 'Commercial') return isCommercial;
                if (selectedSector === 'Public & Non-Profit') return isPublic;
                return true;
            });
        }

        // 5. Compensation Filter
        if (selectedCompensation !== 'Any Compensation') {
            results = results.filter(resource => {
                const resourceComp = resource.compensationType || 'donation';
                return resourceComp === selectedCompensation;
            });
        }

        // 6. Based In Filter
        if (selectedBasedIn !== 'Any HQ Location') {
            results = results.filter(resource => {
                if (selectedBasedIn === 'International') {
                    return !resource.origin;
                }
                return resource.origin === selectedBasedIn;
            });
        }

        // --- Sorting Logic ---
        return results.sort((a, b) => {
            // Helper: Check if resource is "Official" for any selected service
            // We use slugs for deterministic matching
            const isOfficial = (res) => {
                if (selectedServices.includes('23andMe') && res.slug === '23andme') return true;
                if (selectedServices.includes('AncestryDNA') && res.slug === 'ancestry') return true;
                if (selectedServices.includes('MyHeritage') && res.slug === 'myheritage') return true;
                if (selectedServices.includes('FamilyTreeDNA') && res.slug && res.slug.includes('familytreedna')) return true;
                if (selectedServices.includes('tellmeGen') && res.slug === 'tellmegen') return true;
                if (selectedServices.includes('Sequencing.com') && res.slug === 'sequencing') return true;
                return false;
            };

            const aIsOfficial = isOfficial(a);
            const bIsOfficial = isOfficial(b);

            // 1. Official resources first
            if (aIsOfficial && !bIsOfficial) return -1;
            if (!aIsOfficial && bIsOfficial) return 1;

            // 2. Explicit compatibility (via compatibleSources or generic format/WGS)
            const matchesSelectedService = (res) => {
                if (!res.compatibleSources) return false;

                // If WGS is selected and resource accepts WGS, it's a match
                if (selectedServices.includes('WGS') && res.compatibleSources.includes('WGS')) return true;

                // If any non-WGS consumer service is selected and resource accepts Raw Data, it's a match
                if (selectedServices.some(s => s !== 'WGS') && res.compatibleSources.includes('Raw Data')) return true;

                // Otherwise, check for direct explicit match
                return selectedServices.some(s => res.compatibleSources.includes(s));
            };

            const aMatchesService = matchesSelectedService(a);
            const bMatchesService = matchesSelectedService(b);

            if (aMatchesService && !bMatchesService) return -1;
            if (!aMatchesService && bMatchesService) return 1;

            // 3. Fallback for zero-state: Prioritize "universal" platforms (those accepting 'Raw Data' or 'WGS')
            if (selectedServices.length === 0) {
                const aUniversal = a.compatibleSources?.includes('Raw Data') || a.compatibleSources?.includes('WGS');
                const bUniversal = b.compatibleSources?.includes('Raw Data') || b.compatibleSources?.includes('WGS');
                if (aUniversal && !bUniversal) return -1;
                if (!aUniversal && bUniversal) return 1;
            }

            return 0;
        });

    }, [selectedCountries, selectedServices, selectedSector, selectedCompensation, selectedBasedIn]);

    // Safe layout effect for Next.js SSR
    const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : useEffect;

    // --- Hash Scroll Fix ---
    useIsomorphicLayoutEffect(() => {
        const handleHashScroll = () => {
            if (window.location.hash) {
                const id = window.location.hash.substring(1);
                const element = document.getElementById(id);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 100; // Offset for sticky header
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }
        };

        // 1. Next.js often resets scroll to 0,0 after hydration. We must re-assert our scroll.
        let attempts = 0;
        const maxAttempts = 15; // Give it 1.5 seconds total to settle
        const scrollInterval = setInterval(() => {
            if (window.location.hash) {
                const id = window.location.hash.substring(1);
                const element = document.getElementById(id);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                    // Verify the scroll actually happened (Next doesn't always yield instantly)
                    if (Math.abs(window.scrollY - y) < 5 || attempts > 5) {
                        clearInterval(scrollInterval);
                    }
                } else if (attempts >= maxAttempts) {
                    clearInterval(scrollInterval);
                }
                attempts++;
            } else {
                clearInterval(scrollInterval);
            }
        }, 100);

        // 2. Listen for subsequent hash changes
        window.addEventListener('hashchange', handleHashScroll);

        return () => {
            clearInterval(scrollInterval);
            window.removeEventListener('hashchange', handleHashScroll);
        };
    }, [sortedFilteredResources]); // Re-run if the resource list changes



    // Helper for Multi-Select Dropdowns
    const MultiSelectDropdown = ({ label, selectedValues, options, isOpen, setIsOpen, onToggle, buttonClassName, textClassName }) => {
        // Derived display text
        const getDisplayText = () => {
            if (selectedValues.length === 0) return label;
            if (selectedValues.includes('Any Country')) return 'Any Country'; // simplification
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
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <section className="bg-white border-b border-slate-200 relative">
                {/* Background blobs for premium feel */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-200 rounded-full blur-3xl" />
                    <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-3xl" />
                </div>

                <div className="max-w-5xl mx-auto px-4 py-20 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 drop-shadow-sm mb-8 tracking-tight pb-2">
                        Find Research for Your DNA
                    </h1>

                    {/* Wizard & Filters Container */}
                    <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl shadow-blue-900/5 relative z-20 flex flex-col">

                        {/* Main Sentence Builder */}
                        <div className="flex flex-wrap items-center justify-center text-lg md:text-2xl leading-relaxed text-slate-600 p-6 md:p-8 gap-y-3 gap-x-1.5 font-medium relative z-40">
                            <span>I live in</span>
                            <MultiSelectDropdown
                                label="Select Country"
                                selectedValues={selectedCountries}
                                options={['Any Country', ...ALL_COUNTRIES_SORTED]}
                                isOpen={isCountryMenuOpen}
                                setIsOpen={setIsCountryMenuOpen}
                                onToggle={(val) => {
                                    if (val === 'Any Country') {
                                        setSelectedCountries(['Any Country']);
                                    } else {
                                        const newSelection = selectedCountries.filter(c => c !== 'Any Country');
                                        if (selectedCountries.includes(val)) {
                                            setSelectedCountries(newSelection.filter(c => c !== val));
                                        } else {
                                            setSelectedCountries([...newSelection, val]);
                                        }
                                    }
                                }}
                            />
                            <span>and have data from</span>
                            <MultiSelectDropdown
                                label="Select Provider"
                                selectedValues={selectedServices}
                                options={SERVICES.filter(s => s.value !== '')}
                                isOpen={isServiceMenuOpen}
                                setIsOpen={setIsServiceMenuOpen}
                                onToggle={(val) => {
                                    if (selectedServices.includes(val)) {
                                        setSelectedServices(selectedServices.filter(s => s !== val));
                                    } else {
                                        setSelectedServices([...selectedServices, val]);
                                    }
                                }}
                            />
                        </div>

                        {/* Expand/Collapse Toggle */}
                        <div className="bg-white/60 relative z-10 flex justify-center pb-2">
                            <button
                                onClick={() => {
                                    if (isFiltersExpanded) {
                                        // Reset filters when closing the drawer
                                        setSelectedSector('Any Sector');
                                        setSelectedCompensation('Any Compensation');
                                        setSelectedBasedIn('Any HQ Location');
                                    }
                                    setIsFiltersExpanded(!isFiltersExpanded);
                                }}
                                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 z-10"
                            >
                                <FaFilter className="w-3 h-3" />
                                {isFiltersExpanded ? 'Hide Filters' : 'Advanced Filters'}
                                <FaChevronDown className={`w-3 h-3 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Secondary Filters Bar */}
                        <AnimatePresence>
                            {isFiltersExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="relative z-30"
                                >
                                    <div className="flex flex-wrap items-center justify-center bg-slate-50/50 border-t border-slate-200/60 p-4 gap-x-4 gap-y-3 relative z-0">
                                        <div className="flex items-center gap-2 mr-2">
                                            <span className="font-bold text-slate-500 uppercase tracking-widest text-[11px]">Filters:</span>
                                        </div>
                                        <MultiSelectDropdown
                                            label="Any Compensation"
                                            selectedValues={[selectedCompensation]}
                                            options={COMPENSATIONS}
                                            isOpen={isCompensationMenuOpen}
                                            setIsOpen={setIsCompensationMenuOpen}
                                            buttonClassName="inline-flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 font-semibold rounded-full text-sm min-w-[180px] transition-all shadow-sm"
                                            onToggle={(val) => {
                                                // Close menu on selection
                                                setIsCompensationMenuOpen(false);
                                                // If clicking the already selected option, reset it to Any
                                                if (val === selectedCompensation) {
                                                    setSelectedCompensation('Any Compensation');
                                                } else {
                                                    setSelectedCompensation(val);
                                                }
                                            }}
                                        />
                                        <MultiSelectDropdown
                                            label="Any Sector"
                                            selectedValues={[selectedSector]}
                                            options={SECTORS}
                                            isOpen={isSectorMenuOpen}
                                            setIsOpen={setIsSectorMenuOpen}
                                            buttonClassName="inline-flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 font-semibold rounded-full text-sm min-w-[160px] transition-all shadow-sm"
                                            onToggle={(val) => {
                                                // Close menu on selection
                                                setIsSectorMenuOpen(false);
                                                // If clicking the already selected option, reset it to Any
                                                if (val === selectedSector) {
                                                    setSelectedSector('Any Sector');
                                                } else {
                                                    setSelectedSector(val);
                                                }
                                            }}
                                        />
                                        <MultiSelectDropdown
                                            label="Any HQ Location"
                                            selectedValues={[selectedBasedIn]}
                                            options={BASED_IN_OPTIONS}
                                            isOpen={isBasedInMenuOpen}
                                            setIsOpen={setIsBasedInMenuOpen}
                                            buttonClassName="inline-flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 font-semibold rounded-full text-sm min-w-[160px] transition-all shadow-sm"
                                            onToggle={(val) => {
                                                // Close menu on selection
                                                setIsBasedInMenuOpen(false);
                                                // If clicking the already selected option, reset it to Any
                                                if (val === selectedBasedIn) {
                                                    setSelectedBasedIn('Any HQ Location');
                                                } else {
                                                    setSelectedBasedIn(val);
                                                }
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {selectedServices.length === 0 ? (
                        <p className="mt-8 text-slate-500 text-lg font-medium">
                            Select a provider above to discover personalized research opportunities.<br />
                            <span className="text-slate-500 text-base">Meanwhile, browse general platforms below.</span>
                        </p>
                    ) : (
                        <p className="mt-8 text-slate-500 text-lg font-medium">
                            We found <strong className="text-blue-600 text-2xl">{sortedFilteredResources.length}</strong> projects matching your profile.
                        </p>
                    )}
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 py-16">
                {sortedFilteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {sortedFilteredResources.map(resource => (
                            <motion.div
                                key={resource.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <GeneticResourceCard
                                    resource={resource}
                                    selectedServices={selectedServices}
                                    onSectorClick={(sector) => {
                                        if (selectedSector === sector) {
                                            setSelectedSector('Any Sector');
                                        } else {
                                            setSelectedSector(sector);
                                            setIsFiltersExpanded(true);
                                        }
                                    }}
                                    onCompensationClick={(comp) => {
                                        if (selectedCompensation === comp) {
                                            setSelectedCompensation('Any Compensation');
                                        } else {
                                            setSelectedCompensation(comp);
                                            setIsFiltersExpanded(true);
                                        }
                                    }}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm max-w-2xl mx-auto">
                        <FaGlobeAmericas className="mx-auto h-16 w-16 text-slate-300 mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No projects found for {selectedCountries.join(', ')}</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            Most global projects are listed under &quot;Any Country&quot;. Try checking there for opportunities open to everyone.
                        </p>
                        <button
                            onClick={() => setSelectedCountries(['Any Country'])}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            View Worldwide Projects
                        </button>
                    </div>
                )}

                {/* Informational Content */}
                <div className="mt-24 mb-16 max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-left">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaInfoCircle className="text-blue-600 w-6 h-6" aria-hidden="true" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                About Your Genetic Data Files
                            </h2>
                        </div>

                        <div className="space-y-5 text-lg text-slate-600 leading-relaxed">
                            <p>
                                Once you find a research project that matches your profile, you will typically need to provide your raw genetic data file to participate.
                            </p>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mt-6">
                                <h3 className="font-bold text-slate-900 mb-2">Microarray Kits (Standard)</h3>
                                <p className="text-base text-slate-600 mb-5">
                                    Most projects accept data from standard <strong>DNA microarray kits</strong> (e.g. 23andMe, AncestryDNA, MyHeritage). These files only capture a fraction of your genome and are typically exported as small <code>.txt</code>, <code>.csv</code>, or <code>.vcf</code> files directly from your account settings.
                                </p>
                                <h3 className="font-bold text-slate-900 mb-2">Whole Genome Sequencing (Advanced)</h3>
                                <p className="text-base text-slate-600 m-0">
                                    If you have used a deep <strong>whole-genome sequencing (WGS)</strong> service, you may possess massive files covering your entire genome. These comprehensive formats (often BAM, FASTQ, FASTA, or large VCFs) are significantly larger and require specialized research platforms to process.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
// Wrap the main functional component in Suspense to safely use Next.js useSearchParams
export default function GeneticDataPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">Loading research opportunities...</div>}>
            <GeneticDataWizard />
        </Suspense>
    );
}
