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
        {/* Required meta tags: title, at least one author, and publication date */}
        <meta name="citation_title" content={resource.title} />
        {resource.authors ? (
          resource.authors.map((author, index) => (
            <meta key={index} name="citation_author" content={author} />
          ))
        ) : (
          <meta name="citation_author" content="Unknown" />
        )}
        <meta
          name="citation_publication_date"
          content={resource.publicationDate || '2020/01/01'}
        />
        {/* Optional additional bibliographic meta tags */}
        {resource.journalTitle && (
          <meta name="citation_journal_title" content={resource.journalTitle} />
        )}
        {resource.issn && (
          <meta name="citation_issn" content={resource.issn} />
        )}
        {resource.volume && (
          <meta name="citation_volume" content={resource.volume} />
        )}
        {resource.issue && (
          <meta name="citation_issue" content={resource.issue} />
        )}
        {resource.firstPage && (
          <meta name="citation_firstpage" content={resource.firstPage} />
        )}
        {resource.lastPage && (
          <meta name="citation_lastpage" content={resource.lastPage} />
        )}
        {resource.pdfUrl && (
          <meta name="citation_pdf_url" content={resource.pdfUrl} />
        )}
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