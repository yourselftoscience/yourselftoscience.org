'use client';
import React from 'react';
import { Suspense } from 'react';
import OrganBodyTissueDonationLoader from './OrganBodyTissueDonationLoader';
import OrganBodyTissueDonationSkeleton from './OrganBodyTissueDonationSkeleton';
import NewsletterSignup from '../../components/NewsletterSignup';

// Client component for the Organ, Body & Tissue Donation page.
// This component will handle the interactive parts of the page, including
// loading and displaying the resources.

export default function OrganBodyTissueDonationPageClient() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Organ, Body & Tissue Donation
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
          Discover ways to make a lasting contribution to medical research and
          education through donation.
        </p>
        <NewsletterSignup />
      </div>
      <Suspense fallback={<OrganBodyTissueDonationSkeleton />}>
        <OrganBodyTissueDonationLoader />
      </Suspense>
    </div>
  );
} 