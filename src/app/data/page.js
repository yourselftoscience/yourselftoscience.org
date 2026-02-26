// src/app/data/page.js
'use client';

import { resources } from '@/data/resources';

import { FaDownload, FaCode, FaCopy, FaCheck, FaChartBar } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';
import React, { useState } from 'react';


export default function DataPage() {
    const [copiedUrl, setCopiedUrl] = useState(null);

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
                <h1 className="text-4xl md:text-6xl font-bold text-apple-primary-text mb-3">Data & Access</h1>
                <p className="text-lg text-apple-secondary-text max-w-3xl mx-auto">
                    Our complete dataset is open and available for anyone.
                </p>
                <div className="mt-6 text-center">
                    <Link href="/stats" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-apple-accent rounded-lg hover:bg-opacity-90 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors">
                        <FaChartBar />
                        <span>View Visual Statistics</span>
                    </Link>
                </div>
            </motion.div>

            <section id="data" className="scroll-mt-24">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-3">
                        <FaDownload className="text-apple-secondary-text" />
                        <h2 className="text-2xl font-bold text-apple-primary-text">Download Full Dataset</h2>
                    </div>
                    <p className="text-apple-secondary-text mt-2 max-w-2xl mx-auto">
                        Use these persistent URLs for automated access to always get the latest version of the dataset.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-4">
                    <a
                        href="/resources.csv"
                        download="yourselftoscience_resources.csv"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-apple-accent rounded-lg hover:bg-opacity-90 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors"
                    >
                        <FaDownload />
                        <span>Download as CSV</span>
                    </a>
                    <a
                        href="/resources.json"
                        download="yourselftoscience_resources.json"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-apple-accent rounded-lg hover:bg-opacity-90 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors"
                    >
                        <FaDownload />
                        <span>Download as JSON</span>
                    </a>
                    <a
                        href="/resources.ttl"
                        download="yourselftoscience_resources.ttl"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-apple-accent rounded-lg hover:bg-opacity-90 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors"
                    >
                        <FaDownload />
                        <span>Download as RDF/TTL</span>
                    </a>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-16"
                >
                    <div className="text-center mb-8">
                        <div className="flex justify-center items-center gap-3">
                            <FaCode className="text-apple-secondary-text" />
                            <h2 className="text-2xl font-bold text-apple-primary-text">Live Data Access</h2>
                        </div>
                        <p className="text-apple-secondary-text mt-2 max-w-2xl mx-auto">
                            Use these persistent URLs for automated access to always get the latest version of the dataset.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="bg-apple-card border border-apple-divider rounded-xl p-4">
                            <p className="text-sm font-medium text-apple-secondary-text mb-2">CSV ENDPOINT</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-apple-divider">
                                <code className="text-apple-primary-text text-sm break-all">https://yourselftoscience.org/resources.csv</code>
                                <button
                                    onClick={() => handleCopy('https://yourselftoscience.org/resources.csv')}
                                    className="p-2 text-apple-secondary-text hover:text-apple-accent transition-colors duration-200"
                                    aria-label="Copy CSV URL"
                                >
                                    {copiedUrl === 'https://yourselftoscience.org/resources.csv' ? (
                                        <FaCheck className="text-green-500" />
                                    ) : (
                                        <FaCopy />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="bg-apple-card border border-apple-divider rounded-xl p-4">
                            <p className="text-sm font-medium text-apple-secondary-text mb-2">JSON ENDPOINT</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-apple-divider">
                                <code className="text-apple-primary-text text-sm break-all">https://yourselftoscience.org/resources.json</code>
                                <button
                                    onClick={() => handleCopy('https://yourselftoscience.org/resources.json')}
                                    className="p-2 text-apple-secondary-text hover:text-apple-accent transition-colors duration-200"
                                    aria-label="Copy JSON URL"
                                >
                                    {copiedUrl === 'https://yourselftoscience.org/resources.json' ? (
                                        <FaCheck className="text-green-500" />
                                    ) : (
                                        <FaCopy />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="bg-apple-card border border-apple-divider rounded-xl p-4">
                            <p className="text-sm font-medium text-apple-secondary-text mb-2">RDF/TTL ENDPOINT</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-apple-divider">
                                <code className="text-apple-primary-text text-sm break-all">https://yourselftoscience.org/resources.ttl</code>
                                <button
                                    onClick={() => handleCopy('https://yourselftoscience.org/resources.ttl')}
                                    className="p-2 text-apple-secondary-text hover:text-apple-accent transition-colors duration-200"
                                    aria-label="Copy RDF/TTL URL"
                                >
                                    {copiedUrl === 'https://yourselftoscience.org/resources.ttl' ? (
                                        <FaCheck className="text-green-500" />
                                    ) : (
                                        <FaCopy />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12"
                >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <h2 className="text-2xl font-semibold mb-3 text-google-text">Licensing</h2>
                        <p className="text-google-text-secondary mb-4 max-w-2xl mx-auto">
                            Our dataset is dedicated to the public domain under the{' '}
                            <a
                                href="/license/dataset"
                                className="text-google-blue hover:underline"
                            >
                                Creative Commons CC0 1.0 Universal Public Domain Dedication (CC0 1.0)
                            </a>
                            . You can copy, modify, and distribute the data, even for commercial purposes, without asking permission.
                        </p>
                        <p className="text-sm text-gray-600">
                            While not required, we appreciate credit to Yourself to Science when using our data.
                        </p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-12"
                >
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center">
                        <h2 className="text-2xl font-semibold mb-3 text-apple-primary-text">Wikidata Integration</h2>
                        <p className="text-apple-secondary-text mb-4 max-w-2xl mx-auto">
                            Each resource in our catalogue is mapped to{' '}
                            <a
                                href="https://www.wikidata.org"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-apple-accent hover:underline"
                            >
                                Wikidata
                            </a>{' '}
                            QIDs. Organizations, countries, and key entities reference their Wikidata identifiers, making the dataset interoperable with the global knowledge graph.
                        </p>
                        <p className="text-sm text-gray-600">
                            This alignment is maintained manually and is used to enrich existing Wikidata items and identify missing ones.
                        </p>
                    </div>
                </motion.div>
            </section>

            <section className="mt-16">
                <h2 className="text-2xl font-bold text-apple-primary-text text-center mb-6">Dataset Schema</h2>
                <div className="prose prose-blue max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
                    <p>The dataset contains the following fields for each resource:</p>
                    <ul>
                        <li><strong>id:</strong> A persistent, unique identifier (UUID) for the resource.</li>
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
                        <li><strong>entityCategory:</strong> The general type of the organization (e.g., &quot;Non-Profit&quot;, &quot;Government&quot;).</li>
                        <li><strong>entitySubType:</strong> A more specific classification of the organization (e.g., &quot;Research Foundation&quot;, &quot;Regulatory Agency&quot;).</li>
                    </ul>
                </div>
            </section>


        </main>
    );
};
