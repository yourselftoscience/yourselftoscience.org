// JavaScript
import Head from 'next/head';
import { resources } from '@/data/resources.js'; // using named export

export default function ResourcePage({ params }) {
  const { id } = params;
  const resource = resources.find((r) => String(r.id) === id);
  
  if (!resource) {
    return <div>Resource not found</div>;
  }

  return (
    <>
      <Head>
        <title>{resource.title}</title>
        <meta name="citation_title" content={resource.title} />
        <meta name="citation_author" content={resource.author || 'Unknown'} />
        <meta name="citation_publication_date" content={resource.publicationDate || '2020/01/01'} />
      </Head>
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
        {resource.link && (
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Visit Service
          </a>
        )}
        {/* Render citations if they exist */}
        {resource.citations && resource.citations.length > 0 && (
          <section className="mt-6">
            <h2 className="text-2xl font-semibold mb-2">Citations</h2>
            <ol className="list-decimal pl-6">
              {resource.citations.map((citation, idx) => (
                <li key={idx}>
                  <a
                    href={citation.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {citation.title}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
    </>
  );
}