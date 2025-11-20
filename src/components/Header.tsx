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
  readonly scrollY: MotionValue<number>; // This now receives the *real* scrollY
}

const words = ['self', 'Data', 'Genome', 'Body', 'Tissues'];

const TRANSITION_START = 0;
const TRANSITION_END = 100;
const MOBILE_BREAKPOINT = 768;

// --- Custom Hook for Window Size ---
const useWindowSize = () => {
  const [size, setSize] = useState<{ width: number | undefined; height: number | undefined }>({ width: undefined, height: undefined });
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if (globalThis.window === undefined) return;
    const handleResize = () => {
      setSize({ width: globalThis.window.innerWidth, height: globalThis.window.innerHeight });
    };
    setHasMounted(true);
    handleResize();
    globalThis.window.addEventListener('resize', handleResize);
    return () => globalThis.window.removeEventListener('resize', handleResize);
  }, []);

  return { ...size, hasMounted };
};

// --- Custom Hook for Sticky State ---
const useStickyHeader = (scrollY: MotionValue<number>, hasMounted: boolean) => {
  const [isSticky, setIsSticky] = useState(false);
  const wasSticky = useRef(false);

  useEffect(() => {
    if (hasMounted) {
      const initialSticky = scrollY.get() >= TRANSITION_END;
      setIsSticky(initialSticky);
      wasSticky.current = initialSticky;
    }
  }, [hasMounted, scrollY]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentlySticky = latest >= TRANSITION_END;
    if (isSticky !== currentlySticky) {
      setIsSticky(currentlySticky);
    }
    wasSticky.current = currentlySticky;
  });

  return { isSticky, wasSticky };
};

// --- Custom Hook for Word Cycling ---
const useWordCycle = (isSticky: boolean, hasMounted: boolean, wasSticky: React.MutableRefObject<boolean>) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Reset to 'self' when becoming non-sticky
  useEffect(() => {
    if (wasSticky.current && !isSticky) {
      setCurrentWord(words[0]);
    }
  }, [isSticky, wasSticky]);

  useEffect(() => {
    if (!hasMounted) return;

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

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [isSticky, hasMounted]);

  return currentWord;
};

// --- Custom Hook for Header Animations ---
const useHeaderAnimations = (scrollY: MotionValue<number>, isMobile: boolean) => {
  const startPaddingY = isMobile ? 9 : 3;
  const endPaddingY = 1;
  const startLogoSize = isMobile ? 65 : 85;
  const endLogoSize = isMobile ? 55 : 67;
  const startTitleSize = isMobile ? 24 : 36;
  const endTitleSize = isMobile ? 18 : 20;

  const headerPaddingY = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startPaddingY, endPaddingY], { clamp: true });
  const logoSize = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startLogoSize, endLogoSize], { clamp: true });
  const titleSize = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startTitleSize, endTitleSize], { clamp: true });
  const borderShadowOpacity = useTransform(scrollY, [TRANSITION_END - 10, TRANSITION_END], [0, 1], { clamp: true });
  const borderColor = useTransform(borderShadowOpacity, v => `rgba(229, 231, 235, ${v})`);
  const boxShadow = useTransform(borderShadowOpacity, v => `0 1px 3px 0 rgba(0, 0, 0, ${0.1 * v}), 0 1px 2px -1px rgba(0, 0, 0, ${0.1 * v})`);

  return { headerPaddingY, logoSize, titleSize, borderColor, boxShadow };
};

export default function Header({ scrollY }: HeaderProps) {
  const { width: windowWidth, hasMounted } = useWindowSize();
  const isMobile = hasMounted && windowWidth !== undefined && windowWidth < MOBILE_BREAKPOINT;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isSticky, wasSticky } = useStickyHeader(scrollY, hasMounted);
  const currentWord = useWordCycle(isSticky, hasMounted, wasSticky);

  const { headerPaddingY, logoSize, titleSize, borderColor, boxShadow } = useHeaderAnimations(scrollY, isMobile);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const mobileMenuIconPath = isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16";
  const useInlineLayout = !isMobile || isSticky;



  if (!hasMounted) {
    return (
      <header
        className="w-full sticky top-0 z-30 flex items-center border-b bg-white px-4 h-[102px] border-transparent"
      >
        {/* Placeholder content */}
      </header>
    );
  }

  return (
    <motion.header
      className={`w-full sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 md:px-6 lg:px-8`}
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
          <Image
            src="/logo-tm.svg"
            alt="Yourself to Science™ Logo"
            width={70} height={70}
            className="block w-full h-full"
            priority
          />
        </motion.div>

        <motion.div
          className={`font-medium text-google-text whitespace-nowrap overflow-hidden min-w-0 ${useInlineLayout ? 'flex items-baseline' : 'text-center w-full'
            }`}
          style={{ fontSize: titleSize }}
        >
          <span className={useInlineLayout ? '' : 'inline-block'}>Your</span>
          {hasMounted && !isSticky ? (
            <AnimatedWordDynamic key={currentWord} word={currentWord} />
          ) : (
            <span
              key="static-self"
              className={`inline-block text-stroke-yellow-dark ${useInlineLayout ? 'ml-0' : 'ml-1'}`}
            >
              self
            </span>
          )}
          <span className={useInlineLayout ? '' : 'inline-block'}>&nbsp;to Science</span>
          {(isSticky || (hasMounted && currentWord === 'self')) && (
            <sup className="font-medium text-google-text" style={{ fontSize: '0.4em', position: 'relative', top: '-0.7em', marginLeft: '0.1em' }}>™</sup>
          )}
        </motion.div>
      </Link>

      <nav className="hidden md:flex items-center space-x-3 lg:space-x-6">
        <Link href="/stats" className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md">
          Stats
        </Link>
        <Link href="/mission" className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md">
          Our Mission
        </Link>
        <Link href="/get-involved" className="text-base font-medium text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
          Get Involved
        </Link>
      </nav>

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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden"
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
                  <Link href="/mission" className="px-4 py-2 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors" onClick={toggleMobileMenu}>
                    Our Mission
                  </Link>
                  <div className="pt-6">
                    <Link href="/get-involved" className="w-full block text-center text-lg font-medium text-white bg-blue-600 px-4 py-3 rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md" onClick={toggleMobileMenu}>
                      Get Involved
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