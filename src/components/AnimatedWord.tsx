'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedWordProps {
  word: string;
}

export default function AnimatedWord({ word }: AnimatedWordProps) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={word}
        // On first render, opacity is 1; after mounting animate from opacity 0.
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