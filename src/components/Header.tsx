'use client';

import React, { useState, useEffect, useRef } from 'react'; // Removed useMemo import if no longer needed elsewhere
import Image from 'next/image';
import AnimatedWord from '@/components/AnimatedWord';
import {
  motion,
  useTransform,
  MotionValue,
  useMotionValueEvent
} from 'framer-motion';

interface HeaderProps {
  scrollY: MotionValue<number>;
}

const words = ['self', 'Data', 'Genome', 'Body', 'Tissues'];

const TRANSITION_START = 0;
const TRANSITION_END = 100;
const MOBILE_BREAKPOINT = 768; // Tailwind 'md' breakpoint

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
  // isMobile is correctly determined after mount
  const isMobile = hasMounted && windowWidth !== undefined && windowWidth < MOBILE_BREAKPOINT;

  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isSticky, setIsSticky] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const wasSticky = useRef(isSticky);

  // Effect to set initial sticky state after mount (remains the same)
  useEffect(() => {
    if (hasMounted) {
      const initialSticky = scrollY.get() >= TRANSITION_END;
      setIsSticky(initialSticky);
      wasSticky.current = initialSticky;
    }
  }, [hasMounted, scrollY]);

  // Effect for scroll events (remains the same)
  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentlySticky = latest >= TRANSITION_END;
    if (isSticky !== currentlySticky) {
      setIsSticky(currentlySticky);
    }
    if (wasSticky.current && !currentlySticky) {
      setCurrentWord(words[0]);
    }
    wasSticky.current = currentlySticky;
  });

   // Effect for interval management (remains the same)
  useEffect(() => {
    if (!hasMounted) return;
    const manageInterval = () => {
      if (isSticky && intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      } else if (!isSticky && !intervalIdRef.current) {
        setCurrentWord(words[0]);
        intervalIdRef.current = setInterval(() => {
          setCurrentWord(prevWord => {
            const currentIndex = words.indexOf(prevWord);
            const nextIndex = (currentIndex + 1) % words.length;
            return words[nextIndex];
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
  }, [isSticky, hasMounted]);


  // --- Define start/end values based on isMobile ---
  const startPaddingY = isMobile ? 12 : 16;
  const endPaddingY = 8;
  const startLogoSize = isMobile ? 40 : 70;
  const endLogoSize = 35;
  // --- Increase mobile start size ---
  const startTitleSize = isMobile ? 24 : 36;
  // --- End increase ---
  const endTitleSize = isMobile ? 10 : 20;

  // --- Call Hooks at the top level ---
  const headerPaddingY = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startPaddingY, endPaddingY], { clamp: true });
  const logoSize = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startLogoSize, endLogoSize], { clamp: true });
  const titleSize = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startTitleSize, endTitleSize], { clamp: true });
  const borderShadowOpacity = useTransform(scrollY, [TRANSITION_END - 10, TRANSITION_END], [0, 1], { clamp: true });
  const borderColor = useTransform(borderShadowOpacity, v => `rgba(229, 231, 235, ${v})`);
  const boxShadow = useTransform(borderShadowOpacity, v => `0 1px 3px 0 rgba(0, 0, 0, ${0.1 * v}), 0 1px 2px -1px rgba(0, 0, 0, ${0.1 * v})`);
  // --- End Hook calls ---


  // Determine layout mode for title alignment/wrapping
  const useInlineLayout = !isMobile || isSticky;

  // --- Placeholder Rendering (Crucial for preventing initial render issues) ---
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
        style={{ fontSize: titleSize }} // titleSize should now use the correct range
      >
         <span className={useInlineLayout ? '' : 'inline-block'}>Your</span>
         {hasMounted && !isSticky ? (
           <AnimatedWord key={currentWord} word={currentWord} />
         ) : (
           <span
             key="static-self"
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