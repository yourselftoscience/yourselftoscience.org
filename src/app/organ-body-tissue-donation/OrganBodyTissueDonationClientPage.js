'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { activeResources } from '@/data/resources';
import { EU_COUNTRIES } from '@/data/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobeAmericas, FaInfoCircle, FaFilter, FaChevronDown, FaHandHoldingHeart } from 'react-icons/fa';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import GeneticResourceCard from '@/components/GeneticResourceCard';

// --- Filter Options ---
const DONATION_TYPES = [
    { value: 'Any Type', label: 'Any Type' },
    { value: 'Body', label: 'Body (Whole Body)' },
    { value: 'Organ', label: 'Organ' },
    { value: 'Tissue', label: 'Tissue' },
    { value: 'Placenta', label: 'Placenta' },
    { value: 'Eggs', label: 'Eggs' },
    { value: 'Sperm', label: 'Sperm' },
    { value: 'Embryos', label: 'Embryos' },
];

const SECTORS = [
    { value: 'Any Sector', label: 'Any Sector' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Public & Non-Profit', label: 'Public & Non-Profit' },
    { value: 'Government', label: 'Government' },
];

// Extract data from organ/body/tissue resources
const organBodyTissueTypes = ['Organ', 'Body', 'Tissue', 'Placenta', 'Eggs', 'Sperm', 'Embryos'];
const donationResources = activeResources.filter(
    r => r.dataTypes?.some(t => organBodyTissueTypes.includes(t)) && r.status !== 'Inactive'
);
const countrySet = new Set();
donationResources.forEach(r => {
    if (r.countries) r.countries.forEach(c => { if (c !== 'Worldwide') countrySet.add(c); });
});
const ALL_COUNTRIES_SORTED = Array.from(countrySet).sort();

export default function OrganBodyTissueWizard() {
    const searchParams = useSearchParams();

    const [selectedCountries, setSelectedCountries] = useState(() => {
        const val = searchParams.get('country');
        return val ? val.split(',').filter(Boolean) : ['Any Country'];
    });
    const [selectedDonationType, setSelectedDonationType] = useState(
        searchParams.get('type') || 'Any Type'
    );
    const [selectedSector, setSelectedSector] = useState(
        searchParams.get('sector') || 'Any Sector'
    );

    const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
    const [isDonationTypeMenuOpen, setIsDonationTypeMenuOpen] = useState(false);
    const [isSectorMenuOpen, setIsSectorMenuOpen] = useState(false);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(() => {
        return searchParams.has('sector');
    });

    // --- URL Sync ---
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedCountries.length > 0 && !selectedCountries.includes('Any Country'))
            params.set('country', selectedCountries.join(','));
        if (selectedDonationType !== 'Any Type')
            params.set('type', selectedDonationType);
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
    }, [selectedCountries, selectedDonationType, selectedSector]);

    // --- Filtering Logic ---
    const filteredResources = useMemo(() => {
        let results = donationResources.filter(resource => {
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

        // Donation type filter
        if (selectedDonationType !== 'Any Type') {
            results = results.filter(resource =>
                resource.dataTypes?.includes(selectedDonationType)
            );
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

        return results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }, [selectedCountries, selectedDonationType, selectedSector]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-white border-b border-slate-200 relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-rose-200 rounded-full blur-3xl" />
                    <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-3xl" />
                </div>

                <div className="max-w-5xl mx-auto px-4 py-20 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-purple-600 drop-shadow-sm mb-6 md:mb-8 tracking-tight leading-tight pb-2">
                        Find Organ, Body & Tissue Donation Programs
                    </h1>

                    {/* Wizard Container */}
                    <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl shadow-rose-900/5 relative z-20 flex flex-col">
                        {/* Main Sentence Builder */}
                        <div className="flex flex-wrap items-center justify-center text-lg md:text-2xl leading-relaxed text-slate-600 p-6 md:p-8 gap-y-3 gap-x-1.5 font-medium relative z-40">
                            <span>I want to donate</span>
                            <MultiSelectDropdown
                                label="Select Type"
                                selectedValues={[selectedDonationType]}
                                options={DONATION_TYPES}
                                isOpen={isDonationTypeMenuOpen}
                                setIsOpen={setIsDonationTypeMenuOpen}
                                onToggle={(val) => {
                                    setIsDonationTypeMenuOpen(false);
                                    setSelectedDonationType(val === selectedDonationType ? 'Any Type' : val);
                                }}
                            />
                            <span>in</span>
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
                                        setSelectedSector('Any Sector');
                                    }
                                    setIsFiltersExpanded(!isFiltersExpanded);
                                }}
                                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-all duration-300 z-10"
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
                                            label="Any Sector"
                                            selectedValues={[selectedSector]}
                                            options={SECTORS}
                                            isOpen={isSectorMenuOpen}
                                            setIsOpen={setIsSectorMenuOpen}
                                            buttonClassName="w-full sm:w-auto inline-flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 font-semibold rounded-full text-sm sm:min-w-[160px] transition-all shadow-sm"
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
                        We found <strong className="text-rose-600 text-2xl">{filteredResources.length}</strong> programs matching your criteria.
                    </p>
                </div>
            </section>

            {/* Results */}
            <section className="max-w-6xl mx-auto px-4 py-16">
                {filteredResources.length > 0 ? (
                    <div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FaInfoCircle className="text-amber-600 w-5 h-5" aria-hidden="true" />
                                </div>
                                <h3 className="font-bold text-slate-900">Important Information</h3>
                            </div>
                            <p className="text-slate-600">
                                Body donation often requires pre-registration, sometimes well in advance. Each program has specific procedures, acceptance criteria, and geographic limitations. We strongly recommend visiting each program&apos;s website to understand their requirements.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredResources.map(resource => (
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
                                        selectedCountries={selectedCountries}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm max-w-2xl mx-auto">
                        <FaGlobeAmericas className="mx-auto h-16 w-16 text-slate-300 mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No programs found</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            Try selecting &quot;Any Country&quot; or a different donation type to see available programs.
                        </p>
                        <button
                            onClick={() => { setSelectedCountries(['Any Country']); setSelectedDonationType('Any Type'); }}
                            className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-500/20"
                        >
                            View All Programs
                        </button>
                    </div>
                )}

                {/* Educational Content */}
                <div className="mt-24 mb-16 max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-left">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaHandHoldingHeart className="text-rose-600 w-6 h-6" aria-hidden="true" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                About Organ, Body &amp; Tissue Donation
                            </h2>
                        </div>
                        <div className="space-y-5 text-lg text-slate-600 leading-relaxed">
                            <p>
                                Organ, body, and tissue donation is a profound contribution to medical education, surgical training, and scientific research. It helps advance healthcare for future generations.
                            </p>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mt-6">
                                <h3 className="font-bold text-slate-900 mb-2">Types of Donation</h3>
                                <p className="text-base text-slate-600 mb-5">
                                    Programs in this catalogue cover a wide range: <strong>whole body donation</strong> for medical education, <strong>organ donation</strong> for transplant and research, <strong>tissue donation</strong> (skin, bone, cornea), and <strong>reproductive donation</strong> (eggs, sperm, embryos, placenta).
                                </p>
                                <h3 className="font-bold text-slate-900 mb-2">Pre-Registration</h3>
                                <p className="text-base text-slate-600 m-0">
                                    Many body donation programs require <strong>pre-registration</strong> while you are still alive and healthy. Some may have geographic restrictions or waiting lists. Visit each program&apos;s website to learn about their specific enrollment process.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="mt-12 text-sm text-center text-gray-500">
                    <b>Disclaimer:</b> This website provides a catalogue of resources and does not provide legal or medical advice. Please consult with program coordinators and your family to make informed decisions about donation.
                </p>

                {/* Link back */}
                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-slate-500 hover:text-rose-600 transition-colors font-medium">
                        ← View all {activeResources.filter(r => r.status !== 'Inactive').length} resources in the catalogue
                    </Link>
                </div>
            </section>
        </div>
    );
}