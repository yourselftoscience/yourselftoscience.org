'use client';

import dynamic from 'next/dynamic';
import ClinicalTrialsSkeleton from './ClinicalTrialsSkeleton.js';

const DynamicLoader = dynamic(
  () => import('./ClinicalTrialsLoader'),
  {
    ssr: false,
    // The skeleton is used as a fallback while the client-side component is loading.
    loading: () => <ClinicalTrialsSkeleton />,
  }
);

export default function ClinicalTrialsPageClient() {
  return <DynamicLoader />;
} 