'use client';

import dynamic from 'next/dynamic';
import OrganBodyTissueDonationSkeleton from './OrganBodyTissueDonationSkeleton.js';

const DynamicLoader = dynamic(
  () => import('./OrganBodyTissueDonationLoader'),
  {
    ssr: false,
    // The skeleton is used as a fallback while the client-side component is loading.
    loading: () => <OrganBodyTissueDonationSkeleton />,
  }
);

export default function OrganBodyTissueDonationPageClient() {
  return <DynamicLoader />;
} 