import { Suspense } from 'react';
import ClinicalTrialsPageClient from './ClinicalTrialsPageClient.js';
import ClinicalTrialsSkeleton from './ClinicalTrialsSkeleton.js';

export const runtime = 'edge';

// Static metadata remains here in the Server Component.
export const metadata = {
  title: 'Find Clinical Trials to Participate In | Yourself To Science',
  description: 'A curated list of international registries and platforms to find and participate in clinical trials. Search for studies by disease, location, or as a healthy volunteer.',
};

export default function ClinicalTrialsPage() {
  // The page now renders the client component responsible for dynamic loading.
  return (
    <Suspense fallback={<ClinicalTrialsSkeleton />}>
      <ClinicalTrialsPageClient />
    </Suspense>
  );
} 