// src/components/ResourceTable.js

'use client';

import { useState, useEffect } from 'react';
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

export default function ResourceTable() {
  // State for filters
  const [filters, setFilters] = useState({ dataTypes: [], countries: [] });

  // State for sorting
  const [sortColumn, setSortColumn] = useState('title'); // Default sort by Title
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Dynamic data type options
  const dataTypeOptions = Array.from(
    new Set(resources.flatMap((resource) => resource.dataTypes))
  ).map((dataType) => ({ label: dataType, value: dataType }));

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
  const filteredResources = resources
    .filter((resource) => {
      // Data Type Filtering
      const matchesDataType =
        filters.dataTypes.length > 0
          ? resource.dataTypes.some((type) =>
              filters.dataTypes.some((option) => option.value === type)
            )
          : true;

      // Country Exclusion Filtering
      const isExcludedCountry =
        filters.countries.length > 0 && resource.countries
          ? resource.countries.some((country) =>
              filters.countries.some((option) => option.value === country)
            )
          : false;

      // Include resources without country limitations
      const includeResource = resource.countries ? !isExcludedCountry : true;

      return matchesDataType && includeResource;
    })
    .sort((a, b) => {
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
    control: (provided) => ({
      ...provided,
      backgroundColor: 'white',
      borderColor: '#D1D5DB',
      color: 'black',
    }),
    option: (provided, state) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: 'black',
      backgroundColor: state.isFocused ? '#E5E7EB' : 'white',
      cursor: 'pointer',
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
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="flex items-center justify-between"
      >
        <span className="text-black">{data.label}</span>
        {data.code && (
          <ReactCountryFlag
            countryCode={data.code}
            svg
            style={{
              width: '1.5em',
              height: '1em',
            }}
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
          styles={customStyles}
          components={{
            Option: OptionComponent,
            MultiValueLabel: MultiValueLabelComponent,
            SingleValue: SingleValueComponent,
          }}
          placeholder="Exclude services only available in:"
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
                  key={index}
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
                    {resource.dataTypes.join(', ')}
                  </td>

                  {/* Only Available In Column */}
                  <td className="py-2 px-4 border-b border-r border-gray-300 text-black align-top">
                    {resource.countries ? (
                      <div className="flex flex-wrap items-center justify-center space-x-4">
                        {resource.countries.map((country, idx) => (
                          <div key={idx} className="flex items-center">
                            <span>{country}</span>
                            {resource.countryCodes &&
                              resource.countryCodes[idx] && (
                                <ReactCountryFlag
                                  countryCode={resource.countryCodes[idx]}
                                  svg
                                  style={{
                                    width: '1.5em',
                                    height: '1em',
                                    marginLeft: '0.5em',
                                  }}
                                  title={country}
                                />
                              )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Add a non-breaking space to maintain cell height
                      <span>&nbsp;</span>
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
