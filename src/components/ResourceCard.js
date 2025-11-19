// src/components/ResourceCard.js
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CountryFlag from 'react-country-flag';
import { FaHeart, FaDollarSign, FaExternalLinkAlt, FaBook } from 'react-icons/fa';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EU_COUNTRIES } from '@/data/constants';

const getPaymentInfo = (compensationType) => {
  const type = compensationType || 'donation';
  switch (type) {
    case 'donation': return { icon: <FaHeart className="text-rose-500" title="Donation" />, label: 'Donation', value: 'donation' };
    case 'payment': return { icon: <FaDollarSign className="text-green-500" title="Payment" />, label: 'Payment', value: 'payment' };
    case 'mixed': return { icon: <><FaHeart className="text-rose-500" /><FaDollarSign className="text-green-500 -ml-1" /></>, label: 'Mixed', value: 'mixed' };
    default: return { icon: <FaHeart className="text-rose-500" title="Donation" />, label: 'Donation' };
  }
};

function getCitationKey(citation) {
  if (citation && citation.link) {
    return citation.link.trim();
  }
  if (citation && citation.title) {
    return citation.title.trim().toLowerCase().substring(0, 50);
  }
  return null;
}

function TagButton({ label, isActive, onClick, children }) {
  const baseClasses = "tag flex items-center cursor-pointer transition-colors duration-150 ease-in-out px-2 py-0.5 rounded-md text-xs";
  const activeClasses = "bg-blue-200 text-blue-800 ring-1 ring-blue-400";
  const inactiveClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-pressed={isActive}
      title={`Filter by ${label}`}
    >
      {children}
    </button>
  );
} export default function ResourceCard({
  resource,
  filters,
  onFilterChange,
  onPaymentFilterChange,
  compensationTypesOptions,
  citationMap,
  onWearableFilterToggle,
  onMacroCategoryFilterChange
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveringIcon, setHoveringIcon] = useState(null); // 'donation' | 'payment'
  const paymentInfo = getPaymentInfo(resource.compensationType);
  const hasCitations = resource.citations && resource.citations.length > 0;

  const categoryStyles = {
    'Organ, Body & Tissue Donation': 'bg-rose-100 text-rose-800',
    'Biological Samples': 'bg-blue-100 text-blue-800',
    'Clinical Trials': 'bg-green-100 text-green-800',
    'Health & Digital Data': 'bg-yellow-100 text-yellow-800',
  };

  const toggleExpansion = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const descriptionNeedsClamping = resource.description && resource.description.length > 150;

  return (
    <div className="resource-card flex flex-col relative">
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div className="flex-grow pr-2">
            {resource.macroCategories && resource.macroCategories.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {resource.macroCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => onMacroCategoryFilterChange && onMacroCategoryFilterChange(category)}
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${categoryStyles[category] || 'bg-gray-100 text-gray-800'} transition-opacity hover:opacity-80`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            <h2 className="text-lg font-semibold text-google-text mt-1">
              {resource.title}
            </h2>
          </div>

          <div className="flex-shrink-0 flex items-center gap-1 text-lg">
            {(() => {
              const compensationType = resource.compensationType || 'donation';
              const option = compensationTypesOptions.find(p => p.value === compensationType);
              if (!option) return <div title={`Compensation: ${getPaymentInfo(compensationType).label}`}>{getPaymentInfo(compensationType).icon}</div>;

              const anyCompFilterActive = filters.compensationTypes.length > 0;

              if (compensationType === 'mixed') {
                const donationOption = compensationTypesOptions.find(p => p.value === 'donation');
                const paymentOption = compensationTypesOptions.find(p => p.value === 'payment');

                const isDonationActive = filters.compensationTypes.some(p => p.value === 'donation');
                const isPaymentActive = filters.compensationTypes.some(p => p.value === 'payment');

                const showHeartAsActive = isDonationActive || (!anyCompFilterActive && hoveringIcon !== 'payment');
                const heartClasses = `${showHeartAsActive ? "text-rose-500" : "text-gray-300 hover:text-rose-500"} transition-colors`;

                const showDollarAsActive = isPaymentActive || (!anyCompFilterActive && hoveringIcon !== 'donation');
                const dollarClasses = `${showDollarAsActive ? "text-green-500" : "text-gray-300 hover:text-green-500"} transition-colors`;

                return (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); onPaymentFilterChange(donationOption, !isDonationActive); }}
                      title={isDonationActive ? "Deactivate Donation filter" : "Filter by Donation"}
                      className="p-1 transition-transform hover:scale-110"
                      onMouseEnter={() => setHoveringIcon('donation')}
                      onMouseLeave={() => setHoveringIcon(null)}
                    >
                      <FaHeart className={heartClasses} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onPaymentFilterChange(paymentOption, !isPaymentActive); }}
                      title={isPaymentActive ? "Deactivate Payment filter" : "Filter by Payment"}
                      className="p-1 transition-transform hover:scale-110"
                      onMouseEnter={() => setHoveringIcon('payment')}
                      onMouseLeave={() => setHoveringIcon(null)}
                    >
                      <FaDollarSign className={dollarClasses} />
                    </button>
                  </>
                );
              }

              const isFilterOn = filters.compensationTypes.some(p => p.value === compensationType);
              const displayAsActive = !anyCompFilterActive || isFilterOn;

              let iconWithClass;
              if (compensationType === 'donation') {
                iconWithClass = <FaHeart className={`${displayAsActive ? "text-rose-500" : "text-gray-300 hover:text-rose-500"} transition-colors`} />;
              } else { // payment
                iconWithClass = <FaDollarSign className={`${displayAsActive ? "text-green-500" : "text-gray-300 hover:text-green-500"} transition-colors`} />;
              }

              return (
                <button
                  onClick={(e) => { e.stopPropagation(); onPaymentFilterChange(option, !isFilterOn); }}
                  title={isFilterOn ? `Deactivate ${option.label} filter` : `Filter by ${option.label}`}
                  className="p-1 transition-transform hover:scale-110"
                >
                  {iconWithClass}
                </button>
              );
            })()}
          </div>
        </div>
        {resource.organization && (
          <p className="organization-name">
            {resource.organization}
          </p>
        )}
        {resource.description && (
          <p
            className={`text-sm text-google-text-secondary ${descriptionNeedsClamping ? 'cursor-pointer' : ''}`}
            onClick={descriptionNeedsClamping ? toggleExpansion : undefined}
          >
            {!isExpanded && descriptionNeedsClamping
              ? (
                <>
                  {`${resource.description.substring(0, 120)}... `}
                  <button onClick={toggleExpansion} className="text-sm text-blue-600 hover:underline font-medium whitespace-nowrap">
                    More
                  </button>
                </>
              )
              : (
                <>
                  {resource.description}
                  {descriptionNeedsClamping && (
                    <>
                      {' '}
                      <button onClick={toggleExpansion} className="text-sm text-blue-600 hover:underline font-medium whitespace-nowrap">
                        Less
                      </button>
                    </>
                  )}
                </>
              )
            }
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          {resource.countries && resource.countries.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {resource.countries.map((country, idx) => {
                if (typeof country !== 'string' || country.length === 0) return null;
                const code = resource.countryCodes?.[idx];
                const isEU = country === 'European Union';
                const isActive = filters.countries.includes(country) || (isEU && filters.countries.some(c => EU_COUNTRIES.includes(c)));
                return (
                  <TagButton
                    key={country}
                    label={country}
                    isActive={isActive}
                    onClick={(e) => { e.stopPropagation(); onFilterChange('countries', country, !isActive); }}
                  >
                    {code && (
                      <CountryFlag countryCode={code} svg aria-hidden="true" style={{ width: '1em', height: '0.8em', marginRight: '4px' }} />
                    )}
                    {country}
                  </TagButton>
                );
              })}
            </div>
          )}
          {resource.dataTypes && resource.dataTypes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {resource.dataTypes.map((type) => {
                if (typeof type !== 'string' || type.length === 0) return null;
                const isWearable = type.startsWith('Wearable data');
                const filterValue = isWearable ? 'Wearable data' : type;
                const isActive = filters.dataTypes.includes(filterValue);
                return (
                  <TagButton
                    key={type}
                    label={type}
                    isActive={isActive}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isWearable) {
                        onWearableFilterToggle();
                      } else {
                        onFilterChange('dataTypes', type, !isActive);
                      }
                    }}
                  >
                    {type}
                  </TagButton>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-2">
          {resource.link ? (
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="action-button"
              onClick={(e) => e.stopPropagation()}
            >
              Contribute <FaExternalLinkAlt className="inline ml-1 h-3 w-3" />
            </a>
          ) : (
            <Link href={`/resource/${resource.slug}`} className="action-button" onClick={(e) => e.stopPropagation()}>
              Details
            </Link>
          )}

          {hasCitations && citationMap && (
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    onClick={(e) => e.stopPropagation()}
                    className={`
                              ${open ? 'text-google-blue' : 'text-google-text-secondary'}
                              hover:text-google-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75 p-1 rounded-full`}
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
                    <Popover.Panel onClick={(e) => e.stopPropagation()} className="absolute z-10 bottom-full right-0 mb-2 w-72 max-h-60 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="p-3 space-y-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                          Service cited by
                        </h3>
                        <ol className="list-decimal list-inside space-y-1.5">
                          {resource.citations.map((citation, idx) => {
                            const key = getCitationKey(citation);
                            const refIndex = key ? citationMap[key] : undefined;
                            const refNumber = typeof refIndex === 'number' ? refIndex : null;

                            return (
                              <li key={idx} className="text-xs text-slate-600 leading-relaxed p-1.5 rounded-md hover:bg-slate-50 transition-colors">
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
    </div>
  );
}
