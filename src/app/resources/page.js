import { activeResources as resources } from '@/data/resources';
import Link from 'next/link';
import { FiInfo, FiArrowRight } from 'react-icons/fi';

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
  const sortedResources = [...resources].sort((a, b) =>
    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );

  return (
    <main className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-12 text-center shadow-sm">
          <FiInfo className="h-8 w-8 text-blue-500 mx-auto mb-3" aria-hidden="true" />
          <div className="text-lg font-semibold text-blue-800">A Note for Our Visitors</div>
          <p className="mt-1 text-sm text-blue-700">
            You&apos;ve landed on a simplified catalogue designed for machine readability. For the best experience with filters and search, we recommend our main homepage.
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Take Me to the Homepage
              <FiArrowRight className="ml-2 -mr-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            All Resources
          </h1>
          <p className="mt-4 mb-4 text-xl text-gray-500">
            A complete catalogue of all services for contributing to science.
          </p>
          <div className="text-center text-sm text-gray-500">
            Looking for raw data? <Link href="/data" className="text-blue-600 hover:underline">Access the Open Datasets</Link>
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
                      {resource.title}
                    </p>
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