import ClinicalTrialsLoader from './ClinicalTrialsLoader';
import { resources } from '@/data/resources';

export const runtime = 'edge';

// This is a Server Component, which allows for dynamic metadata generation.
export async function generateMetadata({ searchParams }) {
  const countriesStr = searchParams.countries;
  const countries = countriesStr ? countriesStr.split(',') : [];

  const baseTitle = 'Find Clinical Trials';
  const siteTitle = 'Yourself To Science';

  let title;
  let description;
  let url = 'https://yourselftoscience.org/clinical-trials';

  if (countries.length === 1) {
    const country = countries[0];
    // Simple capitalization, works for single-word countries.
    // A more robust solution might use a lookup, but this is fine for now.
    const countryCapitalized = country.charAt(0).toUpperCase() + country.slice(1);
    title = `Find Clinical Trials in ${countryCapitalized} | ${siteTitle}`;
    description = `A curated list of international and ${countryCapitalized}-specific platforms to find and participate in clinical trials. Search by disease, location, or as a healthy volunteer.`;
    url = `https://yourselftoscience.org/clinical-trials?countries=${country}`;

  } else if (countries.length > 1) {
    const countryNames = countries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
    title = `Find Clinical Trials in Multiple Countries | ${siteTitle}`;
    description = `A curated list of international and country-specific platforms to find clinical trials in ${countryNames}.`;
    url = `https://yourselftoscience.org/clinical-trials?countries=${countriesStr}`;

  } else {
    title = `${baseTitle} to Participate In | ${siteTitle}`;
    description = 'A curated list of international registries and platforms to find and participate in clinical trials. Search for studies by disease, location, or as a healthy volunteer.';
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
    },
     twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ClinicalTrialsPage() {
  // This server component renders the client-side loader which will handle all the dynamic parts.
  const clinicalTrialsResources = resources.filter(
    (resource) => resource.dataTypes && resource.dataTypes.includes('Clinical trials')
  );
  const totalResourcesCount = resources.length;
  return <ClinicalTrialsLoader resources={clinicalTrialsResources} totalResourcesCount={totalResourcesCount} />;
} 