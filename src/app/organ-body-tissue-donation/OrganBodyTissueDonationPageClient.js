'use client';
import React from 'react';
import { Suspense } from 'react';
import OrganBodyTissueDonationClientPage from './OrganBodyTissueDonationClientPage';
import NewsletterSignup from '../../components/NewsletterSignup';

export default function OrganBodyTissueDonationPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">Loading donation programs...</div>}>
      <OrganBodyTissueDonationClientPage />
    </Suspense>
  );
} 