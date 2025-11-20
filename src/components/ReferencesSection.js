import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FaCopy, FaCheck, FaQuoteRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReferencesSection({ citations }) {
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        // Handle hash changes to highlight active reference
        if (globalThis.window !== undefined) {
            const handleHashChange = () => {
                setActiveId(globalThis.window.location.hash.substring(1));
            };

            // Initial check
            handleHashChange();

            // Listen for hash changes
            globalThis.window.addEventListener('hashchange', handleHashChange);
            return () => globalThis.window.removeEventListener('hashchange', handleHashChange);
        }
    }, []);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    if (!citations || citations.length === 0) return null;

    return (
        <section id="references" className="w-full max-w-screen-xl mx-auto px-4 py-12 mt-8">
            <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/60 backdrop-blur-xl shadow-sm ring-1 ring-white/40 p-8 md:p-10">

                {/* Decorative background elements */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-50/50 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                <FaQuoteRight className="text-google-blue/80 text-xl" />
                                References
                            </h2>
                            <p className="text-slate-500 mt-1 text-sm">
                                Scientific literature citing the services listed in this project, providing verification and context.
                            </p>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {citations.map((citation, idx) => {
                            const refId = `ref-${idx + 1}`;
                            const isActive = activeId === refId;
                            // Use link or title as key if unique enough, fallback to index if needed but try to avoid
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
