'use client';

import React from 'react';
import ClinicalTrialsClientPage from './ClinicalTrialsClientPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScroll } from 'framer-motion';
import { resources } from '@/data/resources';

export default function ClinicalTrialsLoader() {
  const { scrollY } = useScroll();

  const clinicalTrialsResources = resources.filter(
    (resource) => resource.dataTypes && resource.dataTypes.includes('Clinical trials')
  );
  const totalResourcesCount = resources.length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header scrollY={scrollY} />
      <main className="flex-grow">
        <ClinicalTrialsClientPage resources={clinicalTrialsResources} totalResourcesCount={totalResourcesCount} />
      </main>
      <Footer />
    </div>
  );
} 