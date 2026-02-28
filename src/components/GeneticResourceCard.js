'use client';

import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobeAmericas, FaBuilding, FaDna, FaHeartbeat, FaHistory, FaExternalLinkAlt, FaInfoCircle, FaChevronDown, FaDollarSign, FaHeart, FaCheck, FaShareAlt, FaBook } from 'react-icons/fa';
import { EU_COUNTRIES } from '@/data/constants';
import { Popover, Transition } from '@headlessui/react';

/**
 * A specialized, high-fidelity card component for the Genetic Data Donation page.
 * Features a modern "glassmorphism" aesthetic with premium typography and interactions.
 */

function getCitationKey(citation) {
    if (citation && citation.link) {
        return citation.link.trim();
    }
    if (citation && citation.title) {
        return citation.title.trim().toLowerCase().substring(0, 50);
    }
    return null;
}

function CitationsPopover({ resource }) {
    if (!resource || !resource.citations || resource.citations.length === 0) return null;
    return (
        <Popover className="relative flex items-center">
            {({ open }) => (
                <>
                    <Popover.Button
                        className={`
                            flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-xl border shadow-sm transition-transform hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-500/50
                            ${open
                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
                            }
                        `}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`View ${resource.citations.length} ${resource.citations.length === 1 ? 'citation' : 'citations'}`}
                        title="View official sources / citations"
                    >
                        <div className="relative flex items-center justify-center">
                            <FaBook className="w-4 h-4 ml-[-2px]" />
                            <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-700 ring-2 ring-white">
                                {resource.citations.length}
                            </span>
                        </div>
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
                        <Popover.Panel 
                            onClick={(e) => e.stopPropagation()} 
                            className="absolute z-50 bottom-full right-0 mb-2 w-72 max-w-[calc(100vw-2rem)] max-h-60 overflow-y-auto rounded-xl bg-white shadow-2xl ring-1 ring-black/10 focus:outline-none"
                        >
                            <div className="p-3 space-y-2">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                                    Service cited by
                                </h3>
                                <ol className="list-decimal list-inside space-y-1.5">
                                    {resource.citations.map((citation, idx) => {
                                        const key = getCitationKey(citation) || idx;
                                        return (
                                            <li key={key} className="text-xs text-slate-600 leading-relaxed p-1.5 rounded-md hover:bg-slate-50 transition-colors">
                                                {citation.link ? (
                                                    <a
                                                        href={citation.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:underline break-words"
                                                    >
                                                        {citation.title}
                                                    </a>
                                                ) : (
                                                    <span className="break-words">{citation.title}</span>
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

export default function GeneticResourceCard({ resource, selectedServices, onSectorClick, onCompensationClick, selectedCompensation, selectedCountries = [] }) {
    const [isHovered, setIsHovered] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isTargeted, setIsTargeted] = useState(false);
    const hasCitations = resource.citations && resource.citations.length > 0;

    // Watch the URL hash to see if this card is the active target of a deep link
    useEffect(() => {
        const checkTarget = () => {
            if (window.location.hash === `#${resource.slug}`) {
                setIsTargeted(true);
            } else {
                setIsTargeted(false);
            }
        };

        checkTarget(); // Initial check
        window.addEventListener('hashchange', checkTarget);

        return () => window.removeEventListener('hashchange', checkTarget);
    }, [resource.slug]);

    const handleCopyLink = (e) => {
        // We still copy to clipboard natively
        const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${resource.slug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        // Let the default anchor tag href handle the actual scroll organically
    };

    // Helper to get iconography based on data types
    const getDataTypeIcon = (type) => {
        if (type.includes('Genome') || type.includes('DNA')) return <FaDna className="text-indigo-500" />;
        if (type.includes('Health')) return <FaHeartbeat className="text-rose-500" />;
        if (type.includes('Ancestry')) return <FaHistory className="text-amber-500" />;
        return <FaDna className="text-blue-400" />; // Fallback
    };

    const isCommercial = resource.entityCategory === 'Commercial';

    const targetStyles = "border-[2px] border-blue-400 ring-4 ring-blue-500/20 shadow-[0_8px_30px_rgba(59,130,246,0.3)] scale-[1.02] bg-blue-50/40 z-20";
    const idleStyles = "border border-white/60 shadow-md hover:shadow-2xl hover:-translate-y-1.5 bg-white/80";

    return (
        <article
            id={resource.slug}
            className={`group relative flex flex-col h-full backdrop-blur-2xl rounded-[2rem] transition-all duration-500 hover:z-[40] focus-within:z-[40] ${isTargeted ? targetStyles : idleStyles}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Decorative Gradient Background (Subtle) */}
            <div className={`absolute inset-0 rounded-[2rem] overflow-hidden bg-gradient-to-br from-white/40 to-transparent opacity-80 transition-opacity duration-500 ${isHovered ? 'opacity-40' : 'opacity-80'}`} />

            <div className="relative z-10 flex flex-col h-full p-6">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        {/* Sector Badge */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <button
                                onClick={() => onSectorClick && onSectorClick(resource.entityCategory === 'Commercial' ? 'Commercial' : 'Public & Non-Profit')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer text-[9px] font-bold tracking-[0.1em] uppercase border border-blue-200/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                title={`Filter by ${resource.entityCategory === 'Commercial' ? 'Commercial' : 'Non-Profit'} Sector`}
                            >
                                <FaBuilding className="text-blue-400 w-3 h-3" />
                                {resource.entityCategory === 'Commercial' ? 'Commercial' : 'Non-Profit'}
                            </button>
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                            {resource.title}
                        </h2>

                        {resource.organizations?.map((org, idx) => (
                            <div key={idx} className="flex flex-wrap items-center text-sm font-medium text-slate-600 mb-2 gap-y-1">
                                <FaBuilding className="mr-1.5 opacity-60 w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="mr-1.5">{org.name}</span>
                                <span className="text-slate-400 font-normal whitespace-nowrap">
                                    &bull; {resource.origin ? `Based in ${resource.origin}` : 'International'}
                                </span>
                            </div>
                        ))}

                        {/* Data Types (previously removed, now brought back and generalized) */}
                        {/* {resource.dataTypes && resource.dataTypes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 mb-1">
                                {resource.dataTypes.map((type, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/80 text-slate-600 text-[10px] font-semibold border border-slate-200">
                                        {type}
                                    </span>
                                ))}
                            </div>
                        )} */}

                        {/* Conditional Country Availability */}
                        {selectedCountries.filter(c => c !== 'Any Country' && c !== 'Other Country').length > 1 && (
                            <div className="flex items-start gap-1.5 mt-3 mb-1 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-100">
                                <FaGlobeAmericas className="mt-0.5 text-slate-400 w-3 h-3 flex-shrink-0" />
                                <div className="text-[11px] leading-tight text-slate-600">
                                    <span className="font-semibold text-slate-700 mr-1">Available in:</span>
                                    {(() => {
                                        if (!resource.countries || resource.countries.length === 0 || resource.countries.includes('Worldwide')) return 'Worldwide';

                                        const exactMatches = resource.countries.filter(c => selectedCountries.includes(c));
                                        const euMatches = resource.countries.includes('European Union')
                                            ? selectedCountries.filter(c => EU_COUNTRIES.includes(c))
                                            : [];

                                        const combinedMatches = Array.from(new Set([...exactMatches, ...euMatches]));

                                        if (combinedMatches.length > 0) return combinedMatches.join(', ');

                                        // Fallback if no specific matches found but card was rendered
                                        return resource.countries.join(', ');
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Compatibility / Official Badges */}
                        {selectedServices?.length > 0 && selectedServices.map((service, index) => {
                            if (!service) return null;

                            const isOfficialFor = (srv, slug) => {
                                if (!slug) return false;
                                if (srv === '23andMe' && slug === '23andme') return true;
                                if (srv === 'AncestryDNA' && slug === 'ancestry') return true;
                                if (srv === 'MyHeritage' && slug === 'myheritage') return true;
                                if (srv === 'FamilyTreeDNA' && slug.includes('familytreedna')) return true;
                                if (srv === 'tellmeGen' && slug === 'tellmegen') return true;
                                if (srv === 'Sequencing.com' && slug === 'sequencing') return true;
                                return false;
                            };

                            const isOfficial = isOfficialFor(service, resource.slug);
                            const isCompatible = resource.compatibleSources?.includes(service);

                            if (isOfficial) {
                                return (
                                    <div key={`official-${index}`} className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50/80 text-indigo-700 text-[9px] font-bold tracking-[0.05em] uppercase border border-indigo-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] mr-2">
                                        <FaBuilding className="w-2.5 h-2.5" />
                                        Official {service} Project
                                    </div>
                                );
                            }

                            if (isCompatible && (selectedServices.length > 1 || service === 'Other')) {
                                return (
                                    <div key={`compat-${index}`} className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 text-emerald-700 text-[9px] font-bold tracking-[0.05em] uppercase border border-emerald-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] mr-2">
                                        <FaCheck className="w-2.5 h-2.5" />
                                        {service === 'Other' ? 'Accepts VCF Data' : `Accepts ${service} Data`}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>

                    {/* Top Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Compensation Type Indicator */}
                        {(resource.compensationType === 'mixed') ? (
                            <div className="flex items-center gap-1">
                                <button aria-label="Filter by payment" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onCompensationClick) onCompensationClick('payment'); }} className="relative group/icon focus:outline-none cursor-pointer">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border shadow-sm transition-all hover:scale-110 ${selectedCompensation === 'payment' ? 'bg-emerald-200 border-emerald-400 text-emerald-800 ring-2 ring-emerald-400 scale-110' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}><FaDollarSign /></div>
                                    <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all z-50 pointer-events-none"><div className="font-semibold mb-1">Payment</div><div className="text-slate-300 leading-tight">Participants are compensated. Click to filter.</div></div>
                                </button>
                                <button aria-label="Filter by donation" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onCompensationClick) onCompensationClick('donation'); }} className="relative group/icon focus:outline-none cursor-pointer">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border shadow-sm transition-all hover:scale-110 ${selectedCompensation === 'donation' ? 'bg-rose-200 border-rose-400 text-rose-800 ring-2 ring-rose-400 scale-110' : 'bg-rose-100 border-rose-200 text-rose-700'}`}><FaHeart /></div>
                                    <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all z-50 pointer-events-none"><div className="font-semibold mb-1">Donation</div><div className="text-slate-300 leading-tight">Volunteer contribution to research. Click to filter.</div></div>
                                </button>
                            </div>
                        ) : (
                            <button aria-label={`Compensation: ${resource.compensationType || 'donation'}`} onClick={(e) => { if (onCompensationClick) { e.preventDefault(); e.stopPropagation(); onCompensationClick(resource.compensationType || 'donation'); } }} className="relative group/icon focus:outline-none cursor-pointer">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border shadow-sm transition-all hover:scale-110 ${resource.compensationType === 'payment' ? (selectedCompensation === 'payment' ? 'bg-emerald-200 border-emerald-400 text-emerald-800 ring-2 ring-emerald-400 scale-110' : 'bg-emerald-100 border-emerald-200 text-emerald-700') : (selectedCompensation === (resource.compensationType || 'donation') ? 'bg-rose-200 border-rose-400 text-rose-800 ring-2 ring-rose-400 scale-110' : 'bg-rose-100 border-rose-200 text-rose-700')}`}>
                                    {resource.compensationType === 'payment' ? <FaDollarSign /> : <FaHeart />}
                                </div>
                                <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all z-50 pointer-events-none"><div className="font-semibold mb-1 capitalize">{resource.compensationType || 'Donation'}</div><div className="text-slate-300 leading-tight">{resource.compensationType === 'payment' ? "Participants are compensated. Click to filter." : "Volunteer contribution to research. Click to filter."}</div></div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Categories / Data Types (REMOVED as per user request) */}
                {/* <div className="flex flex-wrap gap-2 mb-6">...</div> */}

                {/* Description */}
                {resource.description && resource.description.length > 150 ? (
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsDescriptionExpanded(!isDescriptionExpanded); }}
                        className="mb-6 w-full text-left group/desc focus:outline-none block"
                        aria-expanded={isDescriptionExpanded}
                    >
                        <p className={`text-slate-600 text-sm leading-relaxed transition-colors group-hover/desc:text-slate-800 ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                            {resource.description}
                        </p>
                        <span className="mt-1 inline-block text-xs text-indigo-600 group-hover/desc:text-indigo-800 font-medium transition-colors">
                            {isDescriptionExpanded ? 'Show less' : 'Read more'}
                        </span>
                    </button>
                ) : resource.description ? (
                    <div className="mb-6">
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {resource.description}
                        </p>
                    </div>
                ) : null}

                {/* Footer Actions */}
                <div className="mt-auto pt-4 border-t border-slate-100/50 flex flex-col gap-3">
                    {/* Eligibility Warning if any */}
                    {resource.eligibility === 'Customers' && (
                        <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                            <FaInfoCircle className="mt-0.5" />
                            <span>Requires being an existing customer</span>
                        </div>
                    )}

                    {/* Instructions Toggle (if valid) */}
                    <div className="w-full flex items-start gap-2">
                        <div className="flex-1 relative">
                            {resource.instructions && resource.instructions.length > 0 ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowInstructions(!showInstructions)}
                                        aria-expanded={showInstructions}
                                        className={`w-full flex items-center justify-between px-5 h-12 rounded-xl text-sm font-semibold transition-all duration-300
                                    ${showInstructions
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                : 'bg-blue-600 text-white shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 hover:-translate-y-[1px]'
                                            }`}
                                    >
                                        <span>{showInstructions ? 'Hide Instructions' : 'How to Participate'}</span>
                                        <FaChevronDown className={`transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {showInstructions && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-sm text-slate-600">
                                                    <ol className="list-decimal list-inside space-y-1.5">
                                                        {resource.instructions.map((step, i) => (
                                                            <li key={i}>{step}</li>
                                                        ))}
                                                    </ol>
                                                    <a
                                                        href={resource.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={`Go to ${resource.title} Website`}
                                                        className="mt-3 flex items-center justify-center w-full py-2 h-12 bg-white border border-slate-200 rounded-lg text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                                                    >
                                                        Go to Website <FaExternalLinkAlt className="ml-2 text-xs" />
                                                    </a>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <a
                                    href={resource.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Participate in ${resource.title}`}
                                    className="flex items-center justify-center w-full h-12 px-6 bg-blue-600 text-white font-semibold rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300"
                                >
                                    Participate <FaExternalLinkAlt className="ml-2.5 text-xs opacity-90 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                </a>
                            )}
                        </div>

                        {/* Citations Button */}
                        {hasCitations && (
                            <CitationsPopover resource={resource} />
                        )}

                        {/* Share Button (Native Anchor Link) */}
                        <a
                            href={`#${resource.slug}`}
                            onClick={(e) => {
                                handleCopyLink(e);
                            }}
                            className={`flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-xl border shadow-sm transition-transform hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-500/50
                                ${copied ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'}
                            `}
                            title="Copy link to this resource"
                            aria-label="Copy link to this resource"
                        >
                            {copied ? <FaCheck className="w-4 h-4" /> : <FaShareAlt className="w-4 h-4 ml-[-2px]" />}
                        </a>
                    </div>
                </div>
            </div>
        </article>
    );
};

GeneticResourceCard.propTypes = {
    resource: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        link: PropTypes.string,
        slug: PropTypes.string,
        organizations: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
        })),
        origin: PropTypes.string,
        entityCategory: PropTypes.string,
        dataTypes: PropTypes.arrayOf(PropTypes.string),
        eligibility: PropTypes.string,
        instructions: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
};
