'use client';

import { useScroll } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import React from 'react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { scrollY } = useScroll();

  return (
    <div className="flex flex-col min-h-screen">
      <Header scrollY={scrollY} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
