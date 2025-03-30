import { resources } from '@/data/resources';
import Link from 'next/link';

export const metadata = {
  title: 'All Resources - Yourself To Science',
  description: 'Browse all services for contributing to science with your data, genome, body, and more.',
  other: {
    'citation_title': 'Complete Resource Listing - Yourself To Science',
    'citation_author': 'Mario Marcolongo',
    'citation_publication_date': new Date().toISOString().split('T')[0].replace(/-/g, '/'),
    'citation_pdf_url': 'https://yourselftoscience.org/yourselftoscience.pdf',
  }
};

export default function ResourcesListPage() {
  // Sort resources alphabetically by title for consistent ordering
  const sortedResources = [...resources].sort((a, b) => 
    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">All Resources</h1>
      <p className="mb-8">A complete listing of all services for contributing to science.</p>
      
      <ul className="space-y-2">
        {sortedResources.map(resource => (
          <li key={resource.id} className="border-b pb-2">
            <Link 
              href={`/resource/${resource.id}`}
              className="text-blue-600 hover:underline"
            >
              {resource.title}
            </Link>
            <span className="ml-2 text-sm text-gray-500">
              [{resource.dataTypes?.join(', ')}]
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}