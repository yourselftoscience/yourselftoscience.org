// src/app/resource/[slug]/page.js
import { resources } from '@/data/resources';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaExternalLinkAlt, FaHeart, FaDollarSign, FaQuestionCircle, FaUniversity, FaBuilding, FaFlask, FaLandmark, FaInfoCircle, FaLaptop, FaMobileAlt, FaCog, FaShareAlt, FaMapMarkerAlt, FaGlobe, FaTag, FaClipboardList, FaUserCheck, FaUserFriends, FaCoins, FaListOl, FaUserShield, FaArrowRight } from 'react-icons/fa';

export async function generateStaticParams() {
  return resources.map((resource) => ({
    slug: resource.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resource = resources.find(p => p.slug === params.slug || p.id === params.slug);
  
  if (!resource) {
    return {
      title: 'Resource Not Found',
    };
  }
  
  const title = `${resource.title} - Yourself To Science`;
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
    scripts: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd),
      },
    ],
  };
}

export default function ResourcePage({ params }) {
  const resource = resources.find(p => p.slug === params.slug || p.id === params.slug);
  
  if (!resource) {
    return <div>Resource not found</div>;
  }

  // If the page was accessed via ID, redirect to the canonical slug URL
  if (params.slug === resource.id && params.slug !== resource.slug) {
    redirect(`/resource/${resource.slug}`);
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

  const getCompensationIcon = (type) => {
    if (type === 'donation') return <span className="text-red-500">❤️</span>;
    if (type === 'payment') return <span className="text-green-500">💵</span>;
    if (type === 'mixed') return <>❤️+💵</>;
    return null;
  };

  return (
    <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to all resources link */}
      <div className="mb-8">
        <Link href="/resources" className="text-blue-600 hover:underline flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
          Back to all resources
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-4xl font-extrabold text-gray-900">{resource.title}</h1>
          <p className="mt-2 text-lg text-gray-600">by {resource.organization}</p>
          
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

          {/* Persistent Identifier */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Persistent Identifier</h3>
            <p className="mt-2 text-gray-600">This is the permanent, unique ID for this resource. You can use this for stable linking and data integration.</p>
            <div className="mt-3 bg-gray-100 p-4 rounded-lg text-gray-700 font-mono text-sm break-all">
              https://yourselftoscience.org/resource/{resource.id}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}