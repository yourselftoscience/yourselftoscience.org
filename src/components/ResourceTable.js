// src/components/ResourceTable.js

'use client';

import React, { useState, useEffect } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { resources } from '../data/resources';
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

export default function ResourceTable() {
  // State for filters
  const [filters, setFilters] = useState({ dataTypes: [], countries: [] });

  // State for sorting
  const [sortColumn, setSortColumn] = useState('title'); // Default sort by Title
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Dynamic data type options
  const dataTypeOptions = Array.from(
    new Set(resources.flatMap((resource) => resource.dataTypes))
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

  // Sorting and filtering logic
  const filteredResources = filterResources(resources).sort((a, b) => {
    // Sorting logic based on sortColumn and sortOrder
    let valueA, valueB;

    switch (sortColumn) {
      case 'title':
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case 'access':
        // For access, prioritize link over instructions
        valueA = a.link
          ? '0' + a.link.toLowerCase()
          : a.instructions
          ? '1' + a.instructions.join(' ').toLowerCase()
          : '2';
        valueB = b.link
          ? '0' + b.link.toLowerCase()
          : b.instructions
          ? '1' + b.instructions.join(' ').toLowerCase()
          : '2';
        break;
      case 'dataType':
        valueA = a.dataTypes.join(', ').toLowerCase();
        valueB = b.dataTypes.join(', ').toLowerCase();
        break;
      case 'country':
        valueA = a.countries ? a.countries.join(', ').toLowerCase() : '';
        valueB = b.countries ? b.countries.join(', ').toLowerCase() : '';
        break;
      default:
        valueA = '';
        valueB = '';
    }

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
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'white',
      borderColor: '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 1px #D1D5DB' : 'none',
      '&:hover': { borderColor: '#B0B0B0' },
    }),
    // Options: Remove left/right borders and show only a bottom border.
    option: (provided, state) => ({
      ...provided,
      border: 'none',
      borderBottom: '1px solid #D1D5DB',
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

  // Update the exclusionCustomStyles to remove vertical borders (use only a bottom border)
  const exclusionCustomStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'white',
      borderColor: '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 1px #D1D5DB' : 'none',
      '&:hover': { borderColor: '#B0B0B0' },
    }),
    option: (provided, state) => ({
      ...provided,
      border: 'none',
      borderBottom: '1px solid #D1D5DB',
      margin: 0,
      padding: '8px',
      cursor: 'pointer',
      backgroundColor: state.isSelected || state.isFocused ? '#E5E7EB' : 'white',
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
          borderBottom: '1px solid #D1D5DB',
          margin: 0,
          padding: '8px',
          cursor: 'pointer',
          backgroundColor: isSelected || isFocused ? '#E5E7EB' : 'white',
          color: 'black',
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
          styles={exclusionCustomStyles}
          components={{
            Option: OptionComponent,
            MultiValueLabel: MultiValueLabelComponent,
            SingleValue: SingleValueComponent,
          }}
          placeholder="Exclude services not available in:"
        />
      </div>

      {/* Resource Table */}
      <div className="overflow-x-auto">
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
            </tr>
          </thead>
          <tbody>
            {filteredResources.length > 0 ? (
              filteredResources.map((resource, index) => (
                <tr
                  key={resource.id}
                  className={`
                    ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100
                  `}
                >
                  {/* Title Column */}
                  <td className="py-2 px-4 border-b border-r border-gray-300 text-black align-top">
                    {resource.title}
                  </td>

                  {/* Access Column */}
                  <td className="py-2 px-4 border-b border-r border-gray-300 align-top">
                    {resource.websiteURL ? (
                      <a
                        href={resource.websiteURL}
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
                        const isActive = filters.dataTypes.some((option) => option.value === dataType);
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
                    {resource.countries && resource.countries.length > 0 ? (
                      resource.countries.map((country, idx) => (
                        <button
                          key={idx}
                          className="border rounded px-2 py-1 mx-1"
                        >
                          {country}
                          {resource.countryCodes?.[idx] && (
                            <ReactCountryFlag
                              countryCode={resource.countryCodes[idx]}
                              svg
                              style={{ width: '1.5em', height: '1em', marginLeft: '0.5em' }}
                              title={country}
                            />
                          )}
                        </button>
                      ))
                    ) : (
                      <span>No countries</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="py-4 px-4 text-center text-gray-500"
                >
                  No resources found for the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
