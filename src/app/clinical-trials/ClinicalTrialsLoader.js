'use client';

import React, { Suspense } from 'react';
import ClinicalTrialsClientPage from './ClinicalTrialsClientPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScroll } from 'framer-motion';

function ClinicalTrialsPageSkeleton() {
  return (
    <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 py-8 animate-pulse">
      <div className="bg-gray-200 h-12 rounded-lg mb-8"></div>
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-4/5 mb-6"></div>
      <div className="h-4 bg-gray-200 rounded w-3/5 mb-6"></div>
      <div className="bg-gray-200 h-48 rounded-lg mb-8"></div>
      <div className="h-16 bg-gray-200 rounded-lg my-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
        ))}
      </div>
    </main>
  );
}

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