import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CountryFlag from 'react-country-flag';

export default function FilterGroup({
    title,
    options,
    filterKey,
    selectedValues = [],
    onFilterChange,
    onSelectAll, // Add this prop
    config = {}
}) {
    const { alwaysExpanded = false, columns = 1, HeadingTag = 'h2' } = config || {};
    const [showMore, setShowMore] = useState(false);

    const visibleOptions = alwaysExpanded || showMore ? options : options.slice(0, 3);
    const showClearAll = selectedValues.length > 1;

    const optionLayoutClass = columns > 1
        ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
        : 'space-y-2';


    // To keep it simple and avoid changing too much logic, I will accept `onSelectAll` prop.

    return (
        <div className="mb-6">
            <HeadingTag className="font-semibold text-base text-slate-900 mb-1">{title}</HeadingTag>
            <button
                onClick={() => onSelectAll && onSelectAll(!showClearAll)}
                className="text-xs font-semibold text-google-blue hover:underline mb-3 block"
                aria-label={showClearAll ? `Clear all ${title} ` : `Select all ${title} `}
            >
                {showClearAll ? 'Clear all' : 'Select all'}
            </button>

            <div className={optionLayoutClass}>
                {visibleOptions.map(option => {
                    const value = typeof option === 'string' ? option : option.value;
                    const label = typeof option === 'string' ? option : option.label;
                    const code = typeof option === 'object' ? option.code : null;
                    const emoji = typeof option === 'object' ? option.emoji : null;
                    const idSuffix = alwaysExpanded ? 'desktop' : 'mobile';

                    let isChecked = false;
                    if (filterKey === 'countries') {
                        isChecked = selectedValues.includes(value);
                    } else if (filterKey === 'compensationTypes') {
                        isChecked = selectedValues.some(p => p.value === value);
                    } else {
                        isChecked = selectedValues.includes(value);
                    }

                    // Define category styles locally to match ResourceCard
                    const categoryStyles = {
                        'Organ, Body & Tissue Donation': 'bg-rose-100 text-rose-800 border-rose-200',
                        'Biological Samples': 'bg-blue-100 text-blue-800 border-blue-200',
                        'Clinical Trials': 'bg-green-100 text-green-800 border-green-200',
                        'Health & Digital Data': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    };

                    let itemClass = "flex items-center gap-3 rounded-2xl border px-3 py-2 shadow-[0_5px_20px_rgba(15,23,42,0.06)] transition-colors cursor-pointer ";

                    if (filterKey === 'macroCategories' && categoryStyles[value]) {
                        // Apply specific category style if it's a macro category
                        itemClass += categoryStyles[value] + (isChecked ? " ring-2 ring-offset-1 ring-slate-400" : " hover:opacity-80");
                    } else {
                        // Default style for other filters
                        itemClass += "border-white/60 bg-white/70 hover:bg-white/90 hover:border-white/80";
                    }

                    return (
                        <label
                            key={value}
                            htmlFor={`${filterKey}-${value}-${idSuffix}`}
                            className={itemClass}
                        >
                            <input
                                type="checkbox"
                                id={`${filterKey}-${value}-${idSuffix}`}
                                value={value}
                                checked={isChecked}
                                onChange={(e) => onFilterChange(filterKey, value, e.target.checked)}
                                className="h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 focus:ring-offset-0 focus:ring-1"
                            />
                            <span className={`flex items-center gap-2 text-sm sm:text-base font-medium ${filterKey === 'macroCategories' ? 'text-inherit' : 'text-slate-800'}`}>
                                {emoji && <span className="text-base sm:text-lg leading-none">{emoji}</span>}
                                {label}
                                {code && (
                                    <CountryFlag
                                        countryCode={code}
                                        svg
                                        aria-label={label}
                                        style={{ width: '1.1em', height: '0.9em', display: 'inline-block', verticalAlign: 'middle' }}
                                    />
                                )}
                            </span>
                        </label>
                    );
                })}
            </div>

            {options.length > 3 && !alwaysExpanded && (
                <button onClick={() => setShowMore(!showMore)} className="text-sm font-medium text-google-blue hover:underline mt-1 flex items-center">
                    <svg className={`w-3 h-3 mr-1 transform transition-transform ${showMore ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    {showMore ? 'Less' : `More (${options.length - 3})`}
                </button>
            )}
        </div>
    );
}

FilterGroup.propTypes = {
    title: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                value: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired,
                code: PropTypes.string,
                emoji: PropTypes.string
            })
        ])
    ).isRequired,
    filterKey: PropTypes.string.isRequired,
    selectedValues: PropTypes.array,
    onFilterChange: PropTypes.func.isRequired,
    onSelectAll: PropTypes.func,
    config: PropTypes.shape({
        alwaysExpanded: PropTypes.bool,
        columns: PropTypes.number,
        HeadingTag: PropTypes.string
    })
};
