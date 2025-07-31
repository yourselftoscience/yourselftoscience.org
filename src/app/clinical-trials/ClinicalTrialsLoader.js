'use client';

import React, { useState, useEffect } from 'react';
import ClinicalTrialsClientPage from './ClinicalTrialsClientPage';

import { useScroll } from 'framer-motion';
import ClinicalTrialsSkeleton from './ClinicalTrialsSkeleton';

export default function ClinicalTrialsLoader() {
  const { scrollY } = useScroll();
  const [pageData, setPageData] = useState({
    resources: [],
    totalCount: 0,
    isLoading: true,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch the static JSON file from the public folder.
        const response = await fetch('/resources.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allResources = await response.json();
        
        // Perform filtering on the client side.
        const clinicalTrialsResources = allResources.filter(
          (resource) => resource.dataTypes && resource.dataTypes.includes('Clinical trials')
        );
        const totalResourcesCount = allResources.length;

        setPageData({
          resources: clinicalTrialsResources,
          totalCount: totalResourcesCount,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch and process resources:", error);
        setPageData(prev => ({ ...prev, isLoading: false })); // Stop loading on error
      }
    }

    fetchData();
  }, []); // The empty dependency array ensures this runs only once on mount.

  return (
    <main className="flex-grow">
        {pageData.isLoading ? (
          <ClinicalTrialsSkeleton />
        ) : (
          <ClinicalTrialsClientPage 
            resources={pageData.resources} 
            totalResourcesCount={pageData.totalCount} 
          />
        )}
      </main>
  );
} 