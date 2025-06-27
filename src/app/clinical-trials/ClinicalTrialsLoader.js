'use client';

import React from 'react';
import ClinicalTrialsClientPage from './ClinicalTrialsClientPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScroll } from 'framer-motion';

export default function ClinicalTrialsLoader({ resources, totalResourcesCount }) {
  const { scrollY } = useScroll();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header scrollY={scrollY} />
      <main className="flex-grow">
        <ClinicalTrialsClientPage resources={resources} totalResourcesCount={totalResourcesCount} />
      </main>
      <Footer />
    </div>
  );
} 