'use client';

import React from 'react';
import PropTypes from 'prop-types';
import ResourceCard from './ResourceCard';
import NewsletterSignup from './NewsletterSignup';
import { useCardAlignment } from '@/hooks/useCardAlignment';

export default function ResourceGrid({
  resources,
  filters,
  onFilterChange,
  onPaymentFilterChange,
  compensationTypesOptions,
  citationMap,
  onWearableFilterToggle,
  onMacroCategoryFilterChange,
  highlightedResourceSlug,
}) {
  // Apply dynamic row alignment to title and organization elements
  useCardAlignment('.js-resource-grid', ['.js-card-title', '.js-card-org']);

  // Scroll to highlighted card when it becomes available
  React.useEffect(() => {
    if (highlightedResourceSlug) {
      const elementId = `resource-${highlightedResourceSlug}`;
      const element = document.getElementById(elementId);

      if (element) {
        element.scrollIntoView({ behavior: 'auto', block: 'center' });
      } else {
        // Simple poll to find the element if it's not immediately available
        const interval = setInterval(() => {
          const el = document.getElementById(elementId);
          if (el) {
            el.scrollIntoView({ behavior: 'auto', block: 'center' });
            clearInterval(interval);
          }
        }, 100);

        // Clear interval after 5 seconds to avoid leaks
        setTimeout(() => clearInterval(interval), 5000);
      }
    }
  }, [highlightedResourceSlug]);

  if (!resources) {
    return <div className="text-center text-gray-500 py-10">Loading resources...</div>;
  }

  return (
    <div className="js-resource-grid">
      {resources.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.slice(0, 3).map((resource) => {
              const isHighlighted = highlightedResourceSlug === resource.slug;
              return (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  filters={filters}
                  onFilterChange={onFilterChange}
                  onPaymentFilterChange={onPaymentFilterChange}
                  compensationTypesOptions={compensationTypesOptions}
                  citationMap={citationMap}
                  onWearableFilterToggle={onWearableFilterToggle}
                  onMacroCategoryFilterChange={onMacroCategoryFilterChange}
                  isHighlighted={isHighlighted}
                />
              );
            })}
          </div>

          {resources.length > 3 && (
            <>
              {/* Inline Newsletter Injection */}
              <div className="mb-10 mt-8 w-full max-w-3xl mx-auto px-4">
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-8 px-5 md:py-10 md:px-8 shadow-[0_8px_30px_rgb(37,99,235,0.2)] rounded-3xl relative overflow-hidden border border-blue-500/30">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/30 rounded-full -translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none" />
                  <div className="relative z-10">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 text-center tracking-tight">Stay Updated on New Projects</h2>
                    <p className="text-sm md:text-base text-blue-100 mb-6 max-w-xl mx-auto text-center leading-relaxed font-medium">
                      New opportunities are added constantly to our catalogue. Join our newsletter to receive the latest scientific research programs directly to your inbox.
                    </p>
                    <NewsletterSignup />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.slice(3).map((resource) => {
                  const isHighlighted = highlightedResourceSlug === resource.slug;
                  return (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      filters={filters}
                      onFilterChange={onFilterChange}
                      onPaymentFilterChange={onPaymentFilterChange}
                      compensationTypesOptions={compensationTypesOptions}
                      citationMap={citationMap}
                      onWearableFilterToggle={onWearableFilterToggle}
                      onMacroCategoryFilterChange={onMacroCategoryFilterChange}
                      isHighlighted={isHighlighted}
                    />
                  );
                })}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="col-span-full text-center text-slate-500 py-10 bg-slate-50/50 rounded-2xl border border-slate-200">
            No resources found matching your current filters. Try relaxing some options.
          </div>
          
          <div className="mb-12 mt-8 w-full max-w-3xl mx-auto px-4">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-8 px-5 md:py-10 md:px-8 shadow-[0_8px_30px_rgb(37,99,235,0.2)] rounded-3xl relative overflow-hidden border border-blue-500/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/30 rounded-full -translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 text-center tracking-tight">Stay Updated on New Projects</h2>
                <p className="text-sm md:text-base text-blue-100 mb-6 max-w-xl mx-auto text-center leading-relaxed font-medium">
                  New opportunities are added constantly to our catalogue. Join our newsletter to receive the latest scientific research programs directly to your inbox.
                </p>
                <NewsletterSignup />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

ResourceGrid.propTypes = {
  resources: PropTypes.array,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  onPaymentFilterChange: PropTypes.func,
  compensationTypesOptions: PropTypes.array,
  citationMap: PropTypes.object,
  onWearableFilterToggle: PropTypes.func,
  onMacroCategoryFilterChange: PropTypes.func,
  highlightedResourceSlug: PropTypes.string,
};
