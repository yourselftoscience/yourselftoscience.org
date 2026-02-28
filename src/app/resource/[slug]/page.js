// src/app/resource/[slug]/page.js
import { resources } from '@/data/resources';
import { redirect, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { FaExternalLinkAlt, FaHeart, FaDollarSign, FaQuestionCircle, FaUniversity, FaBuilding, FaFlask, FaLandmark, FaInfoCircle, FaLaptop, FaMobileAlt, FaCog, FaShareAlt, FaMapMarkerAlt, FaGlobe, FaTag, FaClipboardList, FaUserCheck, FaUserFriends, FaCoins, FaListOl, FaUserShield, FaArrowRight, FaBox, FaBook, FaDatabase, FaCodeBranch } from 'react-icons/fa';

export async function generateStaticParams() {
  const slugs = resources.map((resource) => ({
    slug: resource.slug,
  }));
  const ids = resources.map((resource) => ({
    slug: resource.id,
  }));
  return [...slugs, ...ids];
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const resource = resources.find(p => p.slug === params.slug || p.id === params.slug);

  if (!resource) {
    return {
      title: 'Resource Not Found',
    };
  }

  const title = `${resource.title} - Yourself to Science`;
  const description = resource.description || `Learn more about contributing to ${resource.title}.`;
  const canonicalUrl = `https://yourselftoscience.org/resource/${resource.slug}`;
  const persistentIdUrl = `https://yourselftoscience.org/resource/${resource.id}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': resource.title,
    'url': canonicalUrl,
    'identifier': persistentIdUrl,
  };

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function ResourcePage({ params }) {
  const resource = resources.find(p => p.slug === params.slug || p.id === params.slug);

  if (!resource) {
    return <div>Resource not found</div>;
  }

  // If the page was accessed via ID, redirect to the canonical slug URL
  if (params.slug === resource.id && params.slug !== resource.slug) {
    permanentRedirect(`/resource/${resource.slug}`);
  }

  const getStepIcon = (step) => {
    const lowerStep = step.toLowerCase();
    if (lowerStep.includes('fitbit app') || lowerStep.includes('open the app')) return <FaMobileAlt className="text-blue-500" />;
    if (lowerStep.includes('settings')) return <FaCog className="text-gray-600" />;
    if (lowerStep.includes('privacy')) return <FaUserShield className="text-green-500" />;
    if (lowerStep.includes('tap') || lowerStep.includes('select') || lowerStep.includes('go to')) return <FaArrowRight className="text-yellow-500" />;
    return <FaArrowRight className="text-gray-500" />;
  };

  const persistentIdUrl = `https://yourselftoscience.org/resource/${resource.id}`;
  const canonicalUrl = `https://yourselftoscience.org/resource/${resource.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': resource.title,
    'url': canonicalUrl,
    'identifier': persistentIdUrl,
    'mainEntity': {
      '@type': 'Thing',
      'name': resource.title,
      'description': resource.description,
      'url': resource.link,
      ...(resource.resourceWikidataId && { 'sameAs': `https://www.wikidata.org/wiki/${resource.resourceWikidataId}` })
    }
  };

  const getCompensationIcon = (type) => {
    if (type === 'donation') return <span className="text-red-500">❤️</span>;
    if (type === 'payment') return <span className="text-green-500">💵</span>;
    if (type === 'mixed') return <>❤️+💵</>;
    return null;
  };

  return (
    <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-8 text-sm">
        <ol className="flex items-center space-x-2 text-gray-600 flex-wrap">
          <li>
            <Link href="/" className="text-blue-600 hover:underline">
              Home
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li>
            <Link href="/resources" className="text-blue-600 hover:underline">
              Resource
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li className="text-gray-500 font-medium truncate max-w-[200px] sm:max-w-md md:max-w-lg" aria-current="page">
            {resource.title}
          </li>
        </ol>
      </nav>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-4xl font-extrabold text-gray-900">{resource.title}</h1>
          <p className="mt-2 text-lg text-gray-600">by {resource.organizations ? resource.organizations.map((o, i) => (
            <span key={i}>
              {o.wikidataId ? (
                <a href={`https://www.wikidata.org/wiki/${o.wikidataId}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                  {o.name}
                </a>
              ) : (
                o.name
              )}
              {i < resource.organizations.length - 1 ? '; ' : ''}
            </span>
          )) : ''}</p>
          <p className="mt-1 text-sm text-gray-500 font-mono">ID: {resource.id}</p>

          {resource.description && (
            <p className="mt-6 text-gray-800 text-lg leading-relaxed">{resource.description}</p>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Types</h2>
              <div className="flex flex-wrap gap-3">
                {(resource.dataTypes || []).map((type) => (
                  <span key={type} className="inline-flex items-center bg-blue-100 text-blue-800 text-md font-medium px-4 py-2 rounded-full">
                    <FaTag className="mr-2" /> {type}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Availability</h2>
              <div className="flex flex-wrap gap-3">
                {(resource.countries || []).length === 0 || (resource.countries && resource.countries[0] === "Worldwide") ? (
                  <span className="inline-flex items-center bg-green-100 text-green-800 text-md font-medium px-4 py-2 rounded-full">
                    <FaGlobe className="mr-2" /> Worldwide
                  </span>
                ) : (
                  (resource.countries || []).map((country, index) => (
                    <span key={country} className="inline-flex items-center bg-green-100 text-green-800 text-md font-medium px-4 py-2 rounded-full">
                      <FaMapMarkerAlt className="mr-2" /> {country}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Compensation</h2>
              <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-md font-medium px-4 py-2 rounded-full">
                {getCompensationIcon(resource.compensationType)} {resource.compensationType}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Entity Type</h2>
              <span className="inline-flex items-center bg-purple-100 text-purple-800 text-md font-medium px-4 py-2 rounded-full">
                <FaInfoCircle className="mr-2" /> {resource.entityCategory} / {resource.entitySubType}
              </span>
            </div>
            
            {resource.compatibleSources && resource.compatibleSources.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Compatible Sources</h2>
                <div className="flex flex-wrap gap-3">
                  {resource.compatibleSources.map((source) => (
                    <span key={source} className="inline-flex items-center bg-indigo-100 text-indigo-800 text-md font-medium px-4 py-2 rounded-full">
                      <FaBox className="mr-2" /> {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          <div className="mt-10 text-center">
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-md shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
            >
              Contribute Now <FaExternalLinkAlt className="ml-3 h-5 w-5" />
            </a>
          </div>

          {resource.instructions && resource.instructions.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">How to Contribute</h2>
              <ol className="relative border-l border-gray-200">
                {resource.instructions.map((instruction, index) => (
                  <li key={index} className="mb-10 ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-8 ring-white">
                      {getStepIcon(instruction)}
                    </span>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-lg font-semibold text-gray-900">{instruction}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {resource.citations && resource.citations.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <FaBook className="mr-3 text-gray-600" /> References
              </h2>
              <ul className="list-disc list-inside space-y-3 text-gray-700 ml-4">
                {resource.citations.map((citation, index) => (
                  <li key={index}>
                    {citation.link ? (
                      <a href={citation.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {citation.title}
                      </a>
                    ) : (
                      citation.title
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metadata & Open Data */}
          <div className="mt-12 pt-8 border-t border-gray-200 bg-gray-50 -mx-8 -mb-8 p-8 rounded-b-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaDatabase className="mr-2 text-blue-600" /> Open Data & Metadata
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Persistent Identifier</p>
                <div className="bg-white border border-gray-200 p-3 rounded-md text-gray-800 font-mono text-sm break-all shadow-sm">
                  https://yourselftoscience.org/resource/{resource.id}
                </div>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  Use this permanent ID for stable linking in research papers and dataset integrations.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Linked Open Data</p>
                <div className="space-y-3">
                  <a href="/data" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                    <FaCodeBranch className="mr-2" /> View Full Catalogue Dataset
                  </a>
                  {resource.resourceWikidataId && (
                    <a href={`https://www.wikidata.org/wiki/${resource.resourceWikidataId}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                      <span className="mr-2 font-bold font-serif px-1 bg-gray-200 text-gray-600 rounded text-xs">W</span>
                      Wikidata Entity ({resource.resourceWikidataId})
                    </a>
                  )}
                  <a href={`/resources.json`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                    <FaDatabase className="mr-2" /> Download resources.json
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}