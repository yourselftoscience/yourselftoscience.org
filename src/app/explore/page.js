// src/app/explore/page.js
'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { activeResources as allResources } from '@/data/resources';
import Link from 'next/link';
import CountryFlag from 'react-country-flag';
import {
  FaSort, FaSortUp, FaSortDown,
  FaDownload, FaSearch, FaTimes, FaColumns,
  FaExternalLinkAlt, FaChevronDown, FaTable, FaDatabase,
  FaFilter, FaArrowRight, FaChartBar
} from 'react-icons/fa';

// --- Column Definitions ---
const ALL_COLUMNS = [
  { key: 'title', label: 'Resource', sticky: true, minWidth: '240px' },
  { key: 'organizations', label: 'Organization', minWidth: '220px' },
  { key: 'rorId', label: 'ROR ID', minWidth: '130px' },
  { key: 'origin', label: 'HQ Location', minWidth: '140px' },
  { key: 'entityCategory', label: 'Sector', minWidth: '120px' },
  { key: 'entitySubType', label: 'Entity Type', minWidth: '160px' },
  { key: 'dataTypes', label: 'Data Types', minWidth: '180px' },
  { key: 'compensationType', label: 'Compensation', minWidth: '130px' },
  { key: 'countries', label: 'Available In', minWidth: '160px' },
  { key: 'compatibleSources', label: 'Compatible Sources', minWidth: '160px' },
  { key: 'citations', label: 'Citations', minWidth: '100px' },
];

const DEFAULT_VISIBLE = new Set([
  'title', 'organizations', 'origin', 'entityCategory',
  'dataTypes', 'compensationType', 'countries'
]);

// --- Helpers ---
function getNestedValue(resource, key) {
  switch (key) {
    case 'organizations':
      return (resource.organizations || []).map(o => o.name).join(', ');
    case 'dataTypes':
      return (resource.dataTypes || []).join(', ');
    case 'countries':
      return (resource.countries || []).length === 0 ? 'Worldwide' : resource.countries.join(', ');
    case 'compatibleSources':
      return (resource.compatibleSources || []).join(', ');
    case 'citations':
      return (resource.citations || []).length;
    case 'rorId':
      return (resource.organizations || []).map(o => o.rorId).filter(Boolean).join(', ');
    default:
      return resource[key] || '';
  }
}

function getSortValue(resource, key) {
  const val = getNestedValue(resource, key);
  if (typeof val === 'number') return val;
  return String(val).toLowerCase();
}

// --- Filter Dropdown ---
function FilterDropdown({ label, options, selected, onToggle, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  React.useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
          ${selected.size > 0
            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
      >
        <FaFilter className="w-2.5 h-2.5" />
        {label}
        {selected.size > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
            {selected.size}
          </span>
        )}
        <FaChevronDown className={`w-2.5 h-2.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
          {selected.size > 0 && (
            <button
              onClick={onClear}
              className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 font-medium"
            >
              Clear all
            </button>
          )}
          {options.map(opt => (
            <label
              key={opt}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.has(opt)}
                onChange={() => onToggle(opt)}
                className="h-3.5 w-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="truncate">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Column Visibility Toggle ---
function ColumnToggle({ columns, visible, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  React.useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <FaColumns className="w-3 h-3" />
        Columns
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
          {columns.map(col => (
            <label
              key={col.key}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visible.has(col.key)}
                onChange={() => onToggle(col.key)}
                disabled={col.sticky}
                className="h-3.5 w-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-40"
              />
              <span className={col.sticky ? 'text-slate-400' : ''}>{col.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Compensation Badge ---
function CompensationCell({ type }) {
  const config = {
    donation: { label: 'Donation', emoji: '❤️', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
    payment: { label: 'Payment', emoji: '💲', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    mixed: { label: 'Mixed', emoji: '❤️💲', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  };
  const c = config[type] || config.donation;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${c.cls}`}>
      <span>{c.emoji}</span>{c.label}
    </span>
  );
}

// --- CSV Export ---
function exportCSV(resources, visibleColumns) {
  const cols = ALL_COLUMNS.filter(c => visibleColumns.has(c.key));
  const header = cols.map(c => c.label).join(',');
  const rows = resources.map(r =>
    cols.map(c => {
      const val = getNestedValue(r, c.key);
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yourselftoscience_explore_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Main Page ---
export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [visibleCols, setVisibleCols] = useState(new Set(DEFAULT_VISIBLE));

  // Filter states
  const [sectorFilter, setSectorFilter] = useState(new Set());
  const [dataTypeFilter, setDataTypeFilter] = useState(new Set());
  const [compensationFilter, setCompensationFilter] = useState(new Set());
  const [originFilter, setOriginFilter] = useState(new Set());

  // Derive filter options from data
  const filterOptions = useMemo(() => {
    const sectors = new Set();
    const dataTypes = new Set();
    const compensations = new Set();
    const origins = new Set();

    allResources.forEach(r => {
      if (r.entityCategory) sectors.add(r.entityCategory);
      (r.dataTypes || []).forEach(d => dataTypes.add(d.startsWith('Wearable data') ? 'Wearable data' : d));
      if (r.compensationType) compensations.add(r.compensationType);
      if (r.origin) origins.add(r.origin);
    });

    return {
      sectors: [...sectors].sort(),
      dataTypes: [...dataTypes].sort(),
      compensations: [...compensations].sort(),
      origins: [...origins].sort(),
    };
  }, []);

  const toggleFilter = useCallback((setter, value) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }, []);

  // Filtered + sorted resources
  const processed = useMemo(() => {
    let data = [...allResources];

    // Text search across all fields
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(r =>
        ALL_COLUMNS.some(col => {
          const val = getNestedValue(r, col.key);
          return String(val).toLowerCase().includes(lower);
        })
      );
    }

    // Apply filters
    if (sectorFilter.size > 0) {
      data = data.filter(r => r.entityCategory && sectorFilter.has(r.entityCategory));
    }
    if (dataTypeFilter.size > 0) {
      data = data.filter(r =>
        (r.dataTypes || []).some(d => {
          const normalized = d.startsWith('Wearable data') ? 'Wearable data' : d;
          return dataTypeFilter.has(normalized);
        })
      );
    }
    if (compensationFilter.size > 0) {
      data = data.filter(r => r.compensationType && compensationFilter.has(r.compensationType));
    }
    if (originFilter.size > 0) {
      data = data.filter(r => r.origin && originFilter.has(r.origin));
    }

    // Sort
    data.sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [searchTerm, sortKey, sortDir, sectorFilter, dataTypeFilter, compensationFilter, originFilter]);

  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  const handleColumnToggle = useCallback((key) => {
    setVisibleCols(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const activeFilterCount = sectorFilter.size + dataTypeFilter.size + compensationFilter.size + originFilter.size;

  const clearAllFilters = useCallback(() => {
    setSectorFilter(new Set());
    setDataTypeFilter(new Set());
    setCompensationFilter(new Set());
    setOriginFilter(new Set());
    setSearchTerm('');
  }, []);

  const displayedColumns = ALL_COLUMNS.filter(c => visibleCols.has(c.key));

  return (
    <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                <FaTable className="text-white text-lg" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Data Explorer</h1>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl">
              Interactive database view for technical users, including researchers, investors, and policy makers. Filter, sort, and export the complete catalogue.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <FaDatabase className="w-3 h-3" /> APIs & Integrations
            </Link>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 mb-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search across all fields..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 placeholder-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Sector"
              options={filterOptions.sectors}
              selected={sectorFilter}
              onToggle={(v) => toggleFilter(setSectorFilter, v)}
              onClear={() => setSectorFilter(new Set())}
            />
            <FilterDropdown
              label="Data Type"
              options={filterOptions.dataTypes}
              selected={dataTypeFilter}
              onToggle={(v) => toggleFilter(setDataTypeFilter, v)}
              onClear={() => setDataTypeFilter(new Set())}
            />
            <FilterDropdown
              label="Compensation"
              options={filterOptions.compensations}
              selected={compensationFilter}
              onToggle={(v) => toggleFilter(setCompensationFilter, v)}
              onClear={() => setCompensationFilter(new Set())}
            />
            <FilterDropdown
              label="HQ Location"
              options={filterOptions.origins}
              selected={originFilter}
              onToggle={(v) => toggleFilter(setOriginFilter, v)}
              onClear={() => setOriginFilter(new Set())}
            />

            <div className="w-px h-6 bg-slate-200 hidden lg:block" />

            <ColumnToggle
              columns={ALL_COLUMNS}
              visible={visibleCols}
              onToggle={handleColumnToggle}
            />

            <button
              onClick={() => exportCSV(processed, visibleCols)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaDownload className="w-3 h-3" /> Export CSV
            </button>
          </div>
        </div>

        {/* Active filter summary */}
        {(activeFilterCount > 0 || searchTerm) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              <strong className="text-slate-900 text-sm">{processed.length}</strong> of {allResources.length} resources
            </span>
            {activeFilterCount > 0 && (
              <>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-blue-600 font-medium">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
              </>
            )}
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {displayedColumns.map(col => (
                  <th
                    key={col.key}
                    className="px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none transition-colors whitespace-nowrap"
                    style={{ minWidth: col.minWidth }}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />
                      ) : (
                        <FaSort className="text-slate-300" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processed.length === 0 ? (
                <tr>
                  <td colSpan={displayedColumns.length} className="px-4 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <FaSearch className="w-8 h-8 text-slate-200" />
                      <p className="text-sm font-medium">No resources match your filters</p>
                      <button onClick={clearAllFilters} className="text-xs text-blue-600 hover:underline">
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                processed.map(resource => (
                  <tr
                    key={resource.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {displayedColumns.map(col => (
                      <td key={col.key} className="px-4 py-3 align-top">
                        {col.key === 'title' ? (
                          <div>
                            <Link
                              href={`/resource/${resource.id}`}
                              className="font-medium text-slate-900 hover:text-blue-600 transition-colors group-hover:text-blue-600"
                            >
                              {resource.title}
                            </Link>
                            {resource.link && (
                              <a
                                href={resource.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1.5 inline-flex text-slate-300 hover:text-blue-500 transition-colors"
                                title="Open external link"
                              >
                                <FaExternalLinkAlt className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        ) : col.key === 'organizations' ? (
                          <div className="flex flex-col gap-1">
                            {(resource.organizations || []).map((o, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                                <span className="text-slate-600 text-xs truncate">{o.name}</span>
                                {o.rorId && (
                                  <a 
                                    href={o.rorId} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    title="View on ROR"
                                    className="text-[9px] text-blue-500 hover:text-blue-700 bg-blue-50 px-1 py-0 rounded border border-blue-100 uppercase font-bold"
                                  >
                                    ROR
                                  </a>
                                )}
                              </div>
                            ))}
                            {(!resource.organizations || resource.organizations.length === 0) && '—'}
                          </div>
                        ) : col.key === 'rorId' ? (
                          <div className="flex flex-col gap-1">
                             {(resource.organizations || []).map((o, idx) => o.rorId ? (
                               <a key={idx} href={o.rorId} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-blue-600 hover:underline">
                                 {o.rorId.split('/').pop()}
                               </a>
                             ) : null)}
                          </div>
                        ) : col.key === 'origin' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                            {resource.originCode && (
                              <CountryFlag
                                countryCode={resource.originCode}
                                svg
                                aria-hidden="true"
                                style={{ width: '1.1em', height: '0.8em' }}
                              />
                            )}
                            {resource.origin || '—'}
                          </span>
                        ) : col.key === 'entityCategory' ? (
                          <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md border
                            ${resource.entityCategory === 'Commercial'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : resource.entityCategory === 'Academic'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : resource.entityCategory === 'Government'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                                  : resource.entityCategory === 'Non-Profit'
                                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {resource.entityCategory || '—'}
                          </span>
                        ) : col.key === 'entitySubType' ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-500">{resource.entitySubType || '—'}</span>
                            {resource.organizations?.some(o => o.rorTypes) && (
                              <div className="flex flex-wrap gap-1">
                                {Array.from(new Set(resource.organizations.flatMap(o => o.rorTypes || []))).map(t => (
                                  <span key={t} className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1 py-0 rounded font-medium">
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : col.key === 'dataTypes' ? (
                          <div className="flex flex-wrap gap-1">
                            {(resource.dataTypes || []).map(d => (
                              <span key={d} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {d}
                              </span>
                            ))}
                          </div>
                        ) : col.key === 'compensationType' ? (
                          <CompensationCell type={resource.compensationType} />
                        ) : col.key === 'countries' ? (
                          <span className="text-xs text-slate-500">
                            {(resource.countries || []).length === 0 ? 'Worldwide' : resource.countries.join(', ')}
                          </span>
                        ) : col.key === 'compatibleSources' ? (
                          <div className="flex flex-wrap gap-1">
                            {(resource.compatibleSources || []).map(s => (
                              <span key={s} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                            {(!resource.compatibleSources || resource.compatibleSources.length === 0) && (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </div>
                        ) : col.key === 'citations' ? (
                          <span className="text-xs text-slate-500 font-mono">
                            {(resource.citations || []).length || '—'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {String(getNestedValue(resource, col.key)) || '—'}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{processed.length}</strong> of <strong className="text-slate-700">{allResources.length}</strong> resources
          </span>
          <div className="flex items-center gap-3">
            <span>
              Dataset: <a href="/resources.json" className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">JSON</a>
              {' · '}
              <a href="/resources.csv" className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">CSV</a>
              {' · '}
              <a href="/resources.ttl" className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">RDF</a>
            </span>
          </div>
        </div>
      </div>

      {/* Technical Data Hub CTA */}
      <div className="mt-8 bg-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Technical Hub & Project Analytics</h2>
            <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
              Seeking data on research participation and resource distribution? Access our analytics for project statistics and standardized endpoints used by researchers and policy makers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <Link
              href="/stats"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <FaChartBar className="w-4 h-4 text-blue-600" /> View Project Analytics
            </Link>
            <Link
              href="/data"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <FaDatabase className="w-3 h-3" /> Data Infrastructure
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
