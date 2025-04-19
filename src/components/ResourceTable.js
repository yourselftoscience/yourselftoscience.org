'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import CountryFlag from 'react-country-flag';
import { FaMobileAlt, FaCog, FaUserShield, FaArrowRight, FaSortAlphaDown, FaSortAlphaUp, FaHeart, FaDollarSign } from 'react-icons/fa';
import { resources as allResources, citationMap, uniqueCitations } from '@/data/resources';
import { components as ReactSelectComponents } from 'react-select';

const Select = dynamic(() => import('react-select'), { 
  ssr: false 
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

  if (hasEU) {
    EU_COUNTRIES.forEach((c) => set.add(c));
  }
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
    borderRadius: '0.375rem',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.75rem',
    border: '1px solid #D1D5DB',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    overflow: 'hidden',
  }),
  option: (provided, state) => ({
    ...provided,
    border: 'none',
    borderBottom: '1px solid #E5E7EB',
    margin: 0,
    padding: '10px 12px',
    cursor: 'pointer',
    backgroundColor:
      state.isSelected ? '#DBEAFE' : state.isFocused ? '#F3F4F6' : 'white',
    color: 'black',
    ':hover': {
      backgroundColor: '#F3F4F6',
    },
    ':last-child': {
        borderBottom: 'none',
    },
  }),
  menuList: (provided) => ({
    ...provided,
    paddingTop: 0,
    paddingBottom: 0,
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

export default function ResourceTable({ filteredResources: initialResources }) {
  const [filters, setFilters] = useState({ 
    dataTypes: [], 
    countries: [],
    paymentTypes: []
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

  useEffect(() => {
    if ((hoverTooltip || forceTooltip) && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, [hoverTooltip, forceTooltip]);

  const dataTypeOptions = useMemo(() => Array.from(
    new Set(allResources.flatMap((resource) => resource.dataTypes || []))
  )
    .sort((a, b) => a.localeCompare(b))
    .map((dataType) => ({ label: dataType, value: dataType })), []);

  const countryOptions = useMemo(() => {
    const options = [];
    const countryMap = new Map();
    allResources.forEach((resource) => {
      if (resource.countries && resource.countryCodes) {
        resource.countries.forEach((country, index) => {
          if (!countryMap.has(country)) {
            countryMap.set(country, resource.countryCodes[index]);
            options.push({ label: country, value: country, code: resource.countryCodes[index] });
          }
        });
      } else if (resource.countries) {
        resource.countries.forEach(country => {
          if (!countryMap.has(country)) {
            countryMap.set(country, null);
            options.push({ label: country, value: country, code: null });
          }
        });
      }
    });
    if (!countryMap.has('European Union') && allResources.some(r => r.countries?.includes('European Union'))) {
         options.push({ label: 'European Union', value: 'European Union', code: 'EU' });
    }
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, []);

  const processedResources = useMemo(() => {
    console.log("START: Recalculating processedResources. Filters:", filters);
    let filteredData = [...initialResources];

    if (filters.dataTypes.length) {
      const chosenTypes = filters.dataTypes.map((t) => t.value);
      filteredData = filteredData.filter((resource) =>
        resource.dataTypes?.some((dt) => chosenTypes.includes(dt))
      );
    }

    const chosenCountryValues = filters.countries.map((c) => c.value);
    if (chosenCountryValues.length > 0) {
        console.log("Filtering by countries:", chosenCountryValues);
        const expandedCountries = expandCountries(chosenCountryValues);
        console.log("Expanded countries:", expandedCountries);
        filteredData = filteredData.filter((resource) => {
            if (!resource.countries || resource.countries.length === 0) {
            return true;
            }
            return resource.countries.some((resourceCountry) => expandedCountries.includes(resourceCountry));
        });
    }

    if (filters.paymentTypes.length) {
      const chosenTypes = filters.paymentTypes.map((t) => t.value);
      filteredData = filteredData.filter((resource) => {
        const type = resource.paymentType || 'donation';
        if (type === 'mixed') {
          return chosenTypes.includes('mixed') || chosenTypes.includes('donation') || chosenTypes.includes('payment');
        }
        return chosenTypes.includes(type);
      });
    }

    console.log("Sorting by:", sortColumn, sortOrder);
    filteredData.sort((a, b) => {
      let valueA = a[sortColumn] || '';
      let valueB = b[sortColumn] || '';

      if (sortColumn === 'country') {
         valueA = a.countries?.join(', ') || '';
         valueB = b.countries?.join(', ') || '';
      }
      if (sortColumn === 'dataType') {
         valueA = a.dataTypes?.sort().join(', ') || '';
         valueB = b.dataTypes?.sort().join(', ') || '';
      }
      if (sortColumn === 'access') {
        valueA = a.link ? 1 : a.instructions ? 2 : 3;
        valueB = b.link ? 1 : b.instructions ? 2 : 3;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
         valueA = valueA.toLowerCase();
         valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    console.log("END: Recalculating processedResources. Count:", filteredData.length);
    return filteredData;
  }, [initialResources, filters, sortColumn, sortOrder]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  function handleToggleDataType(dataType) {
    setFilters((prev) => {
      const currentSelected = prev.dataTypes.map((dt) => dt.value);
      if (currentSelected.includes(dataType)) {
        return {
          ...prev,
          dataTypes: prev.dataTypes.filter((dt) => dt.value !== dataType),
        };
      } else {
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

  function handleToggleCountry(country, code) {
    console.log("Toggling country:", country);
    setFilters((prev) => {
      const currentSelectedOptions = prev.countries;
      const isCurrentlySelected = currentSelectedOptions.some(c => c.value === country);
      let newCountries;

      if (isCurrentlySelected) {
        newCountries = currentSelectedOptions.filter((c) => c.value !== country);
      } else {
        const countryToAdd = countryOptions.find(opt => opt.value === country);
        if (countryToAdd) {
           newCountries = [...currentSelectedOptions, countryToAdd];
        } else {
          console.warn(`Country option not found: ${country}`);
          newCountries = currentSelectedOptions;
        }
      }

      newCountries.sort((a, b) => a.label.localeCompare(b.label));

      return {
        ...prev,
        countries: newCountries,
      };
    });
  }

  function arraysHaveSameElements(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  }

  function handleSetPaymentTypes(typesToSet) {
    setFilters(prev => {
      const currentSelectedValues = prev.paymentTypes.map(pt => pt.value);
      
      if (arraysHaveSameElements(currentSelectedValues, typesToSet)) {
        return {
          ...prev,
          paymentTypes: [] 
        };
      } else {
        const selectedOptions = PAYMENT_TYPES.filter(pt => typesToSet.includes(pt.value));
        return {
          ...prev,
          paymentTypes: selectedOptions
        };
      }
    });
  }

  const OptionComponent = (props) => {
    const { data, innerRef, innerProps, isFocused, isSelected } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          border: 'none',
          borderBottom: '1px solid #D1D5DB',
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

  const MultiValueLabelComponent = (props) => {
    const { data } = props;
    return (
      <ReactSelectComponents.MultiValueLabel {...props}>
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
      </ReactSelectComponents.MultiValueLabel>
    );
  };

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

  const components = {
    Option: OptionComponent,
    MultiValueLabel: MultiValueLabelComponent,
    SingleValue: SingleValueComponent,
  };

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

  const allCitations = processedResources.flatMap((resource) => resource.citations || []);

  const renderCitations = (resourceCitations) => {
    if (!resourceCitations || resourceCitations.length === 0) return null;
    
    return resourceCitations.map((citation, idx) => {
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
      <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
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

        <Select
          options={countryOptions}
          value={filters.countries}
          onChange={(selectedOptions) =>
            setFilters({ ...filters, countries: selectedOptions || [] })
          }
          isMulti
          styles={customStyles}
          components={components}
          placeholder="Exclude services not available in:"
        />

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

      <div className="overflow-x-auto overflow-y-visible rounded-lg">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden"><thead><tr>
              <th
                className="py-2 px-4 border-b border-r border-gray-300 text-black cursor-pointer select-none"
                onClick={() => handleSort('paymentType')}
              >
                Compensation {getSortIcon('paymentType')}
              </th>

              <th
                className="py-2 px-4 border-b border-r border-gray-300 text-black cursor-pointer select-none"
                onClick={() => handleSort('title')}
              >
                Title {getSortIcon('title')}
              </th>

              <th
                className="py-2 px-4 border-b border-r border-gray-300 text-black cursor-pointer select-none"
                onClick={() => handleSort('access')}
              >
                Access {getSortIcon('access')}
              </th>

              <th
                className="py-2 px-4 border-b border-r border-gray-300 text-black cursor-pointer select-none"
                onClick={() => handleSort('dataType')}
              >
                Data Type {getSortIcon('dataType')}
              </th>

              <th
                className="py-2 px-4 border-b border-r border-gray-300 text-black cursor-pointer select-none"
                onClick={() => handleSort('country')}
              >
                Only available in {getSortIcon('country')}
              </th>

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
            </tr></thead><tbody>
            {processedResources.length > 0 ? (
              processedResources.map((resource, index) => (
                <tr
                  key={resource.id}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-100`}
                >
                  <td className="py-2 px-4 border-b border-r border-gray-300 text-black align-top text-center">
                    {getPaymentEmoji(resource.paymentType || 'donation')}
                  </td>

                  <td className="py-2 px-4 border-b border-r border-gray-300 text-black align-top">
                    {resource.title}
                  </td>

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
                              <span className="mr-2 font-semibold text-gray-800">
                                {idx + 1}.
                              </span>
                              {getStepIcon(step)}
                              <span className="ml-2">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>

                  <td className="py-2 px-4 border-b border-r border-gray-300 text-black align-top">
                    {resource.dataTypes
                      ?.sort((a, b) => a.localeCompare(b))
                      .map((dataType, idx) => {
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

                  <td className="py-2 px-4 border-b border-r border-gray-300 text-black align-top">
                    {resource.countries?.map((country, idx) => {
                      const isActive = filters.countries.some((c) => c.value === country);
                      const countryCode = resource.countryCodes?.[idx];
                      return (
                        <button
                          key={idx}
                          onClick={() => handleToggleCountry(country, countryCode)}
                          className={
                            isActive
                              ? "bg-blue-500 text-white px-2 py-1 rounded mr-2 mb-2 inline-flex items-center"
                              : "bg-gray-200 text-black px-2 py-1 rounded mr-2 mb-2 hover:bg-gray-300 inline-flex items-center"
                          }
                        >
                          <span>{country}</span>
                          {countryCode && (
                            <CountryFlag
                              countryCode={countryCode}
                              svg
                              style={{ width: "1.2em", height: "0.9em", marginLeft: "0.4em" }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </td>

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
