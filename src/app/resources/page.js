import { activeResources as resources } from '@/data/resources';
import Link from 'next/link';
import { FiInfo, FiArrowRight } from 'react-icons/fi';
import wikidataStats from '@/data/wikidataStats.json';

export const metadata = {
  title: 'All Resources - Yourself to Science',
  description: 'A complete catalogue of all services for contributing to science.',
  robots: {
    index: false,
    follow: true,
  },
  other: {
    'citation_title': 'Complete Resource Catalogue - Yourself to Science',
    'citation_author': 'Mario Marcolongo',
    'citation_publication_date': new Date().toISOString().split('T')[0].replace(/-/g, '/'),
    'citation_pdf_url': 'https://yourselftoscience.org/yourselftoscience.pdf',
    'citation_fulltext_world_readable': ' '
  }
};

export default function ResourcesListPage() {
  const sortedResources = [...resources].sort((a, b) => {
    const titleA = a.wikidataLabel || a.title;
    const titleB = b.wikidataLabel || b.title;
    return titleA.toLowerCase().localeCompare(titleB.toLowerCase());
  });

  return (
    <main className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">

        <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg mb-12 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiInfo className="h-5 w-5 text-slate-500" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-slate-800">Academic & Technical Index</h2>
            </div>
            <p className="text-sm text-slate-600 max-w-3xl">
              This is the complete structured index of all mapped entities within the Yourself to Science knowledge graph. 
              It is optimized for search engines, machine readability, and academic auditing. For interactive filtering and search, please use the Data Explorer.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/explore"
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Open Data Explorer
              <FiArrowRight className="ml-2 -mr-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            A-Z Directory
          </h1>
          <p className="text-xl text-slate-600">
            A complete catalogue of all services for contributing to science.
          </p>
          <div className="text-center text-sm text-slate-500 mt-4">
            Looking for programmatic data feeds? <Link href="/data" className="text-blue-600 hover:underline font-medium">Access Institutional Integrations (API/LLM/RDF)</Link>
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            These resources are mapped to the global knowledge graph, with this dataset currently serving as a reference on <strong>{wikidataStats.referencedItemsCount || 0} Wikidata items</strong>.
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {sortedResources.map(resource => (
              <li key={resource.id}>
                <Link
                  href={`/resource/${resource.slug}`}
                  className="flex items-center justify-between w-full px-4 py-5 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-grow">
                    <p className="font-semibold text-blue-600 group-hover:underline">
                      {resource.wikidataLabel || resource.title}
                    </p>
                    {resource.wikidataLabel && resource.wikidataLabel !== resource.title && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {resource.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {resource.dataTypes?.join(', ')}
                    </p>
                  </div>
                  <FiArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4 transition-transform transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}