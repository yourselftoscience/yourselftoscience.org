'use client';
import React from 'react';
import { Suspense } from 'react';
import ClinicalTrialsClientPage from './ClinicalTrialsClientPage';
import NewsletterSignup from '../../components/NewsletterSignup';

export default function ClinicalTrialsPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">Loading clinical trials...</div>}>
      <ClinicalTrialsClientPage />
    </Suspense>
  );
} 