// src/app/page.js

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResourceTable from '../components/ResourceTable';

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
    <div className="bg-black min-h-screen text-white">
      {/* Header Section */}
      <div className="container mx-auto text-center pt-10">
        <h1 className="text-4xl font-extrabold">
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
      </div>

      {/* Resource Table Section */}
      <div className="container mx-auto mt-10">
        <ResourceTable />
      </div>
    </div>
  );
}
