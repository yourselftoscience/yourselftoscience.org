import React, { useState } from 'react';
import { FaCopy, FaCheck, FaQuoteRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReferencesSection({ citations }) {
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [activeId, setActiveId] = useState('');

    React.useEffect(() => {
        const handleHashChange = () => {
            setActiveId(window.location.hash.substring(1));
        };

        // Initial check
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
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
                        {citations.map((citation, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                id={`ref-${idx + 1}`}
                                className={`group relative flex gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-sm scroll-mt-52 ${activeId === `ref-${idx + 1}`
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
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
