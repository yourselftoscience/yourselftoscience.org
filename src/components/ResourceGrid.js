'use client';

import React from 'react';
import PropTypes from 'prop-types';
import ResourceCard from './ResourceCard';
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
    <div className="js-resource-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.length > 0 ? (
        resources.map((resource) => {
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
        })
      ) : (
        <div className="col-span-full text-center text-gray-500 py-10">
          No resources found matching your filters.
        </div>
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
