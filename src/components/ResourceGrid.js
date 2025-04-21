// RENAME this file from ResourceTable.js to ResourceGrid.js
// This component now ONLY displays the resources passed to it.
'use client';

import React from 'react';
import Link from 'next/link';
import CountryFlag from 'react-country-flag';
import { FaHeart, FaDollarSign, FaExternalLinkAlt } from 'react-icons/fa';

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

// New TagButton component for reusability
function TagButton({ label, filterKey, value, isActive, onClick, children }) {
  const baseClasses = "tag flex items-center cursor-pointer transition-colors duration-150 ease-in-out px-2 py-0.5 rounded-md text-xs mr-1 mb-1";
  const activeClasses = "bg-blue-100 text-blue-700 hover:bg-blue-200";
  const inactiveClasses = "bg-gray-200 text-google-text-secondary hover:bg-gray-300";

  // The onClick prop passed to TagButton IS the specific handler from page.js
  // (e.g., handleCheckboxChange or handlePaymentCheckboxChange).
  // We need to call it with the arguments IT expects.

  const handleClick = () => {
    // Check which handler this TagButton is supposed to use based on filterKey
    if (filterKey === 'paymentTypes') {
      // If it's for payment, the onClick prop is handlePaymentCheckboxChange.
      // It expects (optionObject, isChecked).
      // In this case, the 'value' prop IS the paymentOption object.
      onClick(value, !isActive);
    } else {
      // Otherwise, the onClick prop is handleCheckboxChange.
      // It expects (filterKeyString, valueString, isChecked).
      // In this case, the 'value' prop IS the string (dataType or country).
      onClick(filterKey, value, !isActive);
    }
  };

  return (
    <button
      onClick={handleClick} // Use the intermediate handler to pass correct args
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
  paymentTypesOptions
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

          return (
            <div key={resource.id} className="resource-card">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-2">
                 <h3 className="text-base font-medium text-google-text flex-grow mr-2">{resource.title}</h3>
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

              {/* Description */}
              <p className="text-sm text-google-text-secondary mb-3 flex-grow">
                {resource.description || `Learn more about contributing ${resource.dataTypes?.join(', ') || 'data'} via ${resource.title}.`}
              </p>

              {/* Tags */}
              <div className="tags flex flex-wrap items-center mt-auto pt-2">
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

              {/* Action Link */}
              {resource.link ? (
                 <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-link"
                  >
                    Learn more <FaExternalLinkAlt className="inline ml-1 h-3 w-3" />
                 </a>
              ) : resource.instructions ? (
                 <Link href={`/resource/${resource.id}`} className="action-link">
                    View Instructions
                 </Link>
              ) : (
                 <Link href={`/resource/${resource.id}`} className="action-link">
                    Details
                 </Link>
              )}
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
