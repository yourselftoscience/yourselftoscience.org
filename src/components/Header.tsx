'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  motion,
  useTransform,
  MotionValue,
  useMotionValueEvent
} from 'framer-motion';

// Dynamically import AnimatedWord
const AnimatedWordDynamic = dynamic(() => import('@/components/AnimatedWord'), {
  loading: () => <span className="inline-block text-yellow-400 ml-1">self</span>, // Fallback similar to static self
  ssr: false // It's a client-side animation component
});

interface HeaderProps {
  scrollY: MotionValue<number>; // This now receives the *real* scrollY
}

const words = ['self', 'Data', 'Genome', 'Body', 'Tissues'];

const TRANSITION_START = 0;
const TRANSITION_END = 100;
const MOBILE_BREAKPOINT = 768;

// --- Custom Hook for Window Size (remains the same) ---
const useWindowSize = () => {
  const [size, setSize] = useState<{ width: number | undefined; height: number | undefined }>({ width: undefined, height: undefined });
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    setHasMounted(true);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { ...size, hasMounted };
};
// --- End Custom Hook ---

export default function Header({ scrollY }: HeaderProps) {
  const { width: windowWidth, hasMounted } = useWindowSize();
  const isMobile = hasMounted && windowWidth !== undefined && windowWidth < MOBILE_BREAKPOINT;

  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isSticky, setIsSticky] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const wasSticky = useRef(isSticky);

  // Effect to set initial sticky state after mount
  useEffect(() => {
    if (hasMounted) {
      // Use the passed scrollY prop here
      const initialSticky = scrollY.get() >= TRANSITION_END;
      setIsSticky(initialSticky);
      wasSticky.current = initialSticky;
    }
    // Add scrollY to dependency array
  }, [hasMounted, scrollY]);

  // Effect for scroll events - uses the passed scrollY prop
  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentlySticky = latest >= TRANSITION_END;
    if (isSticky !== currentlySticky) {
      setIsSticky(currentlySticky);
    }
    // This logic seems fine, ensures 'self' is shown when scrolling back up past the threshold
    if (wasSticky.current && !currentlySticky) {
       setCurrentWord(words[0]); // Reset to 'self' when becoming non-sticky
    } else if (!wasSticky.current && currentlySticky && currentWord !== 'self') {
       // Optional: Force to 'self' immediately when becoming sticky if it wasn't already 'self'
       // setCurrentWord(words[0]);
    }
    wasSticky.current = currentlySticky;
  });

   // Effect for interval management
  useEffect(() => {
    if (!hasMounted) return;
    const manageInterval = () => {
      if (isSticky && intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        // Ensure 'self' is displayed when sticky
        if (currentWord !== 'self') {
           setCurrentWord('self'); // Use direct string 'self'
        }
      } else if (!isSticky && !intervalIdRef.current) {
        // Start interval only if not sticky
        setCurrentWord(words[0]); // Start with 'self'
        intervalIdRef.current = setInterval(() => {
          setCurrentWord(prevWord => {
            const currentIndex = words.indexOf(prevWord);
            const nextIndex = (currentIndex + 1) % words.length;
            // Skip 'self' in the animation cycle
            return words[nextIndex === 0 ? 1 : nextIndex];
          });
        }, 3000);
      }
    };
    manageInterval();
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
    // Remove currentWord from dependencies - interval logic depends only on isSticky and mount state
  }, [isSticky, hasMounted]);


  // --- Define start/end values based on isMobile ---
  const startPaddingY = isMobile ? 12 : 16;
  const endPaddingY = 8;
  const startLogoSize = isMobile ? 40 : 70;
  const endLogoSize = 35;
  const startTitleSize = isMobile ? 24 : 36;
  const endTitleSize = isMobile ? 18 : 20; // Adjusted mobile end size slightly for better fit


  // --- Call Hooks at the top level - use the passed scrollY prop ---
  const headerPaddingY = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startPaddingY, endPaddingY], { clamp: true });
  const logoSize = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startLogoSize, endLogoSize], { clamp: true });
  const titleSize = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startTitleSize, endTitleSize], { clamp: true });
  const borderShadowOpacity = useTransform(scrollY, [TRANSITION_END - 10, TRANSITION_END], [0, 1], { clamp: true });
  const borderColor = useTransform(borderShadowOpacity, v => `rgba(229, 231, 235, ${v})`);
  const boxShadow = useTransform(borderShadowOpacity, v => `0 1px 3px 0 rgba(0, 0, 0, ${0.1 * v}), 0 1px 2px -1px rgba(0, 0, 0, ${0.1 * v})`);
  // --- End Hook calls ---


  // Determine layout mode for title alignment/wrapping
  const useInlineLayout = !isMobile || isSticky;

  // --- Placeholder Rendering (remains the same) ---
  if (!hasMounted) {
     const initialPaddingY = 16;
     const initialLogoSize = 70;
     const placeholderHeight = (initialPaddingY * 2) + initialLogoSize;
     return (
        <header
            className="w-full sticky top-0 z-30 flex items-center border-b bg-white px-4"
            style={{ height: `${placeholderHeight}px`, borderColor: 'rgba(229, 231, 235, 0)' }}
        >
            {/* Placeholder content */}
        </header>
     );
  }
  // --- END: Placeholder Rendering ---

  // --- Main Render (only runs after mounting) ---
  return (
    <motion.header
       className={`w-full sticky top-0 z-30 flex items-center border-b bg-white px-4`}
       style={{
         paddingTop: headerPaddingY,
         paddingBottom: headerPaddingY,
         borderColor: borderColor,
         boxShadow: boxShadow,
       }}
    >
      <motion.div
        className={`flex-shrink-0 mr-2`}
        style={{ width: logoSize, height: logoSize }}
      >
         {/* ... Image ... */}
         <Image
           src="/Logo.svg"
           alt="Yourself To Science Logo"
           width={70} height={70}
           style={{ display: 'block', width: '100%', height: '100%' }}
           priority
         />
      </motion.div>

      <motion.div
        className={`font-medium text-google-text whitespace-nowrap overflow-hidden min-w-0 ${
          useInlineLayout ? 'flex items-baseline' : 'text-center w-full'
        }`}
        style={{ fontSize: titleSize }}
      >
         <span className={useInlineLayout ? '' : 'inline-block'}>Your</span>
         {/* Use isSticky state to determine whether to show AnimatedWord or static 'self' */}
         {hasMounted && !isSticky ? (
           <AnimatedWordDynamic key={currentWord} word={currentWord} />
         ) : (
           // Render static 'self' when sticky or not mounted yet (though placeholder handles pre-mount)
           <span
             key="static-self"
             // Adjust margin based on layout mode
             className={`inline-block text-yellow-400 ${useInlineLayout ? 'ml-0' : 'ml-1'}`}
           >
             self
           </span>
         )}
         <span className={useInlineLayout ? '' : 'inline-block'}>&nbsp;to Science</span>
      </motion.div>
    </motion.header>
  );
}