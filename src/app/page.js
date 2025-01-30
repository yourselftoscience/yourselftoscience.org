// src/app/page.js

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResourceTable from '../components/ResourceTable';
import Footer from '../components/Footer'; // Import Footer

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

        {/* Resource Table Section */}
        <div className="container mx-auto mt-10 flex-grow">
          <ResourceTable />
        </div>

        {/* Footer Section */}
        <Footer /> {/* Add Footer here */}
      </div>
    </>
  );
}
