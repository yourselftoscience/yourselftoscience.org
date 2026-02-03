// src/components/ResourceCard.js
'use client';

import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import CountryFlag from 'react-country-flag';
import { FaHeart, FaDollarSign, FaExternalLinkAlt, FaBook, FaShareAlt, FaCheck, FaGlobe } from 'react-icons/fa';
import { Popover, Transition } from '@headlessui/react';
import { EU_COUNTRIES } from '@/data/constants';
import { getResourceShareUrl, copyToClipboard } from '@/utils/shareUtils';

const getPaymentInfo = (compensationType = 'donation') => {
  switch (compensationType) {
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
}

TagButton.propTypes = {
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

function CompensationIcons({ resource, filters, onPaymentFilterChange, compensationTypesOptions, hoveringIcon, setHoveringIcon }) {
  const compensationType = resource.compensationType || 'donation';
  const option = compensationTypesOptions.find(p => p.value === compensationType);

  if (!option) {
    const info = getPaymentInfo(compensationType);
    return <div title={`Compensation: ${info.label}`}>{info.icon}</div>;
  }

  const anyCompFilterActive = filters.compensationTypes.length > 0;

  if (compensationType === 'mixed') {
    const donationOption = compensationTypesOptions.find(p => p.value === 'donation');
    const paymentOption = compensationTypesOptions.find(p => p.value === 'payment');
    const isDonationActive = filters.compensationTypes.some(p => p.value === 'donation');
    const isPaymentActive = filters.compensationTypes.some(p => p.value === 'payment');

    const renderIcon = (type, isFilterActive, option) => {
      const showAsActive = isFilterActive || (!anyCompFilterActive && hoveringIcon !== (type === 'donation' ? 'payment' : 'donation'));
      const colorClass = type === 'donation' ? 'text-rose-500' : 'text-green-500';
      const classes = `${showAsActive ? colorClass : "text-gray-300 hover:" + colorClass} transition-colors`;
      const Icon = type === 'donation' ? FaHeart : FaDollarSign;

      return (
        <button
          onClick={(e) => { e.stopPropagation(); onPaymentFilterChange(option, !isFilterActive); }}
          title={isFilterActive ? `Deactivate ${type} filter` : `Filter by ${type}`}
          className="p-1 transition-transform hover:scale-110"
          onMouseEnter={() => setHoveringIcon(type)}
          onMouseLeave={() => setHoveringIcon(null)}
        >
          <Icon className={classes} />
        </button>
      );
    };

    return (
      <>
        {renderIcon('donation', isDonationActive, donationOption)}
        {renderIcon('payment', isPaymentActive, paymentOption)}
      </>
    );
  }

  const isFilterOn = filters.compensationTypes.some(p => p.value === compensationType);
  const displayAsActive = !anyCompFilterActive || isFilterOn;
  const colorClass = compensationType === 'donation' ? 'text-rose-500' : 'text-green-500';
  const Icon = compensationType === 'donation' ? FaHeart : FaDollarSign;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onPaymentFilterChange(option, !isFilterOn); }}
      title={isFilterOn ? `Deactivate ${option.label} filter` : `Filter by ${option.label}`}
      className="p-1 transition-transform hover:scale-110"
    >
      <Icon className={`${displayAsActive ? colorClass : "text-gray-300 hover:" + colorClass} transition-colors`} />
    </button>
  );
}

CompensationIcons.propTypes = {
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
            <Popover.Panel onClick={(e) => e.stopPropagation()} className="absolute z-10 bottom-full right-0 mb-2 w-72 max-h-60 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveringIcon, setHoveringIcon] = useState(null); // 'donation' | 'payment'
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
    'Organ, Body & Tissue Donation': 'bg-rose-100 text-rose-800',
    'Biological Samples': 'bg-blue-100 text-blue-800',
    'Clinical Trials': 'bg-green-100 text-green-800',
    'Health & Digital Data': 'bg-yellow-100 text-yellow-800',
  };

  const toggleExpansion = (e) => {
    e.stopPropagation();
    // Prevent default only if it's a click event to avoid interfering with other interactions if needed,
    // though for a toggle button it's usually fine.
    // e.preventDefault(); 
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpansion(e);
    }
  };

  const descriptionNeedsClamping = resource.description && resource.description.length > 150;

  const highlightClass = isHighlighted
    ? 'ring-2 ring-google-blue shadow-xl z-10 bg-blue-50/30'
    : '';

  return (
    <div
      id={`resource-${resource.slug}`}
      className={`resource-card flex flex-col relative transition-all duration-500 ease-out ${highlightClass}`}
    >
      <div className="">
        <div className="flex justify-between items-start">
          <div className="flex-grow pr-2">
            <div className="min-h-[1.5rem]">
              {(resource.macroCategories?.length > 0 || resource.entityCategory) && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {resource.macroCategories?.map((category) => (
                    <button
                      key={category}
                      onClick={() => onMacroCategoryFilterChange && onMacroCategoryFilterChange(category)}
                      className={`inline-block text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${categoryStyles[category] || 'bg-gray-100 text-gray-800'} transition-opacity hover:opacity-80`}
                    >
                      {category}
                    </button>
                  ))}
                  {resource.entityCategory && (() => {
                    const sector = resource.entityCategory === 'Commercial' ? 'Commercial' : 'Public & Non-Profit';
                    const isActive = filters.sectors?.includes(sector);
                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFilterChange('sectors', sector, !isActive);
                        }}
                        className={`
                        px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border transition-all
                        ${isActive
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                            : 'bg-slate-100/80 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800'}
                      `}
                        title={`Filter by ${sector}`}
                      >
                        {sector}
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>


            <h2 className="js-card-title text-lg font-semibold text-google-text mt-1 line-clamp-2 flex items-start">
              {resource.title}
            </h2>
          </div>

          <div className="flex-shrink-0 flex items-center gap-1 text-lg">
            <CompensationIcons
              resource={resource}
              filters={filters}
              onPaymentFilterChange={onPaymentFilterChange}
              compensationTypesOptions={compensationTypesOptions}
              hoveringIcon={hoveringIcon}
              setHoveringIcon={setHoveringIcon}
            />
          </div>
        </div>
        <div className="mb-0.5">
          {resource.organization && (
            <div className="flex flex-col items-start gap-0 mt-0">
              <p className="js-card-org organization-name text-sm font-medium text-slate-700 leading-tight">
                {resource.organization}
              </p>
              <div className="min-h-[1.5rem] flex items-center w-full">
                {resource.originCode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (resource.origin) {
                        onFilterChange('origins', resource.origin, !filters.origins?.includes(resource.origin));
                      }
                    }}
                    className={`flex items-center gap-1 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all duration-200 min-h-[24px]
                      ${filters.origins?.includes(resource.origin)
                        ? 'text-blue-700 bg-blue-50 px-2 -ml-2'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 px-0'
                      }`}
                    title={`Filter by origin: ${resource.origin || resource.originCode}`}
                  >
                    <span>based in {resource.origin}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>


        {resource.description && (
          descriptionNeedsClamping ? (
            <button
              className="text-sm text-google-text-secondary cursor-pointer text-left w-full bg-transparent border-none py-1"
              onClick={toggleExpansion}
              onKeyDown={handleKeyDown}
            >
              <span className={isExpanded ? '' : 'line-clamp-3'}>
                {resource.description}
              </span>
              <span
                className="mt-2 block text-sm text-google-blue hover:underline font-medium min-h-[24px] flex items-center"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </span>
            </button>
          ) : (
            <div className="text-sm text-google-text-secondary py-1">
              {resource.description}
            </div>
          )
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
        <div className="flex flex-col gap-2">

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
            <div className="flex flex-wrap items-center gap-1.5 min-h-[2.5rem]">
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
              aria-label={`Contribute to ${resource.title}`}
            >
              Contribute <FaExternalLinkAlt className="inline ml-1 h-3 w-3" />
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
          )}

          <div className="flex items-center gap-2">
            {hasCitations && citationMap && (
              <CitationsPopover resource={resource} citationMap={citationMap} />
            )}

            <button
              onClick={handleShare}
              className={`
                relative group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 min-h-[24px]
                ${showCopied
                  ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ring-1 ring-slate-200'
                }
              `}
              aria-label="Share this resource"
              title="Copy link to clipboard"
            >
              {showCopied ? (
                <>
                  <FaCheck className="w-3 h-3 text-green-600" />
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <FaShareAlt className="w-3 h-3 text-slate-500 group-hover:text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ResourceCard.propTypes = {
  resource: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    link: PropTypes.string,
    slug: PropTypes.string,
    organization: PropTypes.string,
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
};
