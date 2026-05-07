import { activeResources as resources } from '@/data/resources';
import Link from 'next/link';
import { FiInfo, FiArrowRight } from 'react-icons/fi';
import wikidataStats from '@/data/wikidataStats.json';

export const metadata = {
  title: 'Academic & Technical Index - Yourself to Science',
  description: 'The complete A-Z technical directory of all scientific resources mapped in the Yourself to Science knowledge graph.',
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

  // Group resources by starting letter
  const groupedResources = sortedResources.reduce((acc, resource) => {
    const title = resource.wikidataLabel || resource.title;
    const firstLetter = title.charAt(0).toUpperCase();
    // Group numbers/symbols under '#'
    const groupKey = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(resource);
    return acc;
  }, {});

  const letters = Object.keys(groupedResources).sort();

  return (
    <main className="py-12 sm:py-16 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        
        {/* Header Section */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-3">
            Academic & Technical Index
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            A complete A-Z directory of all mapped entities within the Yourself to Science knowledge graph, serving as a reference on <strong>{wikidataStats.referencedItemsCount || 0} Wikidata items</strong>.
          </p>
        </div>

        {/* Notice Box */}
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl mb-12 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <FiInfo className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-blue-800">
              This index is optimized for search engines, machine readability, and academic auditing. For an interactive, user-friendly browsing experience, please use the Data Explorer.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/explore"
              className="inline-flex items-center px-4 py-2 border border-blue-200 text-sm font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 transition-colors shadow-sm"
            >
              Open Data Explorer
              <FiArrowRight className="ml-2 -mr-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sticky Alphabet Navigation (Desktop) */}
          <div className="hidden md:block w-12 shrink-0">
            <div className="sticky top-24 flex flex-col gap-1 items-center bg-slate-50 p-2 rounded-full border border-slate-200">
              {letters.map(letter => (
                <a 
                  key={letter} 
                  href={`#letter-${letter}`}
                  className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>

          {/* Alphabet Navigation (Mobile) */}
          <div className="md:hidden flex flex-wrap gap-2 justify-center mb-6">
            {letters.map(letter => (
              <a 
                key={letter} 
                href={`#letter-${letter}`}
                className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100"
              >
                {letter}
              </a>
            ))}
          </div>

          {/* Resource List Grouped by Letter */}
          <div className="flex-grow">
            <div className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
              {letters.map((letter, index) => (
                <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                  <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-3 border-b border-slate-200 border-t first:border-t-0 border-l-4 border-l-blue-400">
                    <h2 className="text-lg font-bold text-slate-800">{letter}</h2>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {groupedResources[letter].map(resource => (
                      <li key={resource.id}>
                        <Link
                          href={`/resource/${resource.slug}`}
                          className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors group"
                        >
                          <div className="flex-grow">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {resource.wikidataLabel || resource.title}
                            </p>
                            {resource.wikidataLabel && resource.wikidataLabel !== resource.title && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {resource.title}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {resource.dataTypes?.map(type => (
                                <span key={type} className="text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded">
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                          <FiArrowRight className="h-4 w-4 text-slate-300 flex-shrink-0 ml-4 transition-transform transform group-hover:translate-x-1 group-hover:text-blue-500" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}