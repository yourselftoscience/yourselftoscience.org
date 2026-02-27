// src/components/ResourceCard.js
'use client';

import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import CountryFlag from 'react-country-flag';
import { FaHeart, FaDollarSign, FaExternalLinkAlt, FaBook, FaShareAlt, FaCheck, FaGlobe, FaInfoCircle, FaChevronDown, FaBuilding } from 'react-icons/fa';
import { Popover, Transition } from '@headlessui/react';
import { EU_COUNTRIES } from '@/data/constants';
import { getResourceShareUrl, copyToClipboard } from '@/utils/shareUtils';

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
  const baseClasses = "tag flex items-center cursor-pointer transition-colors duration-150 ease-in-out px-2.5 py-1 rounded-md text-[10px] font-semibold";
  const activeClasses = "bg-blue-100 text-blue-800 ring-1 ring-blue-300 border-blue-200";
  const inactiveClasses = "bg-slate-100/80 text-slate-600 border-slate-200 hover:bg-slate-200/80";

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
}

TagButton.propTypes = {
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

function CompensationBadge({ resource, filters, onPaymentFilterChange, compensationTypesOptions, hoveringIcon, setHoveringIcon }) {
  const compensationType = resource.compensationType || 'donation';
  const option = compensationTypesOptions.find(p => p.value === compensationType);
  const anyCompFilterActive = filters.compensationTypes.length > 0;

  if (compensationType === 'mixed') {
    const donationOption = compensationTypesOptions.find(p => p.value === 'donation');
    const paymentOption = compensationTypesOptions.find(p => p.value === 'payment');
    const mixedOption = compensationTypesOptions.find(p => p.value === 'mixed');
    const isDonationActive = filters.compensationTypes.some(p => p.value === 'donation');
    const isPaymentActive = filters.compensationTypes.some(p => p.value === 'payment');

    const handleMixedClick = (targetOption, isCurrentlyActive) => {
      // When toggling a compensation type on a mixed card, also toggle 'mixed'
      if (targetOption) {
        onPaymentFilterChange(targetOption, !isCurrentlyActive);
        // Also ensure 'mixed' is included/excluded
        if (mixedOption) {
          const isMixedActive = filters.compensationTypes.some(p => p.value === 'mixed');
          if (!isCurrentlyActive && !isMixedActive) {
            // Turning ON: also add mixed
            onPaymentFilterChange(mixedOption, true);
          }
        }
      }
    };

    return (
      <div className="flex items-center gap-1">
        <button
          aria-label="Filter by payment"
          onClick={(e) => { e.stopPropagation(); handleMixedClick(paymentOption, isPaymentActive); }}
          className="relative group/icon focus:outline-none cursor-pointer"
        >
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full border shadow-sm transition-all hover:scale-110
            ${isPaymentActive
              ? 'bg-emerald-200 border-emerald-400 text-emerald-800 ring-2 ring-emerald-400 scale-110'
              : 'bg-emerald-100 border-emerald-200 text-emerald-700'}
          `}>
            <FaDollarSign />
          </div>
          <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all z-50 pointer-events-none">
            <div className="font-semibold mb-1">Payment</div>
            <div className="text-slate-300 leading-tight">Participants are compensated. Click to filter.</div>
          </div>
        </button>
        <button
          aria-label="Filter by donation"
          onClick={(e) => { e.stopPropagation(); handleMixedClick(donationOption, isDonationActive); }}
          className="relative group/icon focus:outline-none cursor-pointer"
        >
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full border shadow-sm transition-all hover:scale-110
            ${isDonationActive
              ? 'bg-rose-200 border-rose-400 text-rose-800 ring-2 ring-rose-400 scale-110'
              : 'bg-rose-100 border-rose-200 text-rose-700'}
          `}>
            <FaHeart />
          </div>
          <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all z-50 pointer-events-none">
            <div className="font-semibold mb-1">Donation</div>
            <div className="text-slate-300 leading-tight">Volunteer contribution to research. Click to filter.</div>
          </div>
        </button>
      </div>
    );
  }

  const isFilterOn = option ? filters.compensationTypes.some(p => p.value === compensationType) : false;

  return (
    <button
      aria-label={`Compensation: ${compensationType}`}
      onClick={(e) => {
        e.stopPropagation();
        if (option) onPaymentFilterChange(option, !isFilterOn);
      }}
      className="relative group/icon focus:outline-none cursor-pointer"
    >
      <div className={`
        flex items-center justify-center w-8 h-8 rounded-full border shadow-sm transition-all hover:scale-110
        ${isFilterOn
          ? (compensationType === 'payment'
            ? 'bg-emerald-200 border-emerald-400 text-emerald-800 ring-2 ring-emerald-400 scale-110'
            : 'bg-rose-200 border-rose-400 text-rose-800 ring-2 ring-rose-400 scale-110')
          : (compensationType === 'payment'
            ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
            : 'bg-rose-100 border-rose-200 text-rose-700')}
      `}>
        {compensationType === 'payment' ? <FaDollarSign /> : <FaHeart />}
      </div>
      <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all z-50 pointer-events-none">
        <div className="font-semibold mb-1 capitalize">{compensationType}</div>
        <div className="text-slate-300 leading-tight">
          {compensationType === 'payment' && "Participants are compensated. Click to filter."}
          {(compensationType === 'donation' || !compensationType) && "Volunteer contribution to research. Click to filter."}
        </div>
      </div>
    </button>
  );
}

CompensationBadge.propTypes = {
  resource: PropTypes.shape({
    compensationType: PropTypes.string,
  }).isRequired,
  filters: PropTypes.shape({
    compensationTypes: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
    })),
  }).isRequired,
  onPaymentFilterChange: PropTypes.func.isRequired,
  compensationTypesOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  })).isRequired,
  hoveringIcon: PropTypes.string,
  setHoveringIcon: PropTypes.func.isRequired,
};

function CitationsPopover({ resource, citationMap }) {
  return (
    <Popover className="relative flex items-center">
      {({ open }) => (
        <>
          <Popover.Button
            className={`
              group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 min-h-[24px]
              ${open
                ? 'bg-google-blue/10 text-google-blue ring-1 ring-google-blue/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ring-1 ring-slate-200'
              }
            `}
            onClick={(e) => e.stopPropagation()}
            aria-label={`View ${resource.citations.length} ${resource.citations.length === 1 ? 'citation' : 'citations'}`}
          >
            <FaBook className={`w-3 h-3 ${open ? 'text-google-blue' : 'text-slate-500 group-hover:text-slate-600'}`} />
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
            <Popover.Panel onClick={(e) => e.stopPropagation()} className="absolute z-50 bottom-full left-0 mb-2 w-72 max-w-[calc(100vw-2rem)] max-h-60 overflow-y-auto rounded-xl bg-white shadow-2xl ring-1 ring-black/10 focus:outline-none">
              <div className="p-3 space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                  Service cited by
                </h3>
                <ol className="list-decimal list-inside space-y-1.5">
                  {resource.citations.map((citation, idx) => {
                    const key = getCitationKey(citation) || idx;
                    const refIndex = key && citationMap ? citationMap[key] : undefined;
                    const refNumber = typeof refIndex === 'number' ? refIndex : null;

                    return (
                      <li key={key} className="text-xs text-slate-600 leading-relaxed p-1.5 rounded-md hover:bg-slate-50 transition-colors">
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
  );
}

CitationsPopover.propTypes = {
  resource: PropTypes.shape({
    citations: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      link: PropTypes.string,
    })),
  }).isRequired,
  citationMap: PropTypes.object,
};

// ResourceCard component for displaying service details
export default function ResourceCard({
  resource,
  filters,
  onFilterChange,
  onPaymentFilterChange,
  compensationTypesOptions,
  citationMap,
  onWearableFilterToggle,
  onMacroCategoryFilterChange,
  isHighlighted = false,
  showDataTypes = true,
}) {
  const [hoveringIcon, setHoveringIcon] = useState(null);
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const hasCitations = resource.citations && resource.citations.length > 0;

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = getResourceShareUrl(resource.slug);
    const success = await copyToClipboard(shareUrl);

    if (success) {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const categoryStyles = {
    'Organ, Body & Tissue Donation': 'bg-rose-50/80 text-rose-700 border-rose-200/50',
    'Biological Samples': 'bg-blue-50/80 text-blue-700 border-blue-200/50',
    'Clinical Trials': 'bg-green-50/80 text-green-700 border-green-200/50',
    'Health & Digital Data': 'bg-yellow-50/80 text-yellow-700 border-yellow-200/50',
  };

  const categoryActiveStyles = {
    'Organ, Body & Tissue Donation': 'bg-rose-100 text-rose-800 border-rose-400 ring-2 ring-rose-400 ring-offset-1 scale-105',
    'Biological Samples': 'bg-blue-100 text-blue-800 border-blue-400 ring-2 ring-blue-400 ring-offset-1 scale-105',
    'Clinical Trials': 'bg-green-100 text-green-800 border-green-400 ring-2 ring-green-400 ring-offset-1 scale-105',
    'Health & Digital Data': 'bg-yellow-100 text-yellow-800 border-yellow-400 ring-2 ring-yellow-400 ring-offset-1 scale-105',
  };

  const highlightClass = isHighlighted
    ? 'ring-2 ring-blue-400 shadow-[0_8px_30px_rgba(59,130,246,0.3)] scale-[1.02] bg-blue-50/40 z-10'
    : '';

  return (
    <article
      id={`resource-${resource.slug}`}
      className={`resource-card group relative ${highlightClass}`}
    >
      {/* Decorative Gradient Background (Subtle) */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-40 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-grow pr-2">
            {/* Category + Sector Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {resource.macroCategories?.map((category) => {
                const isCatActive = filters.macroCategories?.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => onMacroCategoryFilterChange && onMacroCategoryFilterChange(category)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.05em] uppercase border shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all
                      ${isCatActive
                        ? (categoryActiveStyles[category] || 'bg-slate-100 text-slate-800 border-slate-400 ring-2 ring-slate-400 ring-offset-1 scale-105')
                        : `${categoryStyles[category] || 'bg-slate-50/80 text-slate-700 border-slate-200/50'} hover:opacity-80`}`}
                  >
                    {category}
                  </button>
                );
              })}
              {resource.entityCategory && (() => {
                const sector = resource.entityCategory === 'Commercial' ? 'Commercial' : 'Public & Non-Profit';
                const isActive = filters.sectors?.includes(sector);
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterChange('sectors', sector, !isActive);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.05em] uppercase border shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all
                      ${isActive
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-300 ring-offset-1 scale-105'
                        : 'bg-slate-50/50 text-slate-600 border-slate-200/50 hover:bg-slate-100 hover:border-slate-300'}`}
                    title={`Filter by ${sector}`}
                  >
                    {sector}
                  </button>
                );
              })()}
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
              {resource.title}
            </h2>

            {/* Organization + Origin */}
            {(resource.organization || (resource.organizations && resource.organizations.length > 0)) && (
              <div className="flex flex-wrap items-center text-sm font-medium text-slate-600 mb-2 gap-y-1">
                <FaBuilding className="mr-1.5 opacity-60 w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="mr-1.5">{resource.organization || resource.organizations.map(o => o.name).join(', ')}</span>
                {resource.origin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (resource.origin) {
                        onFilterChange('origins', resource.origin, !filters.origins?.includes(resource.origin));
                      }
                    }}
                    className={`text-slate-400 font-normal whitespace-nowrap hover:text-blue-600 transition-colors ${filters.origins?.includes(resource.origin) ? 'text-blue-600 font-medium' : ''}`}
                    title={`Filter by origin: ${resource.origin}`}
                  >
                    &bull; Based in {resource.origin}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Top Right: Compensation Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <CompensationBadge
              resource={resource}
              filters={filters}
              onPaymentFilterChange={onPaymentFilterChange}
              compensationTypesOptions={compensationTypesOptions}
              hoveringIcon={hoveringIcon}
              setHoveringIcon={setHoveringIcon}
            />
          </div>
        </div>

        {/* Eligibility Warning */}
        {resource.eligibility === 'Customers' && (
          <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 mb-3">
            <FaInfoCircle className="mt-0.5 flex-shrink-0 text-blue-500 w-3 h-3" />
            <span>Requires being a customer</span>
          </div>
        )}

        {/* Description */}
        {resource.description && (
          <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {resource.description}
          </p>
        )}

        {/* Country & Data Type Tags */}
        <div className="flex flex-col gap-2 mb-4">
          {resource.countries && resource.countries.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Available in</span>
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
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Available in</span>
              <TagButton
                label="Worldwide"
                isActive={filters.countries.includes('Worldwide')}
                onClick={(e) => { e.stopPropagation(); onFilterChange('countries', 'Worldwide', !filters.countries.includes('Worldwide')); }}
              >
                <FaGlobe className="w-3 h-3 mr-1.5 text-slate-500" />
                Worldwide
              </TagButton>
            </div>
          )}
          {showDataTypes && resource.dataTypes && resource.dataTypes.length > 0 && (
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

        {/* Footer Actions */}
        <div className="mt-auto pt-4 border-t border-slate-100/50 flex flex-col gap-3">
          <div className="w-full flex items-start gap-2">
            <div className="flex-1 relative">
              {resource.instructions && resource.instructions.length > 0 ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsInstructionsExpanded(!isInstructionsExpanded);
                    }}
                    className={`w-full flex items-center justify-between px-5 h-12 rounded-xl text-sm font-semibold transition-all duration-300
                      ${isInstructionsExpanded
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-blue-600 text-white shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 hover:-translate-y-[1px]'
                      }`}
                  >
                    <span>{isInstructionsExpanded ? 'Hide Instructions' : 'Instructions'}</span>
                    <FaChevronDown className={`transition-transform ${isInstructionsExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isInstructionsExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-sm text-slate-600">
                      <ol className="list-decimal list-inside space-y-1.5">
                        {resource.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                      {resource.link && (
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Go to ${resource.title} Website`}
                          className="mt-3 flex items-center justify-center w-full py-2 h-12 bg-white border border-slate-200 rounded-lg text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Go to Website <FaExternalLinkAlt className="ml-2 text-xs" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                resource.link ? (
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-button"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Contribute to ${resource.title}`}
                  >
                    Contribute <FaExternalLinkAlt className="ml-2 text-xs opacity-90" />
                  </a>
                ) : (
                  <Link
                    href={`/resource/${resource.slug}`}
                    className="action-button"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`View details for ${resource.title}`}
                  >
                    Details
                  </Link>
                )
              )}
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-xl border shadow-sm transition-transform hover:-translate-y-[1px] focus:outline-none 
                ${showCopied ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'}
              `}
              aria-label="Share this resource"
              title="Copy link to clipboard"
            >
              {showCopied ? <FaCheck className="w-4 h-4" /> : <FaShareAlt className="w-4 h-4" />}
            </button>
          </div>

          {/* Citations row */}
          {hasCitations && citationMap && (
            <div className="flex items-center gap-2 flex-shrink-0 self-start">
              <CitationsPopover resource={resource} citationMap={citationMap} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

ResourceCard.propTypes = {
  resource: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    link: PropTypes.string,
    slug: PropTypes.string,
    organization: PropTypes.string,
    organizations: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
    })),
    origin: PropTypes.string,
    originCode: PropTypes.string,
    compensationType: PropTypes.string,
    macroCategories: PropTypes.arrayOf(PropTypes.string),
    countries: PropTypes.arrayOf(PropTypes.string),
    countryCodes: PropTypes.arrayOf(PropTypes.string),
    dataTypes: PropTypes.arrayOf(PropTypes.string),
    citations: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      link: PropTypes.string,
    })),
  }).isRequired,
  filters: PropTypes.shape({
    compensationTypes: PropTypes.array,
    countries: PropTypes.array,
    dataTypes: PropTypes.array,
    sectors: PropTypes.array,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onPaymentFilterChange: PropTypes.func.isRequired,
  compensationTypesOptions: PropTypes.array.isRequired,
  citationMap: PropTypes.object,
  onWearableFilterToggle: PropTypes.func,
  onMacroCategoryFilterChange: PropTypes.func,
  isHighlighted: PropTypes.bool,
  showDataTypes: PropTypes.bool,
};
