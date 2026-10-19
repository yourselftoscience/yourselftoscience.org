'use client';
import React from 'react';
import { Suspense } from 'react';
import PageLoading from '@/components/PageLoading';
import OrganBodyTissueDonationClientPage from './OrganBodyTissueDonationClientPage';

export default function OrganBodyTissueDonationPageClient() {
  return (
    <Suspense fallback={<PageLoading title="Find Organ, Body & Tissue Donation Programs" description="Explore organ, body and tissue donation programmes for scientific research." />}>
      <OrganBodyTissueDonationClientPage />
    </Suspense>
  );
} 