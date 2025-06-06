import { NextResponse } from 'next/server';
import { resources as allResources, PAYMENT_TYPES, EU_COUNTRIES } from '@/data/resources';

// Helper function to parse list from URL params
const parseUrlList = (param) => (param ? param.split(',') : []);

// Helper function to expand EU countries
function expandCountries(chosen) {
  const set = new Set(chosen);
  if (chosen.includes('European Union')) {
    EU_COUNTRIES.forEach(c => set.add(c));
  }
  return Array.from(set);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Get filter criteria from search params
  const dataTypes = parseUrlList(searchParams.get('dataTypes'));
  const countries = parseUrlList(searchParams.get('countries'));
  const compensationTypes = parseUrlList(searchParams.get('compensationTypes'));
  const searchTerm = searchParams.get('searchTerm') || '';

  let filteredData = [...allResources];

  // Apply search term filter
  if (searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    filteredData = filteredData.filter(resource => {
      const titleMatch = resource.title && resource.title.toLowerCase().includes(lowerSearchTerm);
      const descriptionMatch = resource.description && resource.description.toLowerCase().includes(lowerSearchTerm);
      const dataTypeMatch = resource.dataTypes && resource.dataTypes.some(dt => dt.toLowerCase().includes(lowerSearchTerm));
      const countryMatch = resource.countries && resource.countries.some(c => c.toLowerCase().includes(lowerSearchTerm));
      const compensationTypeMatch = resource.compensationType && resource.compensationType.toLowerCase().includes(lowerSearchTerm);
      const citationMatch = resource.citations && resource.citations.some(cit =>
        (cit.title && cit.title.toLowerCase().includes(lowerSearchTerm)) ||
        (cit.link && cit.link.toLowerCase().includes(lowerSearchTerm))
      );
      const linkMatch = resource.link && resource.link.toLowerCase().includes(lowerSearchTerm);
      const instructionMatch = resource.instructions && resource.instructions.some(step => step.toLowerCase().includes(lowerSearchTerm));

      return titleMatch || descriptionMatch || dataTypeMatch || countryMatch || compensationTypeMatch || citationMatch || linkMatch || instructionMatch;
    });
  }

  // Apply data type filter
  if (dataTypes.length > 0) {
    filteredData = filteredData.filter(resource =>
      resource.dataTypes && dataTypes.some(filterType => {
        if (filterType === 'Wearable data') {
          return resource.dataTypes.some(rdt => rdt.startsWith('Wearable data'));
        }
        return resource.dataTypes.includes(filterType);
      })
    );
  }

  // Apply country filter
  const expandedCountries = expandCountries(countries);
  if (expandedCountries.length > 0) {
    filteredData = filteredData.filter(resource =>
      !resource.countries || resource.countries.length === 0 ||
      (resource.countries && resource.countries.some(rc => expandedCountries.includes(rc)))
    );
  }

  // Apply compensation type filter
  if (compensationTypes.length > 0) {
    filteredData = filteredData.filter(resource =>
      resource.compensationType && compensationTypes.includes(resource.compensationType)
    );
  }

  // Sort final results
  filteredData.sort((a, b) => a.title.localeCompare(b.title));

  return NextResponse.json(filteredData);
} 