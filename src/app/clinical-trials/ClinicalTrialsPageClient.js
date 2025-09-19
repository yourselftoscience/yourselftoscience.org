'use client';
import React from 'react';
import { Suspense } from 'react';
import ClinicalTrialsLoader from './ClinicalTrialsLoader';
import ClinicalTrialsSkeleton from './ClinicalTrialsSkeleton';
import NewsletterSignup from '../../components/NewsletterSignup';

// Since this is a client component, we can use hooks and event handlers.
// All logic related to fetching data and interactivity for the clinical trials
// page will be handled here and in the components it loads.

export default function ClinicalTrialsPageClient() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Clinical Trials</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
          Find opportunities to participate in clinical studies. Your involvement
          can help drive medical advancements and new treatments.
        </p>
        <NewsletterSignup />
      </div>
      <Suspense fallback={<ClinicalTrialsSkeleton />}>
        <ClinicalTrialsLoader />
      </Suspense>
    </div>
  );
} 