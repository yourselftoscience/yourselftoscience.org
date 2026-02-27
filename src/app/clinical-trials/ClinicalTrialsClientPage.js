'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { activeResources } from '@/data/resources';
import { EU_COUNTRIES } from '@/data/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobeAmericas, FaInfoCircle, FaFilter, FaChevronDown, FaStethoscope, FaArrowRight } from 'react-icons/fa';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import GeneticResourceCard from '@/components/GeneticResourceCard';

// --- Filter Options ---
const COMPENSATIONS = [
    { value: 'Any Compensation', label: 'Any Compensation' },
    { value: 'donation', label: 'Donation (Volunteer)' },
    { value: 'payment', label: 'Paid' },
    { value: 'mixed', label: 'Mixed' },
];

const SECTORS = [
    { value: 'Any Sector', label: 'Any Sector' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Public & Non-Profit', label: 'Public & Non-Profit' },
    { value: 'Government', label: 'Government' },
];

// Extract country options from clinical trial resources
const clinicalTrialResources = activeResources.filter(
    r => r.dataTypes?.includes('Clinical trials') && r.status !== 'Inactive'
);
const countrySet = new Set();
clinicalTrialResources.forEach(r => {
    if (r.countries) r.countries.forEach(c => { if (c !== 'Worldwide') countrySet.add(c); });
});
const ALL_COUNTRIES_SORTED = Array.from(countrySet).sort();

export default function ClinicalTrialsWizard() {
    const searchParams = useSearchParams();

    const [selectedCountries, setSelectedCountries] = useState(() => {
        const val = searchParams.get('country');
        return val ? val.split(',').filter(Boolean) : ['Any Country'];
    });
    const [selectedCompensation, setSelectedCompensation] = useState(
        searchParams.get('compensation') || 'Any Compensation'
    );
    const [selectedSector, setSelectedSector] = useState(
        searchParams.get('sector') || 'Any Sector'
    );

    const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
    const [isCompensationMenuOpen, setIsCompensationMenuOpen] = useState(false);
    const [isSectorMenuOpen, setIsSectorMenuOpen] = useState(false);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(() => {
        return searchParams.has('sector') || searchParams.has('compensation');
    });

    // --- URL Sync ---
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedCountries.length > 0 && !selectedCountries.includes('Any Country'))
            params.set('country', selectedCountries.join(','));
        if (selectedCompensation !== 'Any Compensation')
            params.set('compensation', selectedCompensation);
        if (selectedSector !== 'Any Sector')
            params.set('sector', selectedSector);

        const newSearch = params.toString();
        const currentSearch = window.location.search.replace('?', '');
        const currentHash = window.location.hash;

        if (newSearch !== currentSearch) {
            const newUrl = newSearch
                ? `${window.location.pathname}?${newSearch}${currentHash}`
                : window.location.pathname + currentHash;
            window.history.replaceState(null, '', newUrl);
        }
    }, [selectedCountries, selectedCompensation, selectedSector]);

    // --- Filtering Logic ---
    const filteredResources = useMemo(() => {
        let results = clinicalTrialResources.filter(resource => {
            // Country filter
            const isAnyCountrySelected = selectedCountries.includes('Any Country');
            const isWorldwideResource = !resource.countries || resource.countries.length === 0 || resource.countries.includes('Worldwide');

            if (isAnyCountrySelected && selectedCountries.length === 1) {
                // "Any Country" alone = show everything
                return true;
            } else if (isAnyCountrySelected) {
                // "Any Country" + specific countries = worldwide + those countries
                if (isWorldwideResource) return true;
                return selectedCountries.some(c => c !== 'Any Country' && resource.countries?.includes(c));
            } else {
                const matchesSpecific = selectedCountries.some(c => resource.countries?.includes(c));
                const matchesEU = selectedCountries.some(c => EU_COUNTRIES.includes(c)) && resource.countries?.includes('European Union');
                return isWorldwideResource || matchesSpecific || matchesEU;
            }
        });

        // Compensation filter
        if (selectedCompensation !== 'Any Compensation') {
            results = results.filter(resource => {
                const comp = resource.compensationType || 'donation';
                return comp === selectedCompensation;
            });
        }

        // Sector filter
        if (selectedSector !== 'Any Sector') {
            results = results.filter(resource => {
                if (selectedSector === 'Commercial') return resource.entityCategory === 'Commercial';
                if (selectedSector === 'Government') return resource.entityCategory === 'Government';
                if (selectedSector === 'Public & Non-Profit') return resource.entityCategory !== 'Commercial' && resource.entityCategory !== 'Government';
                return true;
            });
        }

        // Sort: registries first, then alphabetically
        return results.sort((a, b) => {
            const aIsRegistry = a.resourceType === 'registry' || a.resourceType === 'database';
            const bIsRegistry = b.resourceType === 'registry' || b.resourceType === 'database';
            if (aIsRegistry && !bIsRegistry) return -1;
            if (!aIsRegistry && bIsRegistry) return 1;
            return (a.title || '').localeCompare(b.title || '');
        });
    }, [selectedCountries, selectedCompensation, selectedSector]);

    // Split into registries and direct opportunities
    const registries = filteredResources.filter(r => r.resourceType === 'registry' || r.resourceType === 'database');
    const directOps = filteredResources.filter(r => r.resourceType !== 'registry' && r.resourceType !== 'database');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-white border-b border-slate-200 relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-green-200 rounded-full blur-3xl" />
                    <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-3xl" />
                </div>

                <div className="max-w-5xl mx-auto px-4 py-20 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-600 drop-shadow-sm mb-6 md:mb-8 tracking-tight leading-tight pb-2">
                        Find Clinical Trials
                    </h1>

                    {/* Wizard Container */}
                    <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl shadow-green-900/5 relative z-20 flex flex-col">
                        {/* Main Sentence Builder */}
                        <div className="flex flex-wrap items-center justify-center text-lg md:text-2xl leading-relaxed text-slate-600 p-6 md:p-8 gap-y-3 gap-x-1.5 font-medium relative z-40">
                            <span>I&apos;m looking for clinical trials in</span>
                            <MultiSelectDropdown
                                label="Select Country"
                                selectedValues={selectedCountries}
                                options={['Any Country', ...ALL_COUNTRIES_SORTED, 'Other Country']}
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
                        </div>

                        {/* Advanced Filters Toggle */}
                        <div className="bg-white/60 relative z-10 flex justify-center pb-2">
                            <button
                                onClick={() => {
                                    if (isFiltersExpanded) {
                                        setSelectedCompensation('Any Compensation');
                                        setSelectedSector('Any Sector');
                                    }
                                    setIsFiltersExpanded(!isFiltersExpanded);
                                }}
                                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-green-600 hover:border-green-200 transition-all duration-300 z-10"
                            >
                                <FaFilter className="w-3 h-3" />
                                {isFiltersExpanded ? 'Hide Filters' : 'Advanced Filters'}
                                <FaChevronDown className={`w-3 h-3 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Secondary Filters */}
                        <AnimatePresence>
                            {isFiltersExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="relative z-30"
                                >
                                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center bg-slate-50/50 border-t border-slate-200/60 p-4 gap-x-4 gap-y-3 relative z-0">
                                        <div className="flex items-center w-full sm:w-auto sm:mr-2">
                                            <span className="font-bold text-slate-500 uppercase tracking-widest text-[11px]">Filters:</span>
                                        </div>
                                        <MultiSelectDropdown
                                            label="Any Compensation"
                                            selectedValues={[selectedCompensation]}
                                            options={COMPENSATIONS}
                                            isOpen={isCompensationMenuOpen}
                                            setIsOpen={setIsCompensationMenuOpen}
                                            buttonClassName="w-full sm:w-auto inline-flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-700 font-semibold rounded-full text-sm sm:min-w-[180px] transition-all shadow-sm"
                                            onToggle={(val) => {
                                                setIsCompensationMenuOpen(false);
                                                setSelectedCompensation(val === selectedCompensation ? 'Any Compensation' : val);
                                            }}
                                        />
                                        <MultiSelectDropdown
                                            label="Any Sector"
                                            selectedValues={[selectedSector]}
                                            options={SECTORS}
                                            isOpen={isSectorMenuOpen}
                                            setIsOpen={setIsSectorMenuOpen}
                                            buttonClassName="w-full sm:w-auto inline-flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-700 font-semibold rounded-full text-sm sm:min-w-[160px] transition-all shadow-sm"
                                            onToggle={(val) => {
                                                setIsSectorMenuOpen(false);
                                                setSelectedSector(val === selectedSector ? 'Any Sector' : val);
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Result Count */}
                    <p className="mt-8 text-slate-500 text-lg font-medium">
                        We found <strong className="text-green-600 text-2xl">{filteredResources.length}</strong> resources matching your criteria.
                    </p>
                </div>
            </section>

            {/* Results */}
            <section className="max-w-6xl mx-auto px-4 py-16">
                {filteredResources.length > 0 ? (
                    <>
                        {/* Registries */}
                        {registries.length > 0 && (
                            <div id="registries" className="mb-16">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Clinical Trial Registries (Search Engines)</h2>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <FaInfoCircle className="text-green-600 w-5 h-5" aria-hidden="true" />
                                        </div>
                                        <h3 className="font-bold text-slate-900">How to Use These Resources</h3>
                                    </div>
                                    <p className="text-slate-600 mb-3">
                                        These registries act as search engines for clinical trials. They do not host the trials themselves. Visit their websites and search by:
                                    </p>
                                    <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
                                        <li>A specific disease or condition (e.g., &quot;diabetes&quot;, &quot;migraine&quot;)</li>
                                        <li>The term &quot;healthy volunteer&quot; if you don&apos;t have a specific condition</li>
                                        <li>Your country or city for local trials</li>
                                    </ul>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {registries.map(resource => (
                                        <motion.div
                                            key={resource.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="h-full"
                                        >
                                            <GeneticResourceCard
                                                resource={resource}
                                                onSectorClick={(sector) => setSelectedSector(sector)}
                                                onCompensationClick={(comp) => setSelectedCompensation(comp)}
                                                selectedCountries={selectedCountries}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Direct Opportunities */}
                        {directOps.length > 0 && (
                            <div id="direct-opportunities">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Direct Research Opportunities</h2>
                                <p className="text-slate-600 max-w-4xl mb-8">
                                    These programs recruit participants directly for specific research studies.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {directOps.map(resource => (
                                        <motion.div
                                            key={resource.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="h-full"
                                        >
                                            <GeneticResourceCard
                                                resource={resource}
                                                onSectorClick={(sector) => setSelectedSector(sector)}
                                                onCompensationClick={(comp) => setSelectedCompensation(comp)}
                                                selectedCountries={selectedCountries}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm max-w-2xl mx-auto">
                        <FaGlobeAmericas className="mx-auto h-16 w-16 text-slate-300 mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No resources found</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            Try selecting &quot;Any Country&quot; to see worldwide clinical trial registries and research programs.
                        </p>
                        <button
                            onClick={() => setSelectedCountries(['Any Country'])}
                            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20"
                        >
                            View Worldwide Resources
                        </button>
                    </div>
                )}

                {/* Educational Content */}
                <div className="mt-24 mb-16 max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-left">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaStethoscope className="text-green-600 w-6 h-6" aria-hidden="true" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                About Clinical Trials
                            </h2>
                        </div>
                        <div className="space-y-5 text-lg text-slate-600 leading-relaxed">
                            <p>
                                Clinical trials are research studies that test how well new medical approaches work in people. They are essential to developing new treatments, vaccines, and diagnostic procedures.
                            </p>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mt-6">
                                <h3 className="font-bold text-slate-900 mb-2">Who Can Participate?</h3>
                                <p className="text-base text-slate-600 mb-5">
                                    Many trials seek <strong>healthy volunteers</strong> as well as people with specific conditions. Eligibility criteria vary by study — age, health status, location, and other factors determine whether a trial is right for you.
                                </p>
                                <h3 className="font-bold text-slate-900 mb-2">Compensation</h3>
                                <p className="text-base text-slate-600 m-0">
                                    Some trials offer <strong>financial compensation</strong> for your time and travel. Others are volunteer-based. Our catalogue indicates the compensation type for each opportunity so you can make informed decisions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Explore All Resources Suggestion */}
                <div className="mt-24 mb-16 max-w-3xl mx-auto">
                    <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-3xl p-10 shadow-sm border border-green-100 text-center relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-200/50 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-200/50 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                                Looking for other ways to contribute?
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
                                Discover more ways to advance science. Explore our complete directory of <strong className="text-green-700">{activeResources.length}</strong> active projects across various fields.
                            </p>
                            <Link
                                href="/resources"
                                className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-green-500/30 ring-1 ring-green-700/50"
                            >
                                Browse All Resources
                                <FaArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}