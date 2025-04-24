// filepath: /workspaces/yourselftoscience.org/src/components/Header.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
const MOBILE_BREAKPOINT = 768; // Example breakpoint (md in Tailwind)

export default function Header({ scrollY }: HeaderProps) {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [hasMounted, setHasMounted] = useState(false);
  const [isSticky, setIsSticky] = useState(scrollY.get() >= TRANSITION_END); // Initial state based on scroll
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const wasSticky = useRef(isSticky); // Keep track of previous sticky state
  const [isMobile, setIsMobile] = useState(false);

  // Effect for mobile check
  useEffect(() => {
    const checkMobile = () => {
      // Check window existence for SSR safety
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effect for scroll events
  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentlySticky = latest >= TRANSITION_END;

    // Reset to 'self' when scrolling up INTO the animation zone from sticky
    if (wasSticky.current && !currentlySticky) {
      setCurrentWord(words[0]); // Reset immediately
    }

    setIsSticky(currentlySticky);
    wasSticky.current = currentlySticky; // Update previous state
  });

  // Effect for mounting and interval management
  useEffect(() => {
    setHasMounted(true);

    const manageInterval = (scrollPos: number) => {
      const currentlySticky = scrollPos >= TRANSITION_END; // Use sticky condition
      // Stop interval if sticky or if it already exists
      if (currentlySticky && intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      // Start interval only if NOT sticky AND it doesn't exist
      else if (!currentlySticky && !intervalIdRef.current) {
        // Reset to 'self' immediately when interval starts
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

    // Initial setup based on current scroll
    const initialScroll = scrollY.get();
    wasSticky.current = initialScroll >= TRANSITION_END; // Use sticky condition
    manageInterval(initialScroll); // Run interval logic on mount

    // Subscribe to changes
    const unsubscribe = scrollY.on("change", manageInterval);

    // Cleanup
    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      unsubscribe();
    };
  }, [scrollY]); // Depend only on scrollY

  // --- Transforms ---
  const startPaddingY = isMobile ? 12 : 16;
  const endPaddingY = 8;
  const headerPaddingY = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startPaddingY, endPaddingY], { clamp: true });

  const startLogoSize = isMobile ? 40 : 70;
  const endLogoSize = 35;
  const logoSize = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startLogoSize, endLogoSize], { clamp: true });

  const startTitleSize = isMobile ? 16 : 36;
  const endTitleSize = isMobile ? 10 : 20;
  const titleSize = useTransform(scrollY, [TRANSITION_START, TRANSITION_END], [startTitleSize, endTitleSize], { clamp: true });

  const borderShadowOpacity = useTransform(scrollY, [TRANSITION_END - 10, TRANSITION_END], [0, 1], { clamp: true });

  // Determine layout mode for title alignment/wrapping
  const useInlineLayout = !isMobile || isSticky; // True for sticky mobile or desktop

  return (
    <motion.header
      // Added z-30 here
      className={`w-full sticky top-0 z-30 flex items-center border-b bg-white px-4`}
      style={{
        paddingTop: headerPaddingY,
        paddingBottom: headerPaddingY,
        borderColor: useTransform(borderShadowOpacity, v => `rgba(229, 231, 235, ${v})`),
        boxShadow: useTransform(borderShadowOpacity, v => `0 1px 3px 0 rgba(0, 0, 0, ${0.1 * v}), 0 1px 2px -1px rgba(0, 0, 0, ${0.1 * v})`),
      }}
    >
      {/* Logo Div */}
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

      {/* Title Container - Conditional classes for centering/inline */}
      <motion.div
        className={`font-medium text-google-text ${
          useInlineLayout
            ? 'flex items-baseline' // Inline (sticky or desktop)
            : 'text-center w-full' // Centered, full width (initial mobile)
        }`}
        style={{ fontSize: titleSize }}
      >
        {/* Add conditional inline-block */}
        <span className={useInlineLayout ? '' : 'inline-block'}>Your</span>

        {/* Keep simple conditional rendering (no AnimatePresence) */}
        {hasMounted && !isSticky ? (
          <AnimatedWord key={currentWord} word={currentWord} />
        ) : (
          <span
            key="static-self"
            // Margin depends on layout mode now
            className={`inline-block text-yellow-400 ${useInlineLayout ? 'ml-0' : 'ml-1'}`}
          >
            self
          </span>
        )}

        {/* Add conditional inline-block */}
        <span className={useInlineLayout ? '' : 'inline-block'}>&nbsp;to Science</span>
      </motion.div>
    </motion.header>
  );
}