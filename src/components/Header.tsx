'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  motion,
  useTransform,
  MotionValue,
  useMotionValueEvent,
  AnimatePresence
} from 'framer-motion';

// Dynamically import AnimatedWord
const AnimatedWordDynamic = dynamic(() => import('./AnimatedWord'), {
  ssr: false,
  loading: () => <span className="inline-block ml-1 text-stroke-yellow-dark">self</span>, // Fallback: only custom stroke class
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const wasSticky = useRef(isSticky);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

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
      } else if (!isSticky && !intervalIdRef.current) {
        // Start interval only if not sticky
        setCurrentWord(words[0]); // Start with 'self'
        intervalIdRef.current = setInterval(() => {
          setCurrentWord(prevWord => {
            const currentIndex = words.indexOf(prevWord);
            const nextIndex = (currentIndex + 1) % words.length;
            // The animation now completes a full circle, including "self".
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


  // --- START: Refactored SVG Path ---
  // Extracting the complex ternary logic into a variable for clarity and to avoid linter parsing issues.
  const mobileMenuIconPath = isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16";
  // --- END: Refactored SVG Path ---


  // Determine layout mode for title alignment/wrapping
  const useInlineLayout = !isMobile || isSticky;

  // --- Placeholder Rendering (remains the same) ---
  if (!hasMounted) {
     const initialPaddingY = 16;
     const initialLogoSize = 70;
     const placeholderHeight = (initialPaddingY * 2) + initialLogoSize;
     return (
        <header
            className="w-full sticky top-0 z-30 flex items-center border-b bg-white px-4 h-[102px] border-transparent"
        >
            {/* Placeholder content */}
        </header>
     );
  }
  // --- END: Placeholder Rendering ---

  // --- Main Render (only runs after mounting) ---
  return (
    <motion.header
       className={`w-full sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 md:px-6 lg:px-8`}
       style={{
         paddingTop: headerPaddingY,
         paddingBottom: headerPaddingY,
         borderColor: borderColor,
         boxShadow: boxShadow,
       }}
    >
      <Link href="/" className="flex items-center no-underline text-inherit">
        <motion.div
          className={`flex-shrink-0 mr-2`}
          style={{ width: logoSize, height: logoSize }}
        >
           {/* ... Image ... */}
           <Image
             src="/icon.svg"
             alt="Yourself To Science Logo"
             width={70} height={70}
             className="block w-full h-full"
             priority
           />
        </motion.div>

        <motion.h1
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
               className={`inline-block text-stroke-yellow-dark ${useInlineLayout ? 'ml-0' : 'ml-1'}`}
             >
               self
             </span>
           )}
           <span className={useInlineLayout ? '' : 'inline-block'}>&nbsp;to Science</span>
        </motion.h1>
      </Link>

      {/* --- Desktop Navigation --- */}
      <nav className="hidden md:flex items-center space-x-3 lg:space-x-6">
        <Link href="/stats" className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md">
            Stats
        </Link>
        <Link href="/contribute" className="text-base font-medium text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
            Contribute
        </Link>
      </nav>

      {/* --- Mobile Menu Button --- */}
      <div className="md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuIconPath} />
          </svg>
        </button>
      </div>

      {/* --- Mobile Menu Drawer --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={toggleMobileMenu}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 pt-20">
                <nav className="flex flex-col space-y-2">
                  <Link href="/stats" className="px-4 py-2 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors" onClick={toggleMobileMenu}>
                    Stats
                  </Link>
                  <div className="pt-6">
                    <Link href="/contribute" className="w-full block text-center text-lg font-medium text-white bg-blue-600 px-4 py-3 rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md" onClick={toggleMobileMenu}>
                      Contribute
                    </Link>
                  </div>
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}