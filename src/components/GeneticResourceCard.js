'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobeAmericas, FaBuilding, FaDna, FaHeartbeat, FaHistory, FaExternalLinkAlt, FaInfoCircle, FaChevronDown, FaDollarSign, FaHeart, FaCheck, FaShareAlt } from 'react-icons/fa';
import { EU_COUNTRIES } from '@/data/constants';

/**
 * A specialized, high-fidelity card component for the Genetic Data Donation page.
 * Features a modern "glassmorphism" aesthetic with premium typography and interactions.
 */
export default function GeneticResourceCard({ resource, selectedServices, onSectorClick, onCompensationClick, selectedCountries = [] }) {
    const [isHovered, setIsHovered] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isTargeted, setIsTargeted] = useState(false);

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
            className={`group relative flex flex-col h-full backdrop-blur-2xl rounded-[2rem] transition-all duration-500 overflow-hidden ${isTargeted ? targetStyles : idleStyles}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Decorative Gradient Background (Subtle) */}
            <div className={`absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-80 transition-opacity duration-500 ${isHovered ? 'opacity-40' : 'opacity-80'}`} />

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
                        <button
                            aria-label={`View compensation details for ${resource.title}`}
                            onClick={(e) => {
                                // Don't trigger the card's general click if it ever has one
                                if (onCompensationClick) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onCompensationClick(resource.compensationType || 'donation');
                                }
                            }}
                            className="relative group/icon focus:outline-none cursor-pointer"
                        >
                            <div className={`
                    flex items-center justify-center h-8 px-2.5 gap-1 rounded-full border shadow-sm transition-transform hover:scale-110
                    ${resource.compensationType === 'payment'
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                                    : resource.compensationType === 'mixed'
                                        ? 'bg-amber-100 border-amber-200 text-amber-700'
                                        : 'bg-rose-100 border-rose-200 text-rose-700'}
                    ${(resource.compensationType !== 'mixed') ? 'w-8 px-0 gap-0' : ''}
                `}>
                                {resource.compensationType === 'payment' && <FaDollarSign />}
                                {resource.compensationType === 'mixed' && (
                                    <>
                                        <FaDollarSign className="w-3 h-3" />
                                        <span className="text-amber-500/50 font-extrabold text-[10px] mx-[1px]">+</span>
                                        <FaHeart className="w-3 h-3" />
                                    </>
                                )}
                                {(resource.compensationType === 'donation' || !resource.compensationType) && <FaHeart />}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all z-50 pointer-events-none">
                                <div className="font-semibold mb-1 capitalize">
                                    {resource.compensationType === 'mixed' ? 'Mixed Compensation' : (resource.compensationType || 'Donation')}
                                </div>
                                <div className="text-slate-300 leading-tight">
                                    {resource.compensationType === 'payment' && "Participants are compensated. Click to filter."}
                                    {resource.compensationType === 'mixed' && "Compensation varies. Click to filter."}
                                    {(resource.compensationType === 'donation' || !resource.compensationType) && "Volunteer contribution to science. Click to filter."}
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Categories / Data Types (REMOVED as per user request) */}
                {/* <div className="flex flex-wrap gap-2 mb-6">...</div> */}

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {resource.description}
                </p>

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

                        {/* Share Button (Native Anchor Link) */}
                        <a
                            href={`#${resource.slug}`}
                            onClick={(e) => {
                                handleCopyLink(e);
                            }}
                            className={`flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-xl border shadow-sm transition-transform hover:-translate-y-[1px] focus:outline-none 
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
