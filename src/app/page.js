// src/app/page.js

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResourceTable from '../components/ResourceTable';
import Footer from '../components/Footer'; // Import Footer
import { resources } from '../data/resources'; // Import your array

// Move words outside the component
const words = ['self', 'Data', 'Genome', 'Body', 'Tissues'];

export default function Home() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Set hasMounted to true after the component mounts
    setHasMounted(true);

    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) =>
        prevIndex + 1 >= words.length ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array

  const currentWord = words[currentWordIndex];
  const isSelf = currentWord === 'self';

  // Add a download click handler
  const handleDownload = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(resources, null, 2)
    )}`;
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', 'resources.json');
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  function handleDownloadCSV() {
    // Define CSV columns
    const headers = ['Title','Link','Data Types','Countries','Country Codes','Instructions'];
    
    // Start CSV string
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    
    // Build CSV rows
    resources.forEach((resource) => {
      const row = [
        resource.title ?? '',
        resource.link ?? '',
        resource.dataTypes?.join('|') ?? '',
        resource.countries?.join('|') ?? '',
        resource.countryCodes?.join('|') ?? '',
        resource.instructions?.join('|') ?? ''
      ].map(value => `"${value.replace(/"/g, '""')}"`); // Escape quotes
  
      csvContent += row.join(',') + '\n';
    });
  
    // Trigger download
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
      <div className="relative min-h-screen bg-black text-white">
        <div className="absolute top-2 left-2 md:top-4 md:left-4">
          <img
            src="/Logo.svg"
            alt="Yourself To Science Logo"
            className="h-12 w-auto md:h-24"
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
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWord}
                initial={{ opacity: hasMounted ? 0 : 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.5,
                }}
                className="text-yellow-400"
              >
                {currentWord}
              </motion.span>
            </AnimatePresence>
          </span>{' '}
          To Science
        </h1>

        {/* **Added Description Below the Title** */}
        <p className="text-center text-lg text-gray-300 mt-4">
          A Comprehensive List of Services for Contributing to Science with Your Data, Genome, Body, and More
        </p>

        <main className="container mx-auto px-4">
          <ResourceTable /> {/* [src/components/ResourceTable.js](src/components/ResourceTable.js) */}

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
            <button onClick={handleDownloadCSV} className="px-4 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-300 ml-4">
              Download Dataset
            </button>
          </div>
        </main>

        <Footer /> {/* [src/components/Footer.js](src/components/Footer.js) */}
      </div>
    </>
  );
}
