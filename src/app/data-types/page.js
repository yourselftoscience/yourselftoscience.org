import { dataTypesOntology } from '@/data/ontology';
import { FaBook, FaDatabase, FaLink } from 'react-icons/fa';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';

export const metadata = {
    title: 'Data Dictionary | Yourself to Science',
    description: 'Ontology definitions for the various biological, digital, and clinical data types tracked in the Yourself to Science catalogue.',
};

export default function DataTypesPage() {
    // Sort ontology alphabetically by title
    const sortedTypes = [...dataTypesOntology].sort((a, b) => a.title.localeCompare(b.title));

    return (
        <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl flex items-center justify-center">
                    <FaBook className="mr-4 text-blue-600" /> Data Dictionary
                </h1>
                <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                    Ontology definitions for the various biological, digital, and clinical data classifications tracked within the catalogue.
                </p>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="p-8">
                    <p className="text-gray-700 leading-relaxed mb-8">
                        This dictionary establishes the formal Linked Open Data definitions for the terms used across Yourself to Science.
                        These classification URLs and UUIDs can be used as semantic reference sources for Wikidata and other Knowledge Graphs.
                    </p>

                    <div className="space-y-8">
                        {sortedTypes.map(ontologyItem => {
                            const { id, title, slug, description } = ontologyItem;

                            return (
                                <div key={id} id={slug} className="scroll-mt-32 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm relative group transition-all hover:shadow-md">
                                    <Link
                                        href={`/data-types/${slug}`}
                                        className="absolute top-6 right-6 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600"
                                        title="View classification details and associated resources"
                                    >
                                        <FaLink />
                                    </Link>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                                        <FaDatabase className="mr-3 text-indigo-500 text-xl" />
                                        <Link href={`/data-types/${slug}`} className="hover:text-blue-600 transition-colors">
                                            {title}
                                        </Link>
                                    </h2>
                                    <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                        {description}
                                    </p>
                                    <div className="pt-4 border-t border-gray-200 space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Semantic URL</p>
                                            <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-md shadow-sm">
                                                <code className="text-sm text-blue-600 truncate">
                                                    https://yourselftoscience.org/data-types/{slug}
                                                </code>
                                                <CopyButton text={`https://yourselftoscience.org/data-types/${slug}`} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Persistent Identifier (UUID)</p>
                                            <div className="flex items-center justify-between text-xs text-mono bg-white border border-gray-200 p-2 rounded-md shadow-sm text-gray-500">
                                                <span>{id}</span>
                                                <CopyButton text={id} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
}
