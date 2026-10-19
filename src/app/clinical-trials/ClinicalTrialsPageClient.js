'use client';
import React from 'react';
import { Suspense } from 'react';
import PageLoading from '@/components/PageLoading';
import ClinicalTrialsClientPage from './ClinicalTrialsClientPage';

export default function ClinicalTrialsPageClient() {
  return (
    <Suspense fallback={<PageLoading title="Find Clinical Trials" description="Find clinical-trial registries and research-participation opportunities by location." />}>
      <ClinicalTrialsClientPage />
    </Suspense>
  );
} 