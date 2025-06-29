'use client';

import React, { useState, useEffect } from 'react';
import OrganBodyTissueDonationClientPage from './OrganBodyTissueDonationClientPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScroll } from 'framer-motion';
import OrganBodyTissueDonationSkeleton from './OrganBodyTissueDonationSkeleton';

export default function OrganBodyTissueDonationLoader() {
  const { scrollY } = useScroll();
  const [pageData, setPageData] = useState({
    resources: [],
    totalCount: 0,
    isLoading: true,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/resources.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allResources = await response.json();
        
        // Filter for Body or Tissue donation resources.
        const bodyDonationResources = allResources.filter(
          (resource) => resource.dataTypes && (resource.dataTypes.includes('Organ') || resource.dataTypes.includes('Body') || resource.dataTypes.includes('Tissue'))
        );
        const totalResourcesCount = allResources.length;

        setPageData({
          resources: bodyDonationResources,
          totalCount: totalResourcesCount,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch and process resources:", error);
        setPageData(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header scrollY={scrollY} />
      <main className="flex-grow">
        {pageData.isLoading ? (
          <OrganBodyTissueDonationSkeleton />
        ) : (
          <OrganBodyTissueDonationClientPage 
            resources={pageData.resources} 
            totalResourcesCount={pageData.totalCount} 
          />
        )}
      </main>
      <Footer />
    </div>
  );
} 