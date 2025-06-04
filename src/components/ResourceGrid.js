// RENAME this file from ResourceTable.js to ResourceGrid.js
// This component now ONLY displays the resources passed to it.
'use client';

import React, { useState } from 'react'; // Import useState
import Link from 'next/link';
import CountryFlag from 'react-country-flag';
// Import instruction icons
import { FaHeart, FaDollarSign, FaExternalLinkAlt, FaBook, FaMobileAlt, FaCog, FaUserShield, FaArrowRight, FaListOl } from 'react-icons/fa';
import { Popover, Transition } from '@headlessui/react'; // Import Popover
import { Fragment } from 'react'; // Import Fragment for Transition
import { EU_COUNTRIES } from '@/data/resources'; // Import EU_COUNTRIES

// Helper to get payment emoji/icon
const getPaymentInfo = (compensationType) => {
  const type = compensationType || 'donation';
  switch(type) {
    case 'donation': return { emoji: '❤️', label: 'Donation', value: 'donation' };
    case 'payment': return { emoji: '💵', label: 'Payment', value: 'payment' };
    case 'mixed': return { emoji: '❤️💵', label: 'Mixed', value: 'mixed' };
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

// --- Moved Helper function to get icons for instruction steps ---
const getStepIcon = (step) => {
  const lowerStep = step.toLowerCase();
  if (lowerStep.includes('fitbit app') || lowerStep.includes('open the app'))
    return <FaMobileAlt className="text-blue-500" title="Mobile App Step"/>;
  if (lowerStep.includes('settings'))
    return <FaCog className="text-gray-600" title="Settings Step"/>;
  if (lowerStep.includes('privacy'))
    return <FaUserShield className="text-green-500" title="Privacy Step"/>;
  if (lowerStep.includes('tap') || lowerStep.includes('select') || lowerStep.includes('go to'))
    return <FaArrowRight className="text-yellow-500" title="Action Step"/>;
  return <FaArrowRight className="text-gray-500" title="Step"/>; // Default icon
};
// --- End Moved Helper ---

// TagButton now needs access to the main filters state and compensation options
function TagButton({
  label,
  filterKey,
  value, // For compensation, this is the option object; for others, it's the string value
  onClick, // This is either onPaymentFilterChange or onFilterChange
  // Props passed down from ResourceGrid:
  filters,
  compensationTypesOptions,
  children // <-- Add children to props destructuring
}) {
  const baseClasses = "tag flex items-center cursor-pointer transition-colors duration-150 ease-in-out px-2.5 py-1 rounded-full text-sm font-medium";
  const activeClasses = "bg-blue-100 text-blue-700 hover:bg-blue-200";
  const inactiveClasses = "bg-gray-200 text-google-text-secondary hover:bg-gray-300";

  // --- START: Hover state for mixed button emojis ---
  // Remove TypeScript type annotation from useState
  const [hoveringEmoji, setHoveringEmoji] = useState(null);
  // --- END: Hover state ---

  // Determine isActive based on filterKey
  let isActive;
  if (filterKey === 'compensationTypes') {
    isActive = filters.compensationTypes.some(p => p.value === value.value);
  } else if (filterKey === 'countries') {
    const isEU = value === 'European Union';
    isActive = filters.countries.includes(value) || (isEU && filters.countries.some(c => EU_COUNTRIES.includes(c)));
  } else { // dataTypes
    isActive = filters.dataTypes.includes(value);
  }

  const donationOption = filterKey === 'compensationTypes' ? compensationTypesOptions.find(o => o.value === 'donation') : null;
  const paymentOption = filterKey === 'compensationTypes' ? compensationTypesOptions.find(o => o.value === 'payment') : null;

  const handleClick = (e, specificOption = null) => {
    e.stopPropagation();
    const targetOption = specificOption || value;
    let shouldBeActive;
    if (filterKey === 'compensationTypes') {
      let currentPartIsActive;
      if (specificOption?.value === 'donation') {
        currentPartIsActive = filters.compensationTypes.some(p => p.value === 'donation');
      } else if (specificOption?.value === 'payment') {
        currentPartIsActive = filters.compensationTypes.some(p => p.value === 'payment');
      } else {
        currentPartIsActive = filters.compensationTypes.some(p => p.value === targetOption.value);
      }
      shouldBeActive = !currentPartIsActive;
      onClick(targetOption, shouldBeActive);
    } else {
      const currentPartIsActive = filters[filterKey].includes(targetOption);
      shouldBeActive = !currentPartIsActive;
      onClick(filterKey, targetOption, shouldBeActive);
    }
  };

  // Special rendering for Mixed compensation type
  if (filterKey === 'compensationTypes' && value.value === 'mixed') {
    const isDonationActive = filters.compensationTypes.some(p => p.value === 'donation');
    const isPaymentActive = filters.compensationTypes.some(p => p.value === 'payment');
    const isMixedItselfActive = filters.compensationTypes.some(p => p.value === 'mixed');
    const noFiltersActive = !isDonationActive && !isPaymentActive;

    // --- START: Dimming logic based on state and hover ---
    const shouldDimHeart = (isPaymentActive && !isDonationActive) || (noFiltersActive && hoveringEmoji === 'dollar');
    const shouldDimDollar = (isDonationActive && !isPaymentActive) || (noFiltersActive && hoveringEmoji === 'heart');
    // --- END: Dimming logic ---

    return (
      <div
        className={`${baseClasses} ${isMixedItselfActive ? activeClasses : inactiveClasses} items-center`}
        aria-label={`Filter by ${label}`}
      >
        <span
          onClick={(e) => handleClick(e, donationOption)}
          onMouseEnter={() => setHoveringEmoji('heart')}
          onMouseLeave={() => setHoveringEmoji(null)}
          // Apply dimming based on the new logic
          className={`cursor-pointer text-lg transition-all duration-150 hover:scale-110 ${shouldDimHeart ? 'opacity-50' : 'opacity-100'}`}
          title={`Filter by Donation ${isDonationActive ? '(active)' : ''}`}
          role="button"
          aria-pressed={isDonationActive}
        >
          ❤️
        </span>
        <span
          onClick={(e) => handleClick(e, paymentOption)}
          onMouseEnter={() => setHoveringEmoji('dollar')}
          onMouseLeave={() => setHoveringEmoji(null)}
          // Apply dimming based on the new logic
          className={`cursor-pointer text-lg ml-0.5 transition-all duration-150 hover:scale-110 ${shouldDimDollar ? 'opacity-50' : 'opacity-100'}`}
          title={`Filter by Payment ${isPaymentActive ? '(active)' : ''}`}
          role="button"
          aria-pressed={isPaymentActive}
        >
          💵
        </span>
      </div>
    );
  }

  // Default rendering for other tags or non-mixed compensation
  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-pressed={isActive}
      title={`Filter by ${label}`}
    >
      {/* Render children passed to the component - Ensure single emojis also have text-lg if needed */}
      {/* Check where the single emoji span is rendered - it's passed as children */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === 'span') {
          // Add text-lg to the span if it's the emoji
          // This assumes the child structure is consistent
          return React.cloneElement(child, { className: `${child.props.className || ''} text-lg` });
        }
        return child;
      })}
    </button>
  );
}

export default function ResourceGrid({
  resources,
  filters, // Pass filters down
  onFilterChange,
  onPaymentFilterChange,
  compensationTypesOptions, // Pass options down
  citationMap
}) {

  if (!resources) {
    return <div className="text-center text-gray-500 py-10">Loading resources...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.length > 0 ? (
        resources.map((resource) => {
          const paymentInfo = getPaymentInfo(resource.compensationType);
          const paymentOption = compensationTypesOptions?.find(p => p.value === paymentInfo.value);
          const hasCitations = resource.citations && resource.citations.length > 0;
          const hasInstructionsOnly = resource.instructions && !resource.link;

          return (
            <div key={resource.id} className="resource-card flex flex-col relative">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-1">
                 <div className="flex-grow mr-2">
                   <h3 className="text-base font-medium text-google-text">
                     {resource.title}
                   </h3>
                   {resource.organization && (
                     <p className="text-base font-medium text-gray-600 -mt-0.5">
                       {resource.organization}
                     </p>
                   )}
                 </div>
                 {/* Payment Icon Container */}
                 <div className="flex items-center flex-shrink-0">
                   {paymentOption && (
                      <TagButton
                        label={paymentInfo.label}
                        filterKey="compensationTypes"
                        value={paymentOption}
                        onClick={onPaymentFilterChange}
                        filters={filters}
                        compensationTypesOptions={compensationTypesOptions}
                      >
                         {/* Pass children ONLY for non-mixed */}
                         {paymentInfo.value !== 'mixed' && (
                            // Ensure this span gets text-lg via the logic in TagButton's return
                            <span title={paymentInfo.label} className="flex-shrink-0">{paymentInfo.emoji}</span>
                         )}
                      </TagButton>
                   )}
                 </div>
              </div>

              {/* Tags */}
              <div className="tags flex flex-wrap items-center gap-1 mt-auto pt-2">
                {/* Countries */}
                {resource.countries?.map((country, idx) => {
                  const code = resource.countryCodes?.[idx];
                  const isEU = country === 'European Union';
                  const isActive = filters.countries.includes(country) || (isEU && filters.countries.some(c => EU_COUNTRIES.includes(c)));

                  return (
                    <TagButton
                      key={country}
                      label={country}
                      filterKey="countries"
                      value={country} // Pass the string value
                      onClick={onFilterChange}
                      filters={filters} // Pass filters
                      compensationTypesOptions={compensationTypesOptions} // Pass for consistency
                    >
                      {country}
                      {code && (
                        <CountryFlag
                          key={code}
                          countryCode={code}
                          svg
                          alt=""                 // ← empty alt for decorative
                          aria-hidden="true"     // ← hide from assistive tech
                          style={{ width: '1em', height: '0.8em', marginLeft: '4px' }}
                        />
                      )}
                    </TagButton>
                  );
                })}
                {/* Data Types */}
                {resource.dataTypes?.map((type) => (
                  <TagButton
                    key={type}
                    label={type}
                    filterKey="dataTypes"
                    value={type} // Pass the string value
                    onClick={onFilterChange}
                    filters={filters} // Pass filters
                    compensationTypesOptions={compensationTypesOptions} // Pass for consistency
                  >
                    {type}
                  </TagButton>
                ))}
              </div>

              {/* Footer container */}
              <div className="flex justify-between items-end mt-3">
                {/* Action Area: Link, Instructions Popover, or Details Link */}
                <div>
                  {resource.link ? ( // Priority 1: External Link
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-link"
                    >
                      Contribute <FaExternalLinkAlt className="inline ml-1 h-3 w-3" />
                    </a>
                  ) : hasInstructionsOnly ? ( // Priority 2: Instructions Popover
                    <Popover className="relative">
                      {({ open }) => (
                        <>
                          <Popover.Button
                            className={`action-link inline-flex items-center ${open ? 'text-google-blue' : 'text-google-blue'}`}
                            title="View Instructions"
                          >
                            View Instructions <FaListOl className="inline ml-1 h-3 w-3" />
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
                            <Popover.Panel className="absolute z-10 bottom-full left-0 mb-2 w-72 max-h-80 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="p-3 space-y-2">
                                <h4 className="text-xs font-medium text-google-text uppercase border-b pb-1 mb-2">Instructions</h4>
                                <ol className="space-y-2.5">
                                  {resource.instructions.map((step, idx) => (
                                    <li key={idx} className="flex items-start text-xs text-google-text-secondary leading-snug">
                                      <span className="mr-1.5 font-medium text-gray-600">{idx + 1}.</span>
                                      <span className="mr-1.5 mt-px flex-shrink-0">{getStepIcon(step)}</span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </Popover.Panel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  ) : ( // Fallback: Link to Details page
                    <Link href={`/resource/${resource.id}`} className="action-link">
                      Details
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
                              <h4 className="text-xs font-medium text-google-text uppercase border-b pb-1 mb-1">
                                Service Cited By
                              </h4>
                              <ol className="list-decimal list-inside space-y-1.5">
                                {resource.citations.map((citation, idx) => {
                                  const key = getCitationKey(citation);
                                  const refIndex = key ? citationMap[key] : undefined;
                                  const refNumber = typeof refIndex === 'number' ? refIndex : null;

                                  return (
                                    <li key={idx} className="text-xs text-google-text-secondary leading-snug">
                                      {citation.link ? (
                                        <a
                                          href={citation.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-google-blue hover:underline break-words"
                                        >
                                          {citation.title}
                                        </a>
                                      ) : (
                                        <span className="break-words">{citation.title}</span>
                                      )}
                                      {refNumber && (
                                        <a
                                          href={`#ref-${refNumber}`}
                                          title={`Go to main reference ${refNumber}`}
                                          className="ml-1 text-google-blue hover:underline font-medium"
                                        >
                                          [Ref&nbsp;{refNumber}]
                                        </a>
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
