import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { EU_COUNTRIES } from '@/data/constants';

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
            {(resource.organization || (resource.organizations && resource.organizations.length > 0)) && (
                <p className="text-sm text-gray-500 mb-2">{resource.organization || resource.organizations.map(o => o.name).join(', ')}</p>
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
                                    className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isActive
                                        ? 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-300'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                >
                                    {resource.countryCodes[index] && resource.countryCodes[index] !== 'EU' && (
                                        <ReactCountryFlag countryCode={resource.countryCodes[index]} svg className="mr-1.5" alt={`Flag of ${country}`} />
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

export default ResourceListItem;
