import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FaCopy, FaCheck, FaQuoteRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReferencesSection({ citations }) {
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [activeId, setActiveId] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Handle hash changes to highlight active reference
        if (globalThis.window !== undefined) {
            const handleHashChange = () => {
                const hash = globalThis.window.location.hash.substring(1);
                setActiveId(hash);
                if (hash && hash.startsWith('ref-')) {
                    setIsExpanded(true);
                }
            };

            // Initial check
            handleHashChange();

            // Listen for hash changes
            globalThis.window.addEventListener('hashchange', handleHashChange);
            return () => globalThis.window.removeEventListener('hashchange', handleHashChange);
        }
    }, []);

    useEffect(() => {
        if (isExpanded && activeId) {
            const timer = setTimeout(() => {
                const element = globalThis.document.getElementById(activeId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [isExpanded, activeId]);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    if (!citations || citations.length === 0) return null;

    return (
        <section id="references" className="w-full max-w-screen-xl mx-auto px-4 py-8 mt-4">
            <div className={`relative overflow-hidden rounded-[32px] border transition-all duration-300 ${isExpanded ? 'bg-white/60 border-white/20' : 'bg-white/40 border-transparent hover:bg-white/60'} backdrop-blur-xl shadow-sm ring-1 ring-white/40`}>

                {/* Decorative background elements */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-50/50 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex flex-col md:flex-row justify-between items-start md:items-center p-8 md:p-10 text-left group cursor-pointer outline-none"
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 group-hover:text-google-blue transition-colors">
                                <FaQuoteRight className="text-google-blue/80 text-xl" />
                                References
                                <span className="text-sm font-normal text-slate-400 ml-2 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {citations.length}
                                </span>
                            </h2>
                            <p className="text-slate-500 mt-1 text-sm group-hover:text-slate-600 transition-colors">
                                Scientific literature citing the services listed in this project, providing verification and context.
                            </p>
                        </div>
                        <div className={`mt-4 md:mt-0 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-google-blue transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <FaChevronDown />
                        </div>
                    </button>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="px-8 md:px-10 pb-10 pt-0 border-t border-slate-200/50 mt-2">
                                    <div className="pt-6 grid grid-cols-1 gap-4">
                                        {citations.map((citation, idx) => {
                                            const refId = `ref-${idx + 1}`;
                                            const isActive = activeId === refId;
                                            const key = citation.link || citation.title || idx;

                                            return (
                                                <motion.div
                                                    key={key}
                                                    initial={{ opacity: 0.3 }}
                                                    whileInView={{ opacity: 1 }}
                                                    viewport={{ once: true, amount: 0.01, margin: "200px" }}
                                                    transition={{
                                                        duration: 0.15,
                                                        ease: [0.25, 0.1, 0.25, 1]
                                                    }}
                                                    id={refId}
                                                    className={`group relative flex gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-sm scroll-mt-52 ${isActive
                                                        ? 'bg-blue-50/80 border-blue-200 ring-2 ring-google-blue ring-offset-2 ring-offset-white/60'
                                                        : 'bg-white/40 border-transparent hover:border-blue-100 hover:bg-white/80'
                                                        }`}
                                                >
                                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-500 text-xs font-bold font-mono group-hover:text-google-blue group-hover:scale-110 transition-all duration-300">
                                                        {idx + 1}
                                                    </div>

                                                    <div className="flex-grow min-w-0">
                                                        <div className="text-sm text-slate-700 leading-relaxed">
                                                            {citation.link ? (
                                                                <a
                                                                    href={citation.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="font-medium text-slate-700 hover:text-google-blue hover:underline decoration-google-blue/30 underline-offset-2 transition-colors"
                                                                >
                                                                    {citation.title}
                                                                </a>
                                                            ) : (
                                                                <span>{citation.title}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex-shrink-0 flex items-start pt-0.5">
                                                        <button
                                                            onClick={() => handleCopy(citation.title + (citation.link ? ` ${citation.link}` : ''), idx)}
                                                            className="p-2 rounded-full text-slate-400 hover:text-google-blue hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                            aria-label="Copy citation"
                                                            title="Copy citation"
                                                        >
                                                            <AnimatePresence mode='wait'>
                                                                {copiedIndex === idx ? (
                                                                    <motion.span
                                                                        key="check"
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        exit={{ scale: 0 }}
                                                                    >
                                                                        <FaCheck />
                                                                    </motion.span>
                                                                ) : (
                                                                    <motion.span
                                                                        key="copy"
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        exit={{ scale: 0 }}
                                                                    >
                                                                        <FaCopy />
                                                                    </motion.span>
                                                                )}
                                                            </AnimatePresence>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

ReferencesSection.propTypes = {
    citations: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        link: PropTypes.string,
        // Add other citation properties if known, e.g., author, year, etc.
    })),
};
