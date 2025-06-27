'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Select, { components } from 'react-select';
import ReactCountryFlag from 'react-country-flag';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { resources as allResources, EU_COUNTRIES } from '@/data/resources';
import { FaExternalLinkAlt } from 'react-icons/fa';

// Filter resources to only include clinical trials
const clinicalTrialResources = allResources
    .filter(resource => resource.dataTypes.includes('Clinical trials'))
    .sort((a, b) => a.title.localeCompare(b.title));

// Component for custom select option display
const CountryOption = (props) => (
    <components.Option {...props}>
        <div className="flex items-center">
            {props.data.code && props.data.code !== 'EU' && <ReactCountryFlag countryCode={props.data.code} svg className="mr-2" />}
            {props.data.code === 'EU' && <span className="mr-2">🇪🇺</span>}
            <div className="flex flex-col">
                <span>{props.label}</span>
                {props.data.description && (
                    <span className="text-xs text-gray-500">{props.data.description}</span>
                )}
            </div>
        </div>
    </components.Option>
);

// Component for custom single-select value display
const CountrySingleValue = ({ children, ...props }) => (
  <components.SingleValue {...props}>
    <div className="flex items-center">
      {props.data.code && props.data.code !== 'EU' && <ReactCountryFlag countryCode={props.data.code} svg className="mr-2" />}
      {props.data.code === 'EU' && <span className="mr-2">🇪🇺</span>}
      <span>{children}</span>
    </div>
  </components.SingleValue>
);

// Component for custom multi-select value display
const MultiValueLabel = (props) => {
  return (
    <components.MultiValueLabel {...props}>
     <div className="flex items-center">
       {props.data.code && props.data.code !== 'EU' && <ReactCountryFlag countryCode={props.data.code} svg className="mr-2" />}
       {props.data.code === 'EU' && <span className="mr-2">🇪🇺</span>}
       <span>{props.data.label}</span>
     </div>
    </components.MultiValueLabel>
  );
};

// A new component for our guided list layout
const ResourceListItem = ({ resource, onCountryTagClick, activeCountries }) => {
    
    const isCountryActive = (countryName) => {
        // Handle the special case for EU countries
        const isEuCountry = EU_COUNTRIES.includes(countryName);
        const isEuFilterActive = activeCountries.includes('European Union');
        if (isEuCountry && isEuFilterActive) return true;

        return activeCountries.includes(countryName);
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 p-6 transition-shadow hover:shadow-md">
            <h3 className="text-xl font-bold text-google-text">
                {resource.title}
            </h3>
            {resource.organization && (
                <p className="text-sm text-gray-500 mb-2">{resource.organization}</p>
            )}
            {resource.description && (
                <p className="text-gray-700 text-base mb-4">
                    {resource.description}
                </p>
            )}
            <div className="flex justify-between items-center flex-wrap gap-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                     {(!resource.countries || resource.countries.length === 0) ? (
                        <span className="inline-flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                            🌍 Worldwide
                        </span>
                    ) : (
                        resource.countries.map((country, index) => {
                            const isActive = isCountryActive(country);
                            return (
                                <button
                                    key={country}
                                    onClick={() => onCountryTagClick(country)}
                                    className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isActive 
                                            ? 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-300' 
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                >
                                    {resource.countryCodes[index] && resource.countryCodes[index] !== 'EU' && (
                                        <ReactCountryFlag countryCode={resource.countryCodes[index]} svg className="mr-1.5" />
                                    )}
                                    {resource.countryCodes[index] === 'EU' && <span className="mr-1.5">🇪🇺</span>}
                                    {country}
                                </button>
                            );
                        })
                    )}
                </div>
                <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    Visit Website <FaExternalLinkAlt className="ml-2" />
                </a>
            </div>
        </div>
    );
};

export default function ClinicalTrialsClientPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [isMounted, setIsMounted] = useState(false);
    const [filters, setFilters] = useState({ countries: [], dataTypes: [], compensationTypes: [] });

    const countryOptions = useMemo(() => {
        const countryMap = new Map();
        clinicalTrialResources.forEach((resource) => {
            if (resource.countries && resource.countryCodes) {
                resource.countries.forEach((countryName, index) => {
                    const countryCode = resource.countryCodes[index];
                    if (!countryMap.has(countryName)) {
                        const option = {
                            value: countryName,
                            label: countryName,
                            code: countryCode,
                        };
                        if (countryName === 'European Union') {
                            option.description = 'Includes trials available EU-wide';
                        }
                        countryMap.set(countryName, option);
                    }
                });
            }
        });

        countryMap.delete('Worldwide');

        return Array.from(countryMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, []);

    useEffect(() => {
        const parseUrlList = (param) => param ? param.split(',') : [];
        const savedCountries = parseUrlList(searchParams.get('countries'));
        const initialCountries = countryOptions.filter(opt => savedCountries.includes(opt.value));
        setFilters(prev => ({ ...prev, countries: initialCountries }));
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
        // Prevent unnecessary push, only update if query string changes
        const currentQuery = searchParams.toString();
        if (queryString !== currentQuery) {
            router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
        }

    }, [filters, isMounted, pathname, router, searchParams]);

    const handleCountryChange = (selectedOptions) => {
        setFilters(prev => ({ ...prev, countries: selectedOptions || [] }));
    };

    const handleCountryTagClick = (countryName) => {
        const selectedOption = countryOptions.find(opt => opt.value === countryName);
        if (!selectedOption) return;

        const isAlreadySelected = filters.countries.some(c => c.value === countryName);

        if (isAlreadySelected) {
            // Remove the country from the filter
            setFilters(prev => ({ 
                ...prev, 
                countries: prev.countries.filter(c => c.value !== countryName) 
            }));
        } else {
            // Add the country to the filter
            setFilters(prev => ({ ...prev, countries: [...prev.countries, selectedOption] }));
        }
    };

    const {
        registriesByCountry,
        directOpsByCountry,
        worldwideRegistries,
        worldwideDirectOpportunities,
        activeDisplayGroups,
    } = useMemo(() => {
        if (!isMounted) {
            return {
                registriesByCountry: new Map(),
                directOpsByCountry: new Map(),
                worldwideRegistries: [],
                worldwideDirectOpportunities: [],
                activeDisplayGroups: new Set(),
            };
        }

        const selectedCountryValues = filters.countries.map(c => c.value);
        const displayGroupValues = new Set(selectedCountryValues);
        const isEuRelevant = selectedCountryValues.some(c => EU_COUNTRIES.includes(c));
        if (isEuRelevant) {
            displayGroupValues.add('European Union');
        }

        const allRegistries = clinicalTrialResources.filter(r => r.resourceType === 'registry' || r.resourceType === 'database');
        const allDirectOps = clinicalTrialResources.filter(r => !['registry', 'database'].includes(r.resourceType));

        const worldwideRegistries = allRegistries.filter(r => !r.countries || r.countries.length === 0);
        const worldwideDirectOpportunities = allDirectOps.filter(r => !r.countries || r.countries.length === 0);
        
        const registriesByCountry = new Map();
        const directOpsByCountry = new Map();

        displayGroupValues.forEach((groupValue) => {
            const countryOption = countryOptions.find(c => c.value === groupValue);
            if (!countryOption) return; // Skip if the country isn't in our list of options
            
            const countryLabel = countryOption.label;

            const specificRegistries = allRegistries.filter(resource => 
                resource.countries && resource.countries.includes(groupValue)
            );
            if (specificRegistries.length > 0) {
                registriesByCountry.set(countryLabel, specificRegistries);
            }

            const specificDirectOps = allDirectOps.filter(resource =>
                 resource.countries && resource.countries.includes(groupValue)
            );
            if (specificDirectOps.length > 0) {
                directOpsByCountry.set(countryLabel, specificDirectOps);
            }
        });

        return {
            registriesByCountry,
            directOpsByCountry,
            worldwideRegistries,
            worldwideDirectOpportunities,
            activeDisplayGroups: displayGroupValues,
        };
    }, [filters.countries, isMounted, countryOptions]);

    const showRegistries = registriesByCountry.size > 0 || worldwideRegistries.length > 0;
    const showDirectOpportunities = directOpsByCountry.size > 0 || worldwideDirectOpportunities.length > 0;

    return (
        <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg p-4 mb-8 text-center shadow-sm">
                <p className="text-sm md:text-base">
                    This page lists resources specifically for clinical trials.
                    <Link href="/" className="text-blue-600 hover:underline font-semibold ml-1">
                        View all {allResources.length} resources for contributing to science.
                    </Link>
                </p>
            </div>

            <h1 className="text-3xl font-bold text-google-text mb-2">Find Clinical Trials</h1>
            <p className="text-base text-google-text-secondary max-w-4xl mb-6">
                Clinical trials are research studies that test how well new medical approaches work in people. Use the resources below to find a study that might be right for you. Contributing to a clinical trial is a powerful way to participate in scientific discovery.
            </p>

            <div className="my-8">
                <label htmlFor="country-filter" className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by country to see local results in addition to worldwide resources
                </label>
                <Select
                    id="country-filter"
                    isMulti
                    options={countryOptions}
                    value={filters.countries}
                    onChange={handleCountryChange}
                    placeholder={`Filter from ${countryOptions.length} available countries...`}
                    classNamePrefix="react-select"
                    components={{ Option: CountryOption, MultiValueLabel }}
                />
            </div>
            
            {!showRegistries && !showDirectOpportunities ? (
                 <div className="text-center p-10 mt-8 border-2 border-dashed rounded-lg bg-gray-50">
                    <h3 className="text-xl font-semibold text-gray-700">No Matching Resources Found</h3>
                    <p className="mt-2 text-gray-500">There are no country-specific or worldwide resources matching your selection.</p>
                 </div>
            ) : (
                <>
                    {showRegistries && (
                        <div id="registries" className="mt-12">
                            <h2 className="text-2xl font-bold text-google-text mb-4">Clinical Trial Registries (Search Engines)</h2>
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-8 text-sm">
                                <h3 className="font-semibold text-base mb-2">How to Use These Resources</h3>
                                <p className="mb-2">
                                    The resources listed below are registries or platforms that act as search engines for clinical trials. They do not host the trials themselves. To find a study that might be right for you, visit their websites and use their search features.
                                </p>
                                <p className="font-semibold">Common search strategies include:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Searching for a specific disease or condition (e.g., &quot;diabetes&quot;, &quot;migraine&quot;, &quot;alzheimer&apos;s&quot;).</li>
                                    <li>Using the term &quot;healthy volunteer&quot; if you do not have a specific condition.</li>
                                    <li>Filtering by your country or city to find local trials.</li>
                                </ul>
                            </div>
                            
                            {Array.from(registriesByCountry.entries()).map(([countryLabel, resources]) => (
                                <div key={countryLabel} className="mb-8">
                                    <h3 className="text-xl font-semibold text-google-text-secondary mb-1">
                                        {countryLabel}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {countryLabel === 'European Union'
                                            ? 'These registries list trials conducted across the European Union.'
                                            : `These registries list trials specific to ${countryLabel}.`
                                        }
                                    </p>
                                    {resources.map(resource => <ResourceListItem key={resource.id} resource={resource} onCountryTagClick={handleCountryTagClick} activeCountries={Array.from(activeDisplayGroups)} />)}
                                </div>
                            ))}

                            {worldwideRegistries.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-google-text-secondary mb-4">Worldwide</h3>
                                    {worldwideRegistries.map(resource => <ResourceListItem key={resource.id} resource={resource} onCountryTagClick={handleCountryTagClick} activeCountries={Array.from(activeDisplayGroups)} />)}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {showDirectOpportunities && (
                        <div id="direct-opportunities" className="mt-12">
                            <h2 className="text-2xl font-bold text-google-text mb-4">Direct Research Opportunities</h2>
                            <p className="text-base text-google-text-secondary max-w-4xl mb-6">
                                These organizations recruit volunteers directly for specific research studies. Visit their websites to see if you are eligible to participate.
                            </p>
                            
                            {Array.from(directOpsByCountry.entries()).map(([countryLabel, resources]) => (
                                <div key={countryLabel} className="mb-8">
                                     <h3 className="text-xl font-semibold text-google-text-secondary mb-1">
                                        {countryLabel}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {countryLabel === 'European Union'
                                            ? 'These opportunities are available across the European Union.'
                                            : `These opportunities are specific to ${countryLabel}.`
                                        }
                                    </p>
                                    {resources.map(resource => <ResourceListItem key={resource.id} resource={resource} onCountryTagClick={handleCountryTagClick} activeCountries={Array.from(activeDisplayGroups)} />)}
                                </div>
                            ))}

                            {worldwideDirectOpportunities.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-google-text-secondary mb-4">Worldwide</h3>
                                    {worldwideDirectOpportunities.map(resource => <ResourceListItem key={resource.id} resource={resource} onCountryTagClick={handleCountryTagClick} activeCountries={Array.from(activeDisplayGroups)} />)}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
            
            <p className="mt-12 text-sm text-center text-gray-500">
                <b>Disclaimer:</b> This website provides a list of resources and does not offer medical advice or recommend any specific trial. Please consult with a healthcare professional before making any decisions about your health or participation in a clinical trial.
            </p>
        </div>
    );
} 