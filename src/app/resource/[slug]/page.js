// src/app/resource/[slug]/page.js
import resources from '@/../public/resources_wikidata.json';
import { redirect, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { permanentDoi } from '@/data/config';
import { FaCheckCircle, FaExternalLinkAlt, FaHeart, FaDollarSign, FaQuestionCircle, FaUniversity, FaBuilding, FaFlask, FaLandmark, FaInfoCircle, FaLaptop, FaMobileAlt, FaCog, FaShareAlt, FaMapMarkerAlt, FaGlobe, FaTag, FaClipboardList, FaUserCheck, FaUserFriends, FaCoins, FaListOl, FaUserShield, FaArrowRight, FaBox, FaBook, FaDatabase, FaCodeBranch, FaHandshake, FaLink } from 'react-icons/fa';
import CopyButton from '@/components/CopyButton';
import wikidataStats from '@/data/wikidataStats.json';
import WikidataIcon from '@/components/WikidataIcon';
import RorIcon from '@/components/RorIcon';

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

  const displayTitle = resource.wikidataLabel || resource.title;
  const title = `${displayTitle} - Yourself to Science`;
  const description = resource.wikidataDescription || resource.description || `Learn more about ${displayTitle}.`;
  const canonicalUrl = `https://yourselftoscience.org/resource/${resource.slug}`;
  const persistentIdUrl = `https://yourselftoscience.org/resource/${resource.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      siteName: 'Yourself to Science',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    other: {
      'citation_title': title,
      'citation_publisher': 'Yourself to Science',
      'citation_publication_date': new Date().getFullYear().toString(),
      'citation_language': 'en',
      'citation_inbook_title': 'Yourself to Science Catalogue',
      'DC.title': title,
      'DC.identifier': persistentIdUrl,
      'DC.description': description,
      'DC.publisher': 'Yourself to Science',
      'DC.relation.ispartof': `doi:${permanentDoi}`
    }
  };
}

export default function ResourcePage({ params }) {
  const resource = resources.find(p => p.slug === params.slug || p.id === params.slug);

  if (!resource) {
    return <div>Resource not found</div>;
  }

  const displayTitle = resource.wikidataLabel || resource.title;
  const displayDescription = resource.wikidataDescription || resource.description;

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
    '@type': 'Dataset',
    'name': displayTitle,
    'description': displayDescription,
    'url': canonicalUrl,
    'identifier': persistentIdUrl,
    'includedInDataCatalog': {
      '@type': 'DataCatalog',
      'name': 'Yourself to Science',
      'url': 'https://yourselftoscience.org',
      'identifier': `https://doi.org/${permanentDoi}`
    },
    'creator': resource.organizations ? resource.organizations.map(org => ({
      '@type': 'Organization',
      'name': org.name,
      'sameAs': [
        ...(org.wikidataId ? [`https://www.wikidata.org/wiki/${org.wikidataId}`] : []),
        ...(org.rorId ? [org.rorId] : [])
      ]
    })) : undefined,
    'isAccessibleForFree': true,
    ...(resource.resourceWikidataId && { 'sameAs': `https://www.wikidata.org/wiki/${resource.resourceWikidataId}` })
  };

  const isCitedOnWikidata = resource.resourceWikidataId && wikidataStats.items?.some(i => i.id === resource.resourceWikidataId);

  const renderCompensationPill = (type) => {
    switch(type) {
      case 'donation':
        return (
          <span className="inline-flex items-center bg-red-50 text-red-700 border border-red-100 text-md font-medium px-4 py-2 rounded-full">
            <FaHeart className="mr-2 text-red-500" /> Unpaid Donation
          </span>
        );
      case 'payment':
        return (
          <span className="inline-flex items-center bg-green-50 text-green-700 border border-green-100 text-md font-medium px-4 py-2 rounded-full">
            <FaDollarSign className="mr-2 text-green-600" /> Financial Compensation
          </span>
        );
      case 'mixed':
        return (
          <span className="inline-flex items-center bg-indigo-50 text-indigo-700 border border-indigo-100 text-md font-medium px-4 py-2 rounded-full">
            <FaHandshake className="mr-2 text-indigo-500" /> Mixed (Donation & Payment)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-gray-100 text-gray-800 border border-gray-200 text-md font-medium px-4 py-2 rounded-full">
            {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
          </span>
        );
    }
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
              Catalogue
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li className="text-gray-500 font-medium truncate max-w-[200px] sm:max-w-md md:max-w-lg" aria-current="page">
            {displayTitle}
          </li>
        </ol>
      </nav>

      {/* Researcher Trust Banner */}
      <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
        <FaInfoCircle className="text-indigo-600 mt-0.5 shrink-0" />
        <div className="text-sm text-indigo-900 leading-snug">
          <strong>Open Science Record:</strong> This resource is mapped as structured metadata within the Yourself to Science knowledge base, providing transparent information to support reproducible research and scientific discovery.
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">{displayTitle}</h1>
              {resource.wikidataLabel && resource.wikidataLabel !== resource.title && (
                <p className="mt-2 text-md text-gray-500 italic">Also known as: {resource.title}</p>
              )}
              <p className="mt-2 text-lg text-gray-600">by {resource.organizations ? resource.organizations.map((o, i) => (
            <span key={i}>
              {(() => {
                const rorUrl = o.rorId && o.rorId !== 'IGNORE' ? (o.rorId.startsWith('http') ? o.rorId : `https://ror.org/${o.rorId}`) : null;
                const orgUrl = rorUrl || (o.wikidataId ? `https://www.wikidata.org/wiki/${o.wikidataId}` : null);
                
                return orgUrl ? (
                  <span className="inline-flex items-center gap-2">
                    <a href={orgUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                      {o.name}
                    </a>
                    {rorUrl && (
                      <a href={rorUrl} target="_blank" rel="noopener noreferrer" title="View on Research Organization Registry (ROR)" className="text-[10px] text-blue-500 hover:text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase font-bold tracking-tighter">
                        ROR
                      </a>
                    )}
                  </span>
                ) : (
                  o.name
                );
              })()}
              {i < resource.organizations.length - 1 ? '; ' : ''}
            </span>
          )) : ''}</p>
              <p className="mt-1 text-sm text-gray-500 font-mono">ID: {resource.id}</p>
            </div>
            <div className="shrink-0 mt-2 md:mt-0 flex flex-col items-end gap-3">
              <img src={`/api/badge/${resource.slug}`} alt="Yourself to Science Verified Badge" className="h-6 filter drop-shadow-sm" />
              <a 
                href={resource.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hidden md:inline-flex items-center justify-center px-4 py-2 border border-blue-200 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm"
              >
                Access Resource <FaExternalLinkAlt className="ml-2 h-3 w-3" />
              </a>
            </div>
          </div>

          {displayDescription && (
            <p className="mt-6 text-gray-800 text-lg leading-relaxed">{displayDescription}</p>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Data Types</h2>
              <div className="flex flex-wrap gap-3">
                {(resource.dataTypes || []).map((type) => {
                  return (
                    <Link
                      href={`/data-types/${type.toLowerCase().replace(/\s+/g, '-')}`}
                      key={type}
                      className="inline-flex items-center bg-blue-100 text-blue-800 text-md font-medium px-4 py-2 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                      title={`View definition for ${type}`}
                    >
                      <FaTag className="mr-2" /> {type}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Availability</h2>
              <div className="flex flex-col gap-3">
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
                {resource.excludedCountries && resource.excludedCountries.length > 0 && (
                  <div className="text-sm text-red-600 mt-1">
                    <span className="font-semibold">Excludes:</span> {resource.excludedCountries.join(', ')}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Compensation</h2>
              {renderCompensationPill(resource.compensationType)}
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Entity Type</h2>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center bg-purple-100 text-purple-800 text-md font-medium px-4 py-2 rounded-full">
                  <FaInfoCircle className="mr-2" /> {resource.entityCategory} / {resource.entitySubType}
                </span>
                {resource.organizations?.some(o => o.rorTypes) && (
                  <span className="inline-flex items-center bg-indigo-50 text-indigo-700 text-md font-medium px-4 py-2 rounded-full border border-indigo-100">
                    <FaUniversity className="mr-2" /> {Array.from(new Set(resource.organizations.flatMap(o => o.rorTypes || []))).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}
                  </span>
                )}
              </div>
            </div>

            {resource.origin && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Based In</h2>
                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center bg-teal-100 text-teal-800 text-md font-medium px-4 py-2 rounded-full">
                    <FaBuilding className="mr-2" /> {resource.origin} {resource.originCode ? `(${resource.originCode})` : ''}
                  </span>
                  {resource.organizations?.some(o => o.rorCity) && (
                    <span className="text-sm text-gray-500 ml-4 flex items-center">
                      <FaMapMarkerAlt className="mr-1.5 text-gray-400" /> 
                      {Array.from(new Set(resource.organizations.map(o => `${o.rorCity}, ${o.rorCountry}`))).join('; ')} (via ROR)
                    </span>
                  )}
                </div>
              </div>
            )}

            {resource.resourceType && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Resource Type</h2>
                <span className="inline-flex items-center bg-orange-100 text-orange-800 text-md font-medium px-4 py-2 rounded-full">
                  <FaDatabase className="mr-2" /> {resource.resourceType.charAt(0).toUpperCase() + resource.resourceType.slice(1)}
                </span>
              </div>
            )}

            {resource.compatibleSources && resource.compatibleSources.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Compatible Sources</h2>
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
              Access Resource <FaExternalLinkAlt className="ml-3 h-5 w-5" />
            </a>
          </div>

          {resource.instructions && resource.instructions.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Instructions</h2>
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

          {/* Platform Visibility & Indexing */}
          <div className="mt-12 bg-white border border-blue-100 shadow-sm rounded-xl overflow-hidden">
            <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex items-center">
              <FaGlobe className="mr-3 text-blue-600 w-5 h-5" /> 
              <h3 className="text-xl font-bold text-gray-900">Platform Visibility & Indexing</h3>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Platform Directories */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaBox className="mr-2 text-gray-500" /> Directory Listings
                </h4>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  This initiative is actively featured in the following public directories for citizens, patients, and researchers:
                </p>
                <ul className="space-y-3">
                  <li>
                    <a href={`/?resource=${resource.slug}`} className="flex items-center text-sm font-medium text-blue-700 hover:text-blue-900 bg-blue-50/50 border border-blue-100 px-4 py-2.5 rounded-lg transition-colors">
                      <FaArrowRight className="mr-2 text-blue-400 w-4 h-4" /> Main Homepage Catalogue
                    </a>
                  </li>
                  {resource.dataTypes?.some(t => t.toLowerCase().includes('clinical trial')) && (
                    <li>
                      <a href={`/clinical-trials#${resource.slug}`} className="flex items-center text-sm font-medium text-blue-700 hover:text-blue-900 bg-blue-50/50 border border-blue-100 px-4 py-2.5 rounded-lg transition-colors">
                        <FaArrowRight className="mr-2 text-blue-400 w-4 h-4" /> Clinical Trials Directory
                      </a>
                    </li>
                  )}
                  {resource.dataTypes?.some(t => t.toLowerCase().includes('genome')) && (
                    <li>
                      <a href={`/genetic-data#${resource.slug}`} className="flex items-center text-sm font-medium text-blue-700 hover:text-blue-900 bg-blue-50/50 border border-blue-100 px-4 py-2.5 rounded-lg transition-colors">
                        <FaArrowRight className="mr-2 text-blue-400 w-4 h-4" /> Genetic Data Directory
                      </a>
                    </li>
                  )}
                  {resource.dataTypes?.some(t => ['tissue', 'blood', 'organ', 'body', 'stool', 'hair', 'placenta', 'plasma', 'embryos', 'eggs'].some(keyword => t.toLowerCase().includes(keyword))) && (
                    <li>
                      <a href={`/organ-body-tissue-donation#${resource.slug}`} className="flex items-center text-sm font-medium text-blue-700 hover:text-blue-900 bg-blue-50/50 border border-blue-100 px-4 py-2.5 rounded-lg transition-colors">
                        <FaArrowRight className="mr-2 text-blue-400 w-4 h-4" /> Biological Donation Directory
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {/* Knowledge Graph Integration */}
              {(resource.resourceWikidataId || resource.organizations?.some(o => o.wikidataId || (o.rorId && o.rorId !== 'IGNORE'))) && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaLink className="mr-2 text-blue-600" size="1.1em" /> Knowledge Graph Integration
                  </h4>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    We have successfully mapped this initiative to the open science knowledge graph (the central databases powering Wikipedia, AI platforms, and institutional registries).
                  </p>
                  <ul className="space-y-4">
                    {resource.organizations?.map((o, i) => {
                      const rorUrl = o.rorId && o.rorId !== 'IGNORE' ? (o.rorId.startsWith('http') ? o.rorId : `https://ror.org/${o.rorId}`) : null;
                      return (o.wikidataId || rorUrl) && (
                        <li key={`org-${i}`} className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg flex flex-col gap-2">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide block">Organization Record: {o.name}</span>
                          <div className="flex flex-wrap gap-2">
                            {o.wikidataId && (
                              <a href={`https://www.wikidata.org/wiki/${o.wikidataId}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 hover:underline font-medium text-xs flex items-center bg-white border border-blue-100 px-2 py-1 rounded shadow-sm">
                                <WikidataIcon className="mr-1.5" size="1.1em" /> Wikidata Element
                              </a>
                            )}
                            {rorUrl && (
                              <a href={rorUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 hover:underline font-medium text-xs flex items-center bg-white border border-blue-100 px-2 py-1 rounded shadow-sm">
                                <RorIcon className="mr-1.5" size="1.1em" /> ROR Registry
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                    {resource.resourceWikidataId && (
                      <li className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg flex flex-col gap-2">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide block">Research Initiative Record: {resource.title}</span>
                        <div>
                          <a href={`https://www.wikidata.org/wiki/${resource.resourceWikidataId}`} target="_blank" rel="noopener noreferrer" className="inline-flex text-blue-700 hover:text-blue-900 hover:underline font-medium text-xs items-center bg-white border border-blue-100 px-2 py-1 rounded shadow-sm">
                            <WikidataIcon className="mr-1.5" size="1.1em" /> Wikidata Project ID
                          </a>
                        </div>
                      </li>
                    )}
                  </ul>
                  {isCitedOnWikidata && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-start text-sm font-medium text-green-700">
                      <FaCheckCircle className="mr-2 mt-0.5 flex-shrink-0 text-green-500" />
                      <span>This resource officially leverages Yourself to Science as a verified data sourcing reference on Wikidata.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Technical Metadata Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 bg-gray-50 -mx-8 -mb-8 p-8 md:px-10 rounded-b-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <FaDatabase className="mr-2 text-gray-500" /> Technical Data Assets
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Persistent Identifier</p>
                <div className="bg-white border border-gray-300 p-2.5 rounded-md text-gray-700 font-mono text-sm break-all shadow-sm flex items-center justify-between">
                  <span>https://yourselftoscience.org/resource/{resource.id}</span>
                  <CopyButton text={`https://yourselftoscience.org/resource/${resource.id}`} />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Stable node URL for programmatic extraction.
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Raw JSON Datasets</p>
                <div className="space-y-3">
                  <a href={`/resources.json`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline text-sm font-medium">
                    <FaCodeBranch className="mr-2 text-blue-400" /> Download resources.json schema
                  </a>
                  <a href={`/data`} className="flex items-center text-blue-600 hover:underline text-sm font-medium">
                    <FaDatabase className="mr-2 text-blue-400" /> Access Institutional Integrations (API)
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Badge Embed */}
          <div className="bg-white border-t border-gray-200 -mx-8 -mb-8 p-8 md:px-10 rounded-b-lg">
            <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-xl shadow-sm">
              <h4 className="text-lg font-bold text-indigo-950 mb-2">Showcase your commitment to Open Science</h4>
              <p className="text-sm text-indigo-800 mb-6 opacity-90">Embed this badge on your project&apos;s website to showcase your commitment to open science and provide an official link to your public dataset record.</p>
              
              <div className="bg-white border border-indigo-100 p-5 rounded-lg flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
                <img src={`/api/badge/${resource.id}`} alt="Dataset Status Badge" className="h-6" />
                <div className="text-xs font-mono text-gray-500 break-all w-full text-center md:text-left selection:bg-indigo-100 px-2">
                  {`[![Indexed by Yourself to Science](https://yourselftoscience.org/api/badge/${resource.id})](https://yourselftoscience.org/resource/${resource.id})`}
                </div>
                <CopyButton text={`[![Indexed by Yourself to Science](https://yourselftoscience.org/api/badge/${resource.id})](https://yourselftoscience.org/resource/${resource.id})`} />
              </div>
              
              <div className="mt-6 text-sm">
                <a href={`mailto:science@yourselftoscience.org?subject=Claim%20Record%3A%20${encodeURIComponent(resource.title)}`} className="text-indigo-700 hover:text-indigo-900 hover:underline font-semibold inline-flex items-center">
                  Are you affiliated with this project? Claim or update this record <FaArrowRight className="ml-2 w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore More CTA */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-xl font-bold mb-2">Explore the Full Knowledge Graph</h3>
          <p className="text-blue-100 text-sm max-w-lg leading-relaxed">
            Yourself to Science maps the entire landscape of human contribution. Discover hundreds of other research opportunities, datasets, and platforms in our interactive Data Explorer.
          </p>
        </div>
        <Link href="/explore" className="shrink-0 bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm">
          Open Data Explorer
        </Link>
      </div>
    </main>
  );
}