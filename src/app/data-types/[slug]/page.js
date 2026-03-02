import { dataTypesOntology, getDataTypeBySlugOrId } from '@/data/ontology';
import { resources } from '@/data/resources';
import { notFound, redirect } from 'next/navigation';
import { FaDatabase, FaArrowLeft, FaExternalLinkAlt, FaBuilding, FaTag } from 'react-icons/fa';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';

// 1. Generate Static Params for all Slugs AND UUIDs
export async function generateStaticParams() {
    const params = [];
    dataTypesOntology.forEach((dt) => {
        params.push({ slug: dt.slug });
        params.push({ slug: dt.id }); // Also generate static pages for the UUIDs to handle redirects
    });
    return params;
}

// 2. Generate Metadata (Title/Description)
export async function generateMetadata({ params }) {
    const dataType = getDataTypeBySlugOrId(params.slug);
    if (!dataType) return {};

    return {
        title: `${dataType.title} | Data Dictionary | Yourself to Science`,
        description: dataType.description,
    };
}

export default function DataTypeNodePage({ params }) {
    const { slug } = params;
    const dataType = getDataTypeBySlugOrId(slug);

    // 404 if it's not a valid slug or UUID
    if (!dataType) {
        notFound();
    }

    // If the user accessed via UUID, cleanly 301 redirect them to the human-readable slug
    if (slug === dataType.id) {
        redirect(`/data-types/${dataType.slug}`);
    }

    // Find all resources that collect this data type
    const associatedResources = resources.filter(
        (resource) => resource.dataTypes && resource.dataTypes.includes(dataType.title)
    );

    // Generate the JSON-LD payload for the Semantic Web
    // This explicitly tells Wikidata that this page defines a Class/Term
    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "DefinedTerm",
        "@id": `https://yourselftoscience.org/data-types/${dataType.slug}`,
        "name": dataType.title,
        "description": dataType.description,
        "identifier": dataType.id,
        "inDefinedTermSet": "https://yourselftoscience.org/data-types"
    };

    return (
        <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* JSON-LD Injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Back Button */}
            <div className="mb-6">
                <Link
                    href="/data-types"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <FaArrowLeft className="mr-2" /> Back to Data Dictionary
                </Link>
            </div>

            {/* Ontology Header Card */}
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 mb-8">
                <div className="p-8">
                    <div className="flex items-center mb-4">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide border border-indigo-200">
                            Semantic Ontology Node
                        </span>
                    </div>

                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl flex items-center mb-6">
                        <FaDatabase className="mr-4 text-indigo-500" />
                        {dataType.title}
                    </h1>

                    <p className="text-xl text-gray-700 leading-relaxed mb-8">
                        {dataType.description}
                    </p>

                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Semantic URL (Canonical)</p>
                            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                <code className="text-sm font-mono text-blue-600 break-all">
                                    https://yourselftoscience.org/data-types/{dataType.slug}
                                </code>
                                <div className="ml-4 flex-shrink-0">
                                    <CopyButton text={`https://yourselftoscience.org/data-types/${dataType.slug}`} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Persistent Identifier (UUID URL)</p>
                            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                <code className="text-sm font-mono text-gray-600 break-all">
                                    https://yourselftoscience.org/data-types/{dataType.id}
                                </code>
                                <div className="ml-4 flex-shrink-0">
                                    <CopyButton text={`https://yourselftoscience.org/data-types/${dataType.id}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Associated Resources List */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FaDatabase className="mr-2 text-gray-400 text-xl" />
                    Associated Resources ({associatedResources.length})
                </h2>

                {associatedResources.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
                        No active resources in the catalogue currently collect this specific data type.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {associatedResources.map((resource) => (
                            <Link
                                key={resource.id}
                                href={`/resource/${resource.id}`}
                                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all group relative overflow-hidden flex flex-col h-full"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaExternalLinkAlt className="text-blue-500" />
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1 pr-6 group-hover:text-blue-600 transition-colors">
                                    {resource.title}
                                </h3>

                                {resource.organization && (
                                    <p className="text-sm text-gray-500 mb-4 flex items-center">
                                        <FaBuilding className="mr-2 text-gray-400 flex-shrink-0" />
                                        <span className="truncate">{resource.organization}</span>
                                    </p>
                                )}

                                <div className="mt-auto pt-4 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        <FaTag className="mr-1.5" />
                                        {dataType.title}
                                    </span>
                                    {resource.compensation?.some(c => c.type.toLowerCase() === 'payment' || c.type.toLowerCase() === 'reward') && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                            Compensated
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

        </main>
    );
}
