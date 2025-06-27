import { Suspense } from 'react';
import ClinicalTrialsLoader from './ClinicalTrialsLoader';
import ClinicalTrialsSkeleton from './ClinicalTrialsSkeleton.js';

export const runtime = 'edge';

// Set static metadata for the page, as dynamic generation is not feasible
// with the client-side data loading strategy.
export const metadata = {
  title: 'Find Clinical Trials to Participate In | Yourself To Science',
  description: 'A curated list of international registries and platforms to find and participate in clinical trials. Search for studies by disease, location, or as a healthy volunteer.',
};

export default function ClinicalTrialsPage() {
  // This component now only serves as the server-side entry point
  // to configure the route and render the client-side loader.
  return (
    <Suspense fallback={<ClinicalTrialsSkeleton />}>
      <ClinicalTrialsLoader />
    </Suspense>
  );
} 