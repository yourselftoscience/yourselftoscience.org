'use client';

import { motion } from 'framer-motion';

interface AnimatedWordProps {
  word: string;
}

export default function AnimatedWord({ word }: AnimatedWordProps) {
  // Margin logic needs to know the layout context, but AnimatedWord doesn't have it.
  // Simplest is to apply margin based on word, assuming 'self' is only shown when inline.
  // If 'self' can appear when centered, this needs adjustment.
  // Let's assume the parent logic correctly swaps to static 'self' when sticky (inline).
  const marginLeftClass = word === 'self' ? 'ml-0' : 'ml-1'; // ml-1 for non-self words (likely centered state)

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0 } }} // Instant exit
      transition={{ duration: 0.2, ease: "easeInOut" }}
      // Add inline-block here too, as it's needed for text-center parent
      className={`inline-block text-yellow-500 ${marginLeftClass}`}
    >
      {word}
    </motion.span>
  );
}