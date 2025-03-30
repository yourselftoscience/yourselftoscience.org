'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactCountryFlag from 'react-country-flag';
import { resources, citationMap } from '@/data/resources.js';
import Select, { components } from 'react-select';
import {
  FaArrowRight,
  FaMobileAlt,
  FaCog,
  FaUserShield,
  FaSortAlphaDown,
  FaSortAlphaUp,
} from 'react-icons/fa';

const EU_COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden'
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
    // remove any invalid key like "label"
  }),
  option: (provided, state) => ({
    ...provided,
    border: 'none',
    borderRadius: 0,
    borderBottom: '1px solid #D1D5DB',
    margin: 0,
    padding: '8px',
    cursor: 'pointer',
    backgroundColor:
      state.isSelected || state.isFocused ? '#E5E7EB' : 'white',
    color: 'black',
    ':hover': {
      backgroundColor: '#E5E7EB',
    },
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

// Update the ResourceTable component to not require citationMap as a prop
export default function ResourceTable({ filteredResources: initialResources }) {
  // State for filters, sorting, and tooltip
  const [filters, setFilters] = useState({ dataTypes: [], countries: [] });
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

  // Custom styles for react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: 'white',
      borderColor: '#D1D5DB',
      // remove any invalid key like "label"
    }),
    // Only keep a horizontal border: remove left/right borders entirely
    option: (provided, state) => ({
      ...provided,
      border: 'none',
      borderRadius: 0,
      borderBottom: '1px solid #D1D5DB', // Horizontal line separating each option
      margin: 0,
      padding: '8px',
      cursor: 'pointer',
      backgroundColor: state.isSelected
        ? '#E5E7EB'
        : state.isFocused
        ? '#E5E7EB'
        : 'white',
      color: 'black',
      ':hover': {
        backgroundColor: '#E5E7EB',
      },
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
          <ReactCountryFlag
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
          <ReactCountryFlag
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
          <ReactCountryFlag
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

    return data;
  }

  // Collect all citations from filtered resources
  const allCitations = processedResources.flatMap((resource) => resource.citations || []);

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
          components={{
            Option: OptionComponent,
            MultiValueLabel: MultiValueLabelComponent,
            SingleValue: SingleValueComponent,
          }}
          placeholder="Exclude services not available in:"
        />
      </div>

      {/* Resource Table */}
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
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
            </tr>
          </thead>
          <tbody>
            {processedResources.length > 0 ? (
              processedResources.map((resource, index) => (
                <tr
                  key={resource.id}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-100`}
                >
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
                            <ReactCountryFlag
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
                    {resource.citations && resource.citations.length > 0 ? (
                      resource.citations.map((citation, idx) => {
                        // Generate the same key used in page.js
                        const key = citation.link ? citation.link.trim() : citation.title.trim();
                        const citationNumber = citationMap[key];
                        
                        console.log(`Resource: ${resource.title}, Citation: ${citation.title.substring(0, 30)}..., Number: ${citationNumber}`);
                        
                        return (
                          <React.Fragment key={idx}>
                            <a
                              href={`#ref-${citationNumber}`}
                              className="text-blue-600 hover:underline"
                            >
                              [{citationNumber}]
                            </a>
                            {idx < resource.citations.length - 1 && ' - '}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      '' /* leave blank when no citation is specified */
                    )}
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
