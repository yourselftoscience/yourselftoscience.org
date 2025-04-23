// RENAME this file from ResourceTable.js to ResourceGrid.js
// This component now ONLY displays the resources passed to it.
'use client';

import React from 'react';
import Link from 'next/link';
import CountryFlag from 'react-country-flag';
import { FaHeart, FaDollarSign, FaExternalLinkAlt, FaBook } from 'react-icons/fa';
import { Popover, Transition } from '@headlessui/react'; // Import Popover
import { Fragment } from 'react'; // Import Fragment for Transition

// Helper to get payment emoji/icon
const getPaymentInfo = (paymentType) => {
  const type = paymentType || 'donation';
  switch(type) {
    case 'donation': return { emoji: '❤️', label: 'Donation', value: 'donation' };
    case 'payment': return { emoji: '💵', label: 'Payment', value: 'payment' };
    case 'mixed': return { emoji: '❤️💵', label: 'Mixed Compensation', value: 'mixed' };
    default: return { emoji: '❤️', label: 'Donation', value: 'donation' };
  }
};

// Helper function to get citation key
function getCitationKey(citation) {
  if (citation && citation.link) {
    return citation.link.trim();
  }
  if (citation && citation.title) {
    return citation.title.trim().toLowerCase().substring(0, 50);
  }
  return null;
}

// New TagButton component for reusability
function TagButton({ label, filterKey, value, isActive, onClick, children }) {
  const baseClasses = "tag flex items-center cursor-pointer transition-colors duration-150 ease-in-out px-2 py-0.5 rounded-md text-xs mr-1 mb-1";
  const activeClasses = "bg-blue-100 text-blue-700 hover:bg-blue-200";
  const inactiveClasses = "bg-gray-200 text-google-text-secondary hover:bg-gray-300";

  const handleClick = () => {
    if (filterKey === 'paymentTypes') {
      onClick(value, !isActive);
    } else {
      onClick(filterKey, value, !isActive);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-pressed={isActive}
      title={`Filter by ${label}`}
    >
      {children}
    </button>
  );
}

export default function ResourceGrid({
  resources,
  filters,
  onFilterChange,
  onPaymentFilterChange,
  paymentTypesOptions,
  citationMap // Accept citationMap again
}) {

  if (!resources) {
    return <div className="text-center text-gray-500 py-10">Loading resources...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.length > 0 ? (
        resources.map((resource) => {
          const paymentInfo = getPaymentInfo(resource.paymentType);
          const paymentOption = paymentTypesOptions?.find(p => p.value === paymentInfo.value);
          const hasCitations = resource.citations && resource.citations.length > 0;

          return (
            <div key={resource.id} className="resource-card flex flex-col relative">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-2">
                 <h3 className="text-base font-medium text-google-text flex-grow mr-2">{resource.title}</h3>
                 {/* Payment Icon Container */}
                 <div className="flex items-center flex-shrink-0">
                   {paymentOption && (
                      <TagButton
                        label={paymentInfo.label}
                        filterKey="paymentTypes"
                        value={paymentOption}
                        isActive={filters.paymentTypes.some(p => p.value === paymentInfo.value)}
                        onClick={onPaymentFilterChange}
                      >
                         <span title={paymentInfo.label} className="text-lg flex-shrink-0">{paymentInfo.emoji}</span>
                      </TagButton>
                   )}
                 </div>
              </div>

              {/* Description */}
              <p className="text-sm text-google-text-secondary mb-3">
                {resource.description || `Learn more about contributing ${resource.dataTypes?.join(', ') || 'data'} via ${resource.title}.`}
              </p>

              {/* Tags */}
              <div className="tags flex flex-wrap items-center mt-auto pt-2 flex-grow">
                {resource.dataTypes?.map((type) => (
                  <TagButton
                    key={type}
                    label={type}
                    filterKey="dataTypes"
                    value={type}
                    isActive={filters.dataTypes.includes(type)}
                    onClick={onFilterChange}
                  >
                    {type}
                  </TagButton>
                ))}
                {resource.countries?.map((country, idx) => {
                  const code = resource.countryCodes?.[idx];
                  const isEU = country === 'European Union';
                  const isActive = filters.countries.includes(country) || (isEU && filters.countries.some(c => EU_COUNTRIES.includes(c)));

                  return (
                    <TagButton
                      key={country}
                      label={country}
                      filterKey="countries"
                      value={country}
                      isActive={isActive}
                      onClick={onFilterChange}
                    >
                      {country}
                      {code && <CountryFlag countryCode={code} svg style={{ width: '1em', height: '0.8em', marginLeft: '4px' }} />}
                    </TagButton>
                  );
                })}
              </div>

              {/* Footer container for Action Link and Citation Icon */}
              <div className="flex justify-between items-end mt-3">
                {/* Action Link */}
                <div>
                  {resource.link ? (
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-link"
                    >
                      Learn more <FaExternalLinkAlt className="inline ml-1 h-3 w-3" />
                    </a>
                  ) : (
                    <Link href={`/resource/${resource.id}`} className="action-link">
                      {resource.instructions ? 'View Instructions' : 'Details'}
                    </Link>
                  )}
                </div>

                {/* Conditionally render citation icon wrapped in Popover */}
                {hasCitations && citationMap && (
                  <Popover className="relative">
                    {({ open }) => (
                      <>
                        <Popover.Button
                          className={`
                            ${open ? 'text-google-blue' : 'text-google-text-secondary'}
                            hover:text-google-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75`}
                          title={`View ${resource.citations.length} reference${resource.citations.length !== 1 ? 's' : ''}`}
                          aria-label={`View ${resource.citations.length} reference${resource.citations.length !== 1 ? 's' : ''}`}
                        >
                          <FaBook className="text-sm" />
                        </Popover.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel className="absolute z-10 bottom-full right-0 mb-2 w-72 max-h-60 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="p-3 space-y-2">
                              <h4 className="text-xs font-medium text-google-text uppercase border-b pb-1 mb-1">References</h4>
                              <ol className="list-decimal list-inside space-y-1.5">
                                {resource.citations.map((citation, idx) => {
                                  const key = getCitationKey(citation); // Use the helper function for lookup
                                  const refIndex = key ? citationMap[key] : undefined; // Get index from map (0-based)
                                  const refNumber = typeof refIndex === 'number' ? refIndex + 1 : null; // Convert to 1-based

                                  return (
                                    <li key={idx} className="text-xs text-google-text-secondary leading-snug">
                                      {citation.link ? (
                                        <a href={citation.link} target="_blank" rel="noopener noreferrer" className="text-google-blue hover:underline break-words">
                                          {citation.title}
                                        </a>
                                      ) : (
                                        <span className="break-words">{citation.title}</span>
                                      )}
                                      {refNumber && ( // Add link to main reference list if index found
                                        <a href={`#ref-${refNumber}`} title={`Go to main reference ${refNumber}`} className="ml-1 text-google-blue hover:underline font-medium">[Ref&nbsp;{refNumber}]</a>
                                      )}
                                    </li>
                                  );
                                })}
                              </ol>
                            </div>
                          </Popover.Panel>
                        </Transition>
                      </>
                    )}
                  </Popover>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center text-gray-500 py-10">
          No resources found matching your filters.
        </div>
      )}
    </div>
  );
}

const EU_COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden'
];
