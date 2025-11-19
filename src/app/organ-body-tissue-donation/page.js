import { Suspense } from 'react';
import OrganBodyTissueDonationPageClient from './OrganBodyTissueDonationPageClient.js';
import OrganBodyTissueDonationSkeleton from './OrganBodyTissueDonationSkeleton.js';

// Static metadata remains here in the Server Component.
export const metadata = {
  title: 'Find Organ, Body, and Tissue Donation Programs | Yourself to Science',
  description: 'A curated list of programs for organ, body, and tissue donation for scientific research. Find opportunities to contribute by location.',
};

export default function OrganBodyTissueDonationPage() {
  // The page now renders the client component responsible for dynamic loading.
  return (
    <Suspense fallback={<OrganBodyTissueDonationSkeleton />}>
      <OrganBodyTissueDonationPageClient />
    </Suspense>
  );
} 