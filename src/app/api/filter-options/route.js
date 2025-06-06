import { NextResponse } from 'next/server';
import { resources as allResources } from '@/data/resources';

export async function GET() {
  const allTypes = allResources.flatMap(resource => resource.dataTypes || []);
  const mappedTypes = allTypes.map(type =>
    type.startsWith('Wearable data') ? 'Wearable data' : type
  );
  const uniqueTypes = [...new Set(mappedTypes)];
  const dataTypeOptions = uniqueTypes.sort((a, b) => a.localeCompare(b));

  const countries = new Set();
  const countryCodeMap = new Map();
  allResources.forEach((resource) => {
    resource.countries?.forEach((country, index) => {
      countries.add(country);
      if (resource.countryCodes?.[index] && !countryCodeMap.has(country)) {
        countryCodeMap.set(country, resource.countryCodes[index]);
      }
    });
  });
  if (allResources.some(r => r.countries?.includes('European Union'))) {
    countries.add('European Union');
    if (!countryCodeMap.has('European Union')) {
      countryCodeMap.set('European Union', 'EU');
    }
  }
  const countryOptions = Array.from(countries)
    .sort((a, b) => a.localeCompare(b))
    .map(country => ({ label: country, value: country, code: countryCodeMap.get(country) }));

  return NextResponse.json({ dataTypeOptions, countryOptions });
} 