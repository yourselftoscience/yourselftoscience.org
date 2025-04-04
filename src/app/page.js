// src/app/page.js

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResourceTable from '@/components/ResourceTable';
import Footer from '@/components/Footer';
import { resources, citationMap, uniqueCitations } from '@/data/resources';

const words = ['self', 'Data', 'Genome', 'Body', 'Tissues'];

function AnimatedWord({ word }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={word}
        // On the first render, initial opacity is 1 so server/client output match.
        // After mounting (hasMounted true) subsequent changes animate from opacity 0.
        initial={{ opacity: hasMounted ? 0 : 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="text-yellow-400"
      >
        {word}
      </motion.span>
    </AnimatePresence>
  );
}

export default function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // On both SSR and initial client render, currentWord is words[0]
  const currentWord = words[index];
  const isSelf = currentWord === 'self';

  function handleDownloadCSV() {
    const headers = ['Title', 'Link', 'Data Types', 'Countries', 'Country Codes', 'Instructions'];
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    resources.forEach((resource) => {
      const row = [
        resource.title ?? '',
        resource.link ?? '',
        resource.dataTypes?.join('|') ?? '',
        resource.countries?.join('|') ?? '',
        resource.countryCodes?.join('|') ?? '',
        resource.instructions?.join('|') ?? ''
      ].map((value) => `"${value.replace(/"/g, '""')}"`);
      csvContent += row.join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'resources.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <div className="relative min-h-screen bg-black text-white pt-16 md:pt-1">
        <div className="absolute top-2 left-2 md:top-4 md:left-4">
          <img
            src="/Logo.svg"
            alt="Yourself To Science Logo"
            className="w-auto max-h-12 md:max-h-24"
          />
        </div>
        <h1 className="text-4xl font-extrabold text-center">
          <span
            className="inline-flex items-center"
            style={{
              gap: isSelf ? '0em' : '0.2em',
            }}
          >
            <span>Your</span>
            <AnimatedWord word={currentWord} />
          </span>{' '}
          To Science
        </h1>

        <p className="text-center text-lg text-gray-300 mt-4">
          A Comprehensive List of Services for Contributing to Science with Your Data, Genome, Body, and More
        </p>

        <main className="container mx-auto px-4">
          <ResourceTable 
            filteredResources={resources} 
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                window.open(
                  'https://github.com/yourselftoscience/yourselftoscience.org/issues/new?template=suggest-a-service.md',
                  '_blank'
                );
              }}
              className="px-4 py-2 rounded bg-blue-400 text-black font-semibold hover:bg-blue-300"
            >
              Suggest a Service
            </button>
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-300 ml-4"
            >
              Download Dataset
            </button>
          </div>

          {uniqueCitations.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-bold">References</h2>
              <ol className="list-decimal pl-6">
                {uniqueCitations.map((citation, idx) => (
                  <li key={idx} id={`ref-${idx + 1}`}>
                    <a
                      href={citation.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-words whitespace-normal"
                    >
                      {citation.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
