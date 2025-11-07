// RENAME this file from ResourceTable.js to ResourceGrid.js
// This component now ONLY displays the resources passed to it.
'use client';

import React from 'react';
import ResourceCard from './ResourceCard';

export default function ResourceGrid({
  resources,
  filters,
  onFilterChange,
  onPaymentFilterChange,
  compensationTypesOptions,
  citationMap,
  onWearableFilterToggle,
  onMacroCategoryFilterChange,
}) {

  if (!resources) {
    return <div className="text-center text-gray-500 py-10">Loading resources...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.length > 0 ? (
        resources.map((resource) => (
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
          />
        ))
      ) : (
        <div className="col-span-full text-center text-gray-500 py-10">
          No resources found matching your filters.
        </div>
      )}
    </div>
  );
}
