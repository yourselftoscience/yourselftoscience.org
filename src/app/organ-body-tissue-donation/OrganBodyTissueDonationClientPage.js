'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import ReactCountryFlag from 'react-country-flag';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { EU_COUNTRIES } from '@/data/constants';
import { FaExternalLinkAlt, FaInfoCircle } from 'react-icons/fa';

// Helper function to parse comma-separated strings from URL params
const parseUrlList = (param) => (param ? param.split(',') : []);

// A new component for our guided list layout
import ResourceListItem from '@/components/ResourceListItem';

export default function OrganBodyTissueDonationClientPage({ resources, totalResourcesCount }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [isMounted, setIsMounted] = useState(false);
    const [filters, setFilters] = useState({ countries: [] });

    const activeCountries = useMemo(() => filters.countries.map(c => c.value), [filters.countries]);

    const countryOptions = useMemo(() => {
        const countryMap = new Map();
        resources.forEach((resource) => {
            if (resource.countries && resource.countryCodes) {
                resource.countries.forEach((countryName, index) => {
                    const countryCode = resource.countryCodes[index];
                    if (!countryMap.has(countryName)) {
                        countryMap.set(countryName, {
                            value: countryName,
                            label: countryName,
                            code: countryCode,
                        });
                    }
                });
            }
        });
        countryMap.delete('Worldwide');
        return Array.from(countryMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [resources]);

    useEffect(() => {
        const savedCountries = parseUrlList(searchParams.get('countries'));
        const initialCountries = countryOptions.filter(opt => savedCountries.includes(opt.value));
        setFilters({ countries: initialCountries });
        setIsMounted(true);
    }, [countryOptions, searchParams]);

    useEffect(() => {
        if (!isMounted) return;
        const params = new URLSearchParams(searchParams.toString());
        if (filters.countries.length > 0) {
            const countryValues = filters.countries.map(c => c.value).sort();
            params.set('countries', countryValues.join(','));
        } else {
            params.delete('countries');
        }

        const queryString = params.toString();
        const currentQuery = searchParams.toString();
        if (queryString !== currentQuery) {
            router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
        }
    }, [filters, isMounted, pathname, router, searchParams]);

    const handleCountryTagClick = (countryName) => {
        const selectedOption = countryOptions.find(opt => opt.value === countryName);
        if (!selectedOption) return;

        const isAlreadySelected = filters.countries.some(c => c.value === countryName);

        setFilters(prev => ({
            countries: isAlreadySelected
                ? prev.countries.filter(c => c.value !== countryName)
                : [...prev.countries, selectedOption]
        }));
    };

    const { programsByCountry } = useMemo(() => {
        if (!isMounted) {
            return { programsByCountry: new Map() };
        }

        const selectedCountryValues = new Set(filters.countries.map(c => c.value));
        const isEuRelevant = filters.countries.some(c => EU_COUNTRIES.includes(c.value));
        if (isEuRelevant) {
            selectedCountryValues.add('European Union');
        }

        const programsByCountry = new Map();

        selectedCountryValues.forEach((countryValue) => {
            const countryOption = countryOptions.find(c => c.value === countryValue);
            if (!countryOption) return;

            const countryPrograms = resources.filter(resource =>
                resource.countries && resource.countries.includes(countryValue)
            );
            if (countryPrograms.length > 0) {
                programsByCountry.set(countryOption.label, countryPrograms);
            }
        });

        return { programsByCountry };
    }, [filters.countries, isMounted, countryOptions, resources]);

    const showPrograms = programsByCountry.size > 0;

    return (
        <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg p-4 mb-8 text-center shadow-sm">
                <p className="text-sm md:text-base">
                    This page lists resources specifically for organ, body, and tissue donation.
                    <Link href="/" className="text-blue-600 hover:underline font-semibold ml-1">
                        View all {totalResourcesCount} resources for contributing to science.
                    </Link>
                </p>
            </div>

            <h1 className="text-3xl font-bold text-google-text mb-2">Find Organ, Body, & Tissue Donation Programs</h1>
            <p className="text-base text-google-text-secondary max-w-4xl mb-6">
                Organ, body, and tissue donation is a profound gift that contributes to medical education, surgical training, and scientific research, helping to advance healthcare for future generations. The programs listed below facilitate the donation of bodies, organs, or tissues for science.
            </p>

            <div className="my-8 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Filter by Location</h2>
                <p className="text-sm text-gray-600 mb-4">Select one or more countries to view available local donation programs.</p>
                <div className="flex flex-wrap gap-3 items-center">
                    {countryOptions.map((option) => {
                        const isSelected = filters.countries.some(c => c.value === option.value);
                        return (
                            <button
                                key={option.value}
                                onClick={() => handleCountryTagClick(option.value)}
                                className={`flex items-center px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSelected
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                    }`}
                            >
                                {option.code && option.code !== 'EU' && <ReactCountryFlag countryCode={option.code} svg className="mr-2" alt={`Flag of ${option.label}`} />}
                                {option.code === 'EU' && <span className="mr-2 text-lg">🇪🇺</span>}
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {filters.countries.length === 0 && (
                <div className="text-center p-10 mt-8 border-2 border-dashed rounded-lg bg-gray-50">
                    <h3 className="text-xl font-semibold text-gray-700">Please Select a Location</h3>
                    <p className="mt-2 text-gray-500">To get started, choose a country from the filter options above to see available body donation programs.</p>
                </div>
            )}

            {filters.countries.length > 0 && !showPrograms ? (
                <div className="text-center p-10 mt-8 border-2 border-dashed rounded-lg bg-gray-50">
                    <h3 className="text-xl font-semibold text-gray-700">No Matching Programs Found</h3>
                    <p className="mt-2 text-gray-500">There are no programs listed for the selected country or region.</p>
                </div>
            ) : (
                <div id="donation-programs" className="mt-12">
                    {showPrograms && (
                        <>
                            <h2 className="text-2xl font-bold text-google-text mb-4">Organ, Body, and Tissue Donation Programs</h2>
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-8 text-sm flex items-start">
                                <FaInfoCircle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Important Information</h3>
                                    <p>
                                        The process for body donation often requires pre-registration, sometimes long in advance. Each program has specific procedures, acceptance criteria, and geographic limitations. We strongly recommend visiting the websites of the programs listed below to understand their requirements.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {Array.from(programsByCountry.entries()).map(([countryLabel, countryResources]) => (
                        <div key={countryLabel} className="mb-8">
                            <h3 className="text-xl font-semibold text-google-text-secondary mb-1">
                                {countryLabel}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                {`These programs are specific to ${countryLabel}.`}
                            </p>
                            {countryResources.map(resource => <ResourceListItem key={resource.id} resource={resource} onCountryTagClick={handleCountryTagClick} activeCountries={activeCountries} />)}
                        </div>
                    ))}
                </div>
            )}

            <p className="mt-12 text-sm text-center text-gray-500">
                <b>Disclaimer:</b> This website provides a list of resources and does not provide legal or medical advice. Please consult with program coordinators and your family to make informed decisions about body donation.
            </p>
        </div>
    );
} 