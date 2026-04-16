// src/app/data/page.js
'use client';

import { resources } from '@/data/resources';
import wikidataStats from '@/data/wikidataStats.json';
import WikidataIcon from '@/components/WikidataIcon';

import { FaDownload, FaCode, FaCopy, FaCheck, FaChartBar, FaTable, FaDatabase, FaRobot, FaNetworkWired, FaBook } from 'react-icons/fa';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';


export default function DataPage() {
    const [copiedUrl, setCopiedUrl] = useState(null);
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const shouldBeScrolled = latest > 150;
        if (shouldBeScrolled !== isScrolled) {
            setIsScrolled(shouldBeScrolled);
        }
    });

    const handleCopy = (url) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2500);
    };

    return (
        <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 py-12 md:py-16">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-6xl font-bold text-apple-primary-text mb-3 tracking-tight">Open Science Data & API Hub</h1>
                <p className="text-lg text-apple-secondary-text max-w-3xl mx-auto">
                    Direct access to raw datasets, API endpoints, and semantic mapping for research and academic integration.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link href="/explore" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-apple-accent rounded-xl hover:bg-opacity-90 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all shadow-md hover:shadow-lg">
                        <FaTable />
                        <span>Interactive Data Explorer</span>
                    </Link>
                    <Link href="/stats" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-apple-primary-text bg-white border border-apple-divider rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                        <FaChartBar />
                        <span>Ecosystem Statistics</span>
                    </Link>
                </div>
            </motion.div>

            {/* Sticky Sub-navigation Hub Index */}
            <div className={`sticky top-[80px] z-40 transition-all duration-300 pointer-events-none mb-16 flex justify-center ${hasMounted && isScrolled ? 'py-2' : 'py-6'}`}>
                <motion.div
                    className="pointer-events-auto bg-white/90 backdrop-blur-md border border-apple-divider shadow-xl rounded-2xl px-3 py-2 flex items-center space-x-2"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    {[
                        { href: "#enterprise", label: "Relational", icon: <FaDatabase className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-50" },
                        { href: "#ai-feeds", label: "AI Context", icon: <FaRobot className="w-4 h-4" />, color: "text-purple-600", bg: "bg-purple-50" },
                        { href: "#quantitative", label: "Tabular", icon: <FaTable className="w-4 h-4" />, color: "text-green-600", bg: "bg-green-50" },
                        { href: "#semantic", label: "Semantic", icon: <FaNetworkWired className="w-4 h-4" />, color: "text-orange-600", bg: "bg-orange-50" }
                    ].map((item) => (
                        <motion.a
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all focus:outline-none border border-transparent hover:border-apple-divider ${item.color} ${item.bg} hover:shadow-sm`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {item.icon}
                            <span className="hidden sm:inline">{item.label}</span>
                        </motion.a>
                    ))}
                </motion.div>
            </div>

            <section id="data" className="scroll-mt-32 space-y-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-apple-primary-text mb-4">Data Infrastructure</h2>
                    <p className="text-apple-secondary-text max-w-3xl mx-auto leading-relaxed">
                        Standardized machine-readable datasets for researchers, automated data processing, and quantitative modeling.
                    </p>
                </div>

                {/* Removed the static index div as it's replaced by the animated sticky one */}


                {/* Tier 1: Enterprise */}
                <motion.div id="enterprise" className="scroll-mt-24" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="flex items-center gap-3 mb-6">
                        <FaDatabase className="text-blue-600 text-2xl" />
                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 flex-grow">Relational & Structured Data</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Standardized Frictionless Data packages for integration with institutional databases and research management systems.
                    </p>
                    <div className="grid md:grid-cols-1 gap-4">
                        <div className="bg-apple-card border border-apple-divider rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-apple-secondary-text tracking-wide">FRICTIONLESS DATA PACKAGE</p>
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">Datapackage.json</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Contains dataset schema, type definitions, and metadata for automated table generation.</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-apple-divider">
                                <code className="text-apple-primary-text text-sm break-all font-mono">https://yourselftoscience.org/datapackage.json</code>
                                <button onClick={() => handleCopy('https://yourselftoscience.org/datapackage.json')} className="p-2 text-apple-secondary-text hover:text-apple-accent transition-colors duration-200">
                                    {copiedUrl === 'https://yourselftoscience.org/datapackage.json' ? <FaCheck className="text-green-500" /> : <FaCopy />}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tier 2: AI & LLM Data Feeds */}
                <motion.div id="ai-feeds" className="scroll-mt-24" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="flex items-center gap-3 mb-6">
                        <FaRobot className="text-purple-600 text-2xl" />
                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 flex-grow">Machine-Readable Context (AI & LLM Modeling)</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Raw text and metadata formatted specifically for automated processing and large-scale language modeling. Supports structured search and information retrieval.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-apple-card border border-apple-divider rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-apple-secondary-text tracking-wide">LLM NATIVE CONTEXT</p>
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">llms.txt</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Raw markdown optimized for feeding directly into system prompts and vector databases.</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-apple-divider">
                                <code className="text-apple-primary-text text-xs break-all font-mono">https://yourselftoscience.org/llms.txt</code>
                                <button onClick={() => handleCopy('https://yourselftoscience.org/llms.txt')} className="p-2 text-apple-secondary-text hover:text-apple-accent transition-colors duration-200">
                                    {copiedUrl === 'https://yourselftoscience.org/llms.txt' ? <FaCheck className="text-green-500" /> : <FaCopy />}
                                </button>
                            </div>
                        </div>
                        <div className="bg-apple-card border border-apple-divider rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-apple-secondary-text tracking-wide">OPENAPI SPECIFICATION</p>
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">openapi.json</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Allows Custom GPTs and AI Agents to natively call and query the dataset via static endpoints.</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-apple-divider">
                                <code className="text-apple-primary-text text-xs break-all font-mono">https://yourselftoscience.org/openapi.json</code>
                                <button onClick={() => handleCopy('https://yourselftoscience.org/openapi.json')} className="p-2 text-apple-secondary-text hover:text-apple-accent transition-colors duration-200">
                                    {copiedUrl === 'https://yourselftoscience.org/openapi.json' ? <FaCheck className="text-green-500" /> : <FaCopy />}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tier 3: Quantitative & Tabular Analysts */}
                <motion.div id="quantitative" className="scroll-mt-24" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="flex items-center gap-3 mb-6">
                        <FaTable className="text-green-600 text-2xl" />
                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 flex-grow">Tabular Datasets & JSON Endpoints</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Static data endpoints and bulk export files for Python/Pandas workflows, statistical modeling, and local ingestion.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-apple-card border border-apple-divider rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-apple-secondary-text tracking-wide">STATIC JSON ENDPOINT</p>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Standard JSON array of all active profiles.</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-apple-divider">
                                <code className="text-apple-primary-text text-xs break-all font-mono">https://yourselftoscience.org/resources.json</code>
                                <button onClick={() => handleCopy('https://yourselftoscience.org/resources.json')} className="p-2 text-apple-secondary-text hover:text-apple-accent transition-colors duration-200">
                                    {copiedUrl === 'https://yourselftoscience.org/resources.json' ? <FaCheck className="text-green-500" /> : <FaCopy />}
                                </button>
                            </div>
                        </div>
                        <div className="bg-apple-card border border-apple-divider rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-apple-secondary-text tracking-wide">RAW CSV EXPORT</p>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Static CSV file for offline spreadsheet workflows.</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-apple-divider">
                                <code className="text-apple-primary-text text-xs break-all font-mono">https://yourselftoscience.org/resources.csv</code>
                                <button onClick={() => handleCopy('https://yourselftoscience.org/resources.csv')} className="p-2 text-apple-secondary-text hover:text-apple-accent transition-colors duration-200">
                                    {copiedUrl === 'https://yourselftoscience.org/resources.csv' ? <FaCheck className="text-green-500" /> : <FaCopy />}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tier 4: Semantic Web & Knowledge Graphs */}
                <motion.div id="semantic" className="scroll-mt-24" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="flex items-center gap-3 mb-6">
                        <FaNetworkWired className="text-orange-600 text-2xl" />
                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 flex-grow">Linked Data & Semantic Mapping</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                        RDF Turtle graphs and VoID metadata aligned with Wikidata identifiers to ensure semantic interoperability with global research repositories.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-apple-card border border-apple-divider rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-apple-secondary-text tracking-wide">RDF TURTLE GRAPH</p>
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800">.ttl</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Full ontology and instance data in semantic format.</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-apple-divider">
                                <code className="text-apple-primary-text text-xs break-all font-mono">https://yourselftoscience.org/resources.ttl</code>
                                <button onClick={() => handleCopy('https://yourselftoscience.org/resources.ttl')} className="p-2 text-apple-secondary-text hover:text-apple-accent transition-colors duration-200">
                                    {copiedUrl === 'https://yourselftoscience.org/resources.ttl' ? <FaCheck className="text-green-500" /> : <FaCopy />}
                                </button>
                            </div>
                        </div>
                        <div className="bg-apple-card border border-apple-divider rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-apple-secondary-text tracking-wide">VoID DESCRIPTOR</p>
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800">Linked Data</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Vocabulary of Interlinked Datasets (VoID) metadata mapping.</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-apple-divider">
                                <code className="text-apple-primary-text text-xs break-all font-mono">https://yourselftoscience.org/void.ttl</code>
                                <button onClick={() => handleCopy('https://yourselftoscience.org/void.ttl')} className="p-2 text-apple-secondary-text hover:text-apple-accent transition-colors duration-200">
                                    {copiedUrl === 'https://yourselftoscience.org/void.ttl' ? <FaCheck className="text-green-500" /> : <FaCopy />}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Licensing and Wikidata Info combined */}
                <div className="grid md:grid-cols-2 gap-6 mt-16 pt-16 border-t border-gray-200">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-3 text-google-text">Data Licensing (CC0 1.0)</h2>
                        <p className="text-sm text-google-text-secondary mb-4">
                            Our dataset is dedicated to the public domain under the Creative Commons CC0 1.0 Universal Public Domain Dedication. You can ingest, modify, and distribute the data for any purpose without limitation.
                        </p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-3 text-apple-primary-text flex items-center gap-2">
                            <WikidataIcon size="1.2em" />
                            Wikidata Integration
                        </h2>
                        <p className="text-sm text-apple-secondary-text mb-4">
                            Each resource is mapped to stable Wikidata QIDs. This alignment is maintained to ensure our dataset remains interoperable with global knowledge graphs and research databases.
                        </p>
                        <p className="text-xs font-bold text-gray-700">
                            Currently serving as the verification source for {wikidataStats.referencedItemsCount || 0} upstream Wikidata entities.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-16">
                <h2 className="text-2xl font-bold text-apple-primary-text text-center mb-6">Dataset Schema</h2>
                <div className="prose prose-blue max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
                    <p>
                        The dataset contains the following fields for each resource. For detailed definitions of each data type, visit our{' '}
                        <Link href="/data-types" className="text-apple-accent hover:underline font-medium">
                            Full Data Dictionary
                        </Link>.
                    </p>
                    <ul>
                        <li><strong>id:</strong> A persistent, unique identifier (UUID) for the resource.</li>
                        <li><strong>permalink:</strong> The permanent URI linking directly to the resource&apos;s dataset page.</li>
                        <li><strong>slug:</strong> A user-friendly identifier used in the URL.</li>
                        <li><strong>title:</strong> The name of the resource or study.</li>
                        <li><strong>organizations:</strong> An array of organizations conducting the research, each with a name and optional Wikidata ID.</li>
                        <li><strong>link:</strong> A URL to the resource&apos;s website.</li>
                        <li><strong>dataTypes:</strong> An array of strings describing the types of data collected (e.g., &quot;Genome&quot;, &quot;Health data&quot;).</li>
                        <li><strong>compensationType:</strong> The type of compensation offered (&quot;donation&quot;, &quot;payment&quot;, or &quot;mixed&quot;).</li>
                        <li><strong>origin:</strong> The country where the organization is based (Headquarters).</li>
                        <li><strong>countries:</strong> An array of countries where the resource is available.</li>
                        <li><strong>description:</strong> A brief description of the resource.</li>
                        <li><strong>citations:</strong> An array of academic citations related to the resource.</li>
                        <li><strong>compatibleSources:</strong> Known accepted dataset sources (e.g., &quot;WGS&quot;, &quot;23andMe&quot;).</li>
                        <li><strong>resourceWikidataId:</strong> The main Wikidata QID aligned with the project.</li>
                        <li><strong>entityCategory:</strong> The general type of the organization (e.g., &quot;Non-Profit&quot;, &quot;Government&quot;).</li>
                        <li><strong>entitySubType:</strong> A more specific classification of the organization (e.g., &quot;Research Foundation&quot;, &quot;Regulatory Agency&quot;).</li>
                        <li><strong>isCitedOnWikidata:</strong> Boolean flag indicating if the resource currently uses the catalogue as a verifiable reference URL (P854).</li>
                        <li><strong>wikidataReferenceUrl:</strong> The specific Wikidata URL connecting the resource to the catalogue citation (if applicable).</li>
                        <li><strong>rorId:</strong> The <a href="https://ror.org" target="_blank" rel="noopener noreferrer" className="text-apple-accent hover:underline">Research Organization Registry</a> (ROR) identifier for the primary organization, when available.</li>
                        <li><strong>rorTypes:</strong> Organization types from ROR (e.g., &quot;education&quot;, &quot;government&quot;, &quot;healthcare&quot;, &quot;company&quot;, &quot;nonprofit&quot;).</li>
                    </ul>
                </div>
            </section>


        </main>
    );
};
