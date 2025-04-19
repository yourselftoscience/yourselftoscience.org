'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import CountryFlag from 'react-country-flag';
import { FaMobileAlt, FaCog, FaUserShield, FaArrowRight, FaSortAlphaDown, FaSortAlphaUp, FaHeart, FaDollarSign } from 'react-icons/fa';
import { resources, citationMap } from '@/data/resources';

// Dynamically import React Select with client-side only rendering
const Select = dynamic(() => import('react-select'), { 
  ssr: false // This prevents server-side rendering of this component
});

const EU_COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden'
];

const PAYMENT_TYPES = [
  { value: 'donation', label: 'Donation', emoji: '❤️' },
  { value: 'payment', label: 'Payment', emoji: '💵' },
  { value: 'mixed', label: 'Mixed', emoji: '❤️💵' }
];

function expandCountries(chosen) {
  const set = new Set(chosen);
  const hasEU = set.has('European Union');
  const hasAnyEUCountry = EU_COUNTRIES.some((c) => set.has(c));

  // If “European Union” is chosen, add all EU countries
  if (hasEU) {
    EU_COUNTRIES.forEach((c) => set.add(c));
  }

  // If any EU country is chosen, also add “European Union”
  if (hasAnyEUCountry) {
    set.add('European Union');
  }

  return Array.from(set);
}

const customStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: 'white',
    borderColor: '#D1D5DB',
    borderRadius: '0.375rem', // You can also round the control itself if desired
  }),
  menu: (provided) => ({ // Styles for the dropdown container
    ...provided,
    borderRadius: '0.75rem', // Increased roundness (e.g., 12px). Try '1rem' for even more.
    border: '1px solid #D1D5DB', // Optional: Add a border to the menu itself
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // Optional: Add shadow
    overflow: 'hidden', // Important: Keeps options inside the rounded corners
  }),
  option: (provided, state) => ({ // Styles for individual options within the menu
    ...provided,
    border: 'none', // Remove default borders
    // Remove borderRadius from options if you only want the menu container rounded
    // borderRadius: 0, 
    borderBottom: '1px solid #E5E7EB', // Light border between options
    margin: 0,
    padding: '10px 12px', // Adjust padding as needed
    cursor: 'pointer',
    backgroundColor:
      state.isSelected ? '#DBEAFE' : state.isFocused ? '#F3F4F6' : 'white', // Example colors
    color: 'black',
    ':hover': {
      backgroundColor: '#F3F4F6', // Example hover color
    },
    // Ensure the last option doesn't have a bottom border
    ':last-child': {
        borderBottom: 'none',
    },
  }),
  menuList: (provided) => ({ // Styles for the list inside the menu
    ...provided,
    paddingTop: 0, // Remove default padding if needed
    paddingBottom: 0, // Remove default padding if needed
  }),
  multiValue: (provided) => ({
    ...provided,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    display: 'flex',
    alignItems: 'center',
  }),
  singleValue: (provided) => ({
    ...provided,
    display: 'flex',
    alignItems: 'center',
    color: 'black',
  }),
};

// Update the ResourceTable component to work with Next.js 15
export default function ResourceTable({ filteredResources: initialResources }) {
  // State for filters, sorting, and tooltip
  const [filters, setFilters] = useState({ 
    dataTypes: [], 
    countries: [],
    paymentTypes: [] // Add compensation to filters
  });
  const [sortColumn, setSortColumn] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [forceTooltip, setForceTooltip] = useState(false);
  const [hoverTooltip, setHoverTooltip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update tooltip position once the header cell renders
  useEffect(() => {
    if ((hoverTooltip || forceTooltip) && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, [hoverTooltip, forceTooltip]);

  // Dynamic data type options using full resources (assumed imported globally)
  const dataTypeOptions = Array.from(
    new Set(resources.flatMap((resource) => resource.dataTypes || []))
  )
    .sort((a, b) => a.localeCompare(b))
    .map((dataType) => ({ label: dataType, value: dataType }));

  // Dynamic country options
  const countryOptions = [];
  const countryMap = new Map(); // To avoid duplicates and map country names to codes

  resources.forEach((resource) => {
    if (resource.countries && resource.countryCodes) {
      resource.countries.forEach((country, idx) => {
        const code = resource.countryCodes[idx];
        if (!countryMap.has(country)) {
          countryMap.set(country, code);
          countryOptions.push({
            label: country,
            value: country,
            code: code,
          });
        }
      });
    }
  });

  // Sort countryOptions alphabetically
  countryOptions.sort((a, b) => a.label.localeCompare(b.label));

  // Helper function to handle sorting when a header is clicked
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle sort order if the same column is clicked
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set sort column and default to ascending order
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  // Sorting and filtering logic using the initial resources passed as prop
  const processedResources = filterResources(initialResources).sort((a, b) => {
    let valueA = a[sortColumn] || '';
    let valueB = b[sortColumn] || '';
    if (valueA < valueB) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Custom Option component to include flags
  const OptionComponent = (props) => {
    const { data, innerRef, innerProps, isFocused, isSelected } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          border: 'none',
          borderBottom: '1px solid #D1D5DB', // Only horizontal border
          padding: '8px',
          cursor: 'pointer',
          backgroundColor: isSelected || isFocused ? '#E5E7EB' : 'white',
        }}
        className="flex items-center justify-between"
      >
        <span className="text-black">{data.label}</span>
        {data.code && (
          <CountryFlag
            countryCode={data.code}
            svg
            style={{ width: '1.5em', height: '1em' }}
            title={data.label}
          />
        )}
      </div>
    );
  };

  // Custom MultiValueLabel component to include flags in selected options
  const MultiValueLabelComponent = (props) => {
    const { data } = props;
    return (
      <components.MultiValueLabel {...props}>
        <span>{data.label}</span>
        {data.code && (
          <CountryFlag
            countryCode={data.code}
            svg
            style={{
              width: '1em',
              height: '1em',
              marginLeft: '0.25em',
            }}
            title={data.label}
          />
        )}
      </components.MultiValueLabel>
    );
  };

  // Custom SingleValue component to include flags on the right
  const SingleValueComponent = (props) => {
    const { data } = props;
    return (
      <div className="flex items-center">
        <span className="text-black">{data.label}</span>
        {data.code && (
          <CountryFlag
            countryCode={data.code}
            svg
            style={{
              width: '1.5em',
              height: '1em',
              marginLeft: '0.5em',
            }}
            title={data.label}
          />
        )}
      </div>
    );
  };

  // Add this before using components in the component props
  const components = {
    Option: OptionComponent,
    MultiValueLabel: MultiValueLabelComponent,
    SingleValue: SingleValueComponent,
  };

  // Helper function to get icons for instruction steps
  const getStepIcon = (step) => {
    if (step.toLowerCase().includes('fitbit app')) {
      return <FaMobileAlt className="text-blue-500" />;
    }
    if (step.toLowerCase().includes('settings')) {
      return <FaCog className="text-gray-600" />;
    }
    if (step.toLowerCase().includes('privacy')) {
      return <FaUserShield className="text-green-500" />;
    }
    if (step.toLowerCase().includes('data shared')) {
      return <FaArrowRight className="text-yellow-500" />;
    }
    return <FaArrowRight className="text-gray-500" />;
  };

  // Helper function to get sorting icons for headers
  const getSortIcon = (column) => {
    if (sortColumn === column) {
      return sortOrder === 'asc' ? (
        <FaSortAlphaDown className="inline ml-1" />
      ) : (
        <FaSortAlphaUp className="inline ml-1" />
      );
    } else {
      return <FaSortAlphaDown className="inline ml-1 text-gray-400" />;
    }
  };

  // Helper function to toggle data type filter
  function handleToggleDataType(dataType) {
    setFilters((prev) => {
      const currentSelected = prev.dataTypes.map((dt) => dt.value);
      if (currentSelected.includes(dataType)) {
        // Remove if already selected
        return {
          ...prev,
          dataTypes: prev.dataTypes.filter((dt) => dt.value !== dataType),
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          dataTypes: [
            ...prev.dataTypes,
            { label: dataType, value: dataType },
          ],
        };
      }
    });
  }

  // Helper function to toggle country filter
  function handleToggleCountry(country, code) {
    setFilters((prev) => {
      const current = prev.countries.map((c) => c.value);
      if (current.includes(country)) {
        // Remove if already selected
        return {
          ...prev,
          countries: prev.countries.filter((c) => c.value !== country),
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          countries: [
            ...prev.countries,
            { label: country, value: country, code },
          ],
        };
      }
    });
  }

  // Helper function to compare two arrays of strings for equality (order doesn't matter)
  function arraysHaveSameElements(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  }

  // UPDATED: Helper function to set OR toggle off specific payment type filters
  function handleSetPaymentTypes(typesToSet) { // typesToSet is an array of strings like ['donation', 'mixed']
    setFilters(prev => {
      const currentSelectedValues = prev.paymentTypes.map(pt => pt.value);
      
      // Check if the current filter exactly matches the one we would set
      if (arraysHaveSameElements(currentSelectedValues, typesToSet)) {
        // If it matches, clear the filter
        return {
          ...prev,
          paymentTypes: [] 
        };
      } else {
        // Otherwise, set the new filter
        const selectedOptions = PAYMENT_TYPES.filter(pt => typesToSet.includes(pt.value));
        return {
          ...prev,
          paymentTypes: selectedOptions
        };
      }
    });
  }

  function filterResources(data) {
    // Example of other filters...
    if (filters.dataTypes.length) {
      const chosenTypes = filters.dataTypes.map((t) => t.value);
      data = data.filter((resource) =>
        resource.dataTypes?.some((dt) => chosenTypes.includes(dt))
      );
    }

    // COUNTRY FILTER:
    let chosenCountries = filters.countries.map((c) => c.value);
    chosenCountries = expandCountries(chosenCountries);

    if (chosenCountries.length) {
      data = data.filter((resource) => {
        // Include if no countries or if any overlaps
        if (!resource.countries || resource.countries.length === 0) {
          return true;
        }
        return resource.countries.some((c) => chosenCountries.includes(c));
      });
    }

    // Compensation filtering
    if (filters.paymentTypes.length) {
      const chosenTypes = filters.paymentTypes.map((t) => t.value);
      data = data.filter((resource) => {
        // If resource doesn't have paymentType, assume it's donation
        const type = resource.paymentType || 'donation';
        // Include mixed when either payment or donation is selected
        if (type === 'mixed') {
          return chosenTypes.includes('donation') || chosenTypes.includes('payment') || chosenTypes.includes('mixed');
        }
        return chosenTypes.includes(type);
      });
    }

    return data;
  }

  // Collect all citations from filtered resources
  const allCitations = processedResources.flatMap((resource) => resource.citations || []);

  // Fix the citations rendering to use React.Fragment properly
  const renderCitations = (resourceCitations) => {
    if (!resourceCitations || resourceCitations.length === 0) return null;
    
    return resourceCitations.map((citation, idx) => {
      // Create the same key format used in generateCitationMappings
      const key = citation.link ? citation.link.trim() : citation.title.trim();
      const citationNumber = citationMap[key];
      
      if (!citationNumber) return null;
      
      return (
        <React.Fragment key={idx}>
          <a
            href={`#ref-${citationNumber}`}
            className="text-blue-600 hover:underline"
          >
            [{citationNumber}]
          </a>{' '}
        </React.Fragment>
      );
    });
  };

  // Modify getPaymentEmoji to handle mixed type clicks separately
  const getPaymentEmoji = (paymentType) => {
    switch(paymentType) {
      case 'donation': 
        return <span className="text-lg cursor-pointer" onClick={() => handleSetPaymentTypes(['donation'])}>❤️</span>; 
      case 'payment': 
        return <span className="text-lg cursor-pointer" onClick={() => handleSetPaymentTypes(['payment'])}>💵</span>;
      case 'mixed': 
        return (
          <span className="text-lg">
            <span className="cursor-pointer" onClick={() => handleSetPaymentTypes(['donation', 'mixed'])}>❤️</span>
            <span className="cursor-pointer" onClick={() => handleSetPaymentTypes(['payment', 'mixed'])}>💵</span>
          </span>
        );
      default: 
        return <span className="text-lg">❤️</span>; 
    }
  };

  return (
    <div className="mt-10">
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
        {/* Data Type Filter */}
        <Select
          options={dataTypeOptions}
          value={filters.dataTypes}
          onChange={(selectedOptions) =>
            setFilters({ ...filters, dataTypes: selectedOptions || [] })
          }
          isMulti
          styles={customStyles}
          placeholder="All Data Types"
        />

        {/* Country Exclusion Filter */}
        <Select
          options={countryOptions}
          value={filters.countries}
          onChange={(selectedOptions) =>
            setFilters({ ...filters, countries: selectedOptions || [] })
          }
          isMulti
          styles={customStyles} // Reuse the same customStyles as All Data Types
          components={components}
          placeholder="Exclude services not available in:"
        />

        {/* Compensation Filter */}
        <Select
          options={PAYMENT_TYPES.map(type => ({
            ...type,
            label: (
              <div className="flex items-center">
                <span>{type.emoji}</span>
                <span className="ml-2">{type.label}</span>
              </div>
            )
          }))}
          value={filters.paymentTypes}
          onChange={(selectedOptions) =>
            setFilters({ ...filters, paymentTypes: selectedOptions || [] })
          }
          isMulti
          styles={customStyles}
          placeholder="All Compensation"
        />
      </div>

      {/* Resource Table */}
      <div className="overflow-x-auto overflow-y-visible rounded-lg"> {/* Optional: Add rounding to the container too */}
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden"><thead><tr>{/* Ensure no space/newline between <thead> and <tr> */}
              {/* Compensation Header - moved to the far left */}
              <th
                className="py-2 px-4 border-b border-r border-gray-300 text-black cursor-pointer select-none"
                onClick={() => handleSort('paymentType')}
              >
                Compensation {getSortIcon('paymentType')}
              </th>

              {/* Title Header */}
              <th
                className="py-2 px-4 border-b border-r border-gray-300 text-black cursor-pointer select-none"
                onClick={() => handleSort('title')}
              >
                Title {getSortIcon('title')}
              </th>

              {/* Access Header */}
              <th
                className="py-2 px-4 border-b border-r border-gray-300 text-black cursor-pointer select-none"
                onClick={() => handleSort('access')}
              >
                Access {getSortIcon('access')}
              </th>

              {/* Data Type Header */}
              <th
                className="py-2 px-4 border-b border-r border-gray-300 text-black cursor-pointer select-none"
                onClick={() => handleSort('dataType')}
              >
                Data Type {getSortIcon('dataType')}
              </th>

              {/* Only Available In Header */}
              <th
                className="py-2 px-4 border-b border-r border-gray-300 text-black cursor-pointer select-none"
                onClick={() => handleSort('country')}
              >
                Only available in {getSortIcon('country')}
              </th>

              {/* Tooltip header cell */}
              <th
                ref={tooltipRef}
                className="relative py-2 px-4 border-b border-r border-gray-300 text-black cursor-pointer select-none overflow-visible"
                onClick={() => setForceTooltip((prev) => !prev)}
                onMouseEnter={() => setHoverTooltip(true)}
                onMouseLeave={() => {
                  setHoverTooltip(false);
                  setForceTooltip(false);
                }}
              >
                <span className="underline">Refs.</span>
              </th>
            </tr></thead>{/* Ensure no space/newline between </tr> and </thead> */}<tbody>{/* Ensure no space/newline between </thead> and <tbody> */}
            {processedResources.length > 0 ? (
              processedResources.map((resource, index) => (
                <tr
                  key={resource.id}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-100`}
                >
                  {/* Compensation Column - moved to the far left */}
                  <td className="py-2 px-4 border-b border-r border-gray-300 text-black align-top text-center">
                    {getPaymentEmoji(resource.paymentType || 'donation')}
                  </td>

                  {/* Title Column */}
                  <td className="py-2 px-4 border-b border-r border-gray-300 text-black align-top">
                    {resource.title}
                  </td>

                  {/* Access Column */}
                  <td className="py-2 px-4 border-b border-r border-gray-300 align-top">
                    {resource.link ? (
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit
                      </a>
                    ) : resource.instructions ? (
                      <div className="text-gray-700">
                        <div className="flex flex-col items-start space-y-1">
                          {resource.instructions.map((step, idx) => (
                            <div key={idx} className="flex items-center">
                              {/* Step Number */}
                              <span className="mr-2 font-semibold text-gray-800">
                                {idx + 1}.
                              </span>
                              {/* Step Icon */}
                              {getStepIcon(step)}
                              {/* Step Text */}
                              <span className="ml-2">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>

                  {/* Data Type Column */}
                  <td className="py-2 px-4 border-b border-r border-gray-300 text-black align-top">
                    {resource.dataTypes
                      .sort((a, b) => a.localeCompare(b))
                      .map((dataType, idx) => {
                        // Check whether this dataType is currently selected
                        const isActive = filters.dataTypes.some(
                          (option) => option.value === dataType
                        );

                        return (
                          <button
                            key={idx}
                            className={
                              isActive
                                ? 'bg-blue-500 text-white px-2 py-1 rounded mr-2 mb-2'
                                : 'bg-gray-200 text-black px-2 py-1 rounded mr-2 mb-2 hover:bg-gray-300'
                            }
                            onClick={() => handleToggleDataType(dataType)}
                          >
                            {dataType}
                          </button>
                        );
                      })}
                  </td>

                  {/* Only Available In Column */}
                  <td className="py-2 px-4 border-b border-r border-gray-300 text-black align-top">
                    {resource.countries?.map((country, idx) => {
                      const isActive = filters.countries.some((c) => c.value === country);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleToggleCountry(country, resource.countryCodes?.[idx])}
                          className={
                            isActive
                              ? "bg-blue-500 text-white px-2 py-1 rounded mr-2 mb-2"
                              : "bg-gray-200 text-black px-2 py-1 rounded mr-2 mb-2 hover:bg-gray-300"
                          }
                        >
                          {country}
                          {resource.countryCodes?.[idx] && (
                            <CountryFlag
                              countryCode={resource.countryCodes[idx]}
                              svg
                              style={{ width: "1.5em", height: "1em", marginLeft: "0.5em" }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </td>

                  {/* Refs Column */}
                  <td className="py-2 px-4 border-b border-r border-gray-300 text-black align-top">
                    {renderCitations(resource.citations)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="100%"
                  className="py-4 px-4 text-center text-gray-500"
                >
                  No resources found for the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Render the tooltip via portal */}
      {isMounted &&
        (hoverTooltip || forceTooltip) &&
        createPortal(
          <div
            style={{
              position: 'absolute',
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: 'translate(-50%, 0)',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              fontSize: '0.75rem',
              borderRadius: '0.25rem',
              border: '1px solid #D1D5DB',
              padding: '0.25rem 0.5rem',
              whiteSpace: 'nowrap',
              zIndex: 1000,
            }}
          >
            Scientific publication citing the service.
          </div>,
          document.body
        )}
    </div>
  );
}
