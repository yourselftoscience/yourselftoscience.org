import { resources } from '@/data/resources';
import { FaMobileAlt, FaCog, FaUserShield, FaArrowRight } from 'react-icons/fa';

// Add this line to make Cloudflare Pages happy
export const runtime = 'edge';

// Generate metadata for Google Scholar
export async function generateMetadata({ params }) {
  const { id } = params;
  const resource = resources.find((r) => String(r.id) === id);
  
  if (!resource) {
    return { title: 'Resource Not Found' };
  }
  
  // Current date in YYYY/MM/DD format
  const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '/');
  
  return {
    title: resource.title,
    description: `Details about ${resource.title} - a service for contributing to science`,
    // Google Scholar metadata
    other: {
      'citation_title': resource.title,
      'citation_author': 'Mario Marcolongo', // Updated author name
      'citation_publication_date': currentDate,
      'citation_pdf_url': 'https://yourselftoscience.org/yourselftoscience.pdf',
      'citation_fulltext_world_readable': ' ', // Add this line
      ...(resource.citations?.length && {'citation_references': resource.citations.map(c => c.title).join('; ')}),
    },
    openGraph: {
      title: resource.title,
      type: 'article'
    }
  };
}

export default function ResourcePage({ params }) {
  const { id } = params;
  const resource = resources.find((r) => String(r.id) === id);
  
  if (!resource) {
    return <div>Resource not found</div>;
  }

  // Helper function to get icons for instruction steps
  const getStepIcon = (step) => {
    if (step.toLowerCase().includes('fitbit app')) 
      return <FaMobileAlt className="text-google-blue" />;
    if (step.toLowerCase().includes('settings')) 
      return <FaCog className="text-gray-600" />;
    if (step.toLowerCase().includes('privacy')) 
      return <FaUserShield className="text-green-500" />;
    if (step.toLowerCase().includes('data shared')) 
      return <FaArrowRight className="text-yellow-500" />;
    return <FaArrowRight className="text-gray-500" />;
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
      
      {/* Display link if available */}
      {resource.link && (
        <a href={resource.link} target="_blank" rel="noopener noreferrer" 
           className="text-blue-600 hover:underline">
          Visit Service
        </a>
      )}
      
      {/* Display instructions if available */}
      {resource.instructions && (
        <section className="mt-6">
          <h2 className="text-2xl font-semibold mb-2">Instructions</h2>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <div className="flex flex-col items-start space-y-3">
              {resource.instructions.map((step, idx) => (
                <div key={idx} className="flex items-center">
                  <span className="mr-2 font-semibold text-gray-800">{idx + 1}.</span>
                  <span className="mr-2">{getStepIcon(step)}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Display data types if available */}
      {resource.dataTypes && resource.dataTypes.length > 0 && (
        <section className="mt-6">
          <h2 className="text-2xl font-semibold mb-2">Data Types</h2>
          <div className="flex flex-wrap gap-2">
            {resource.dataTypes.map((type, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                {type}
              </span>
            ))}
          </div>
        </section>
      )}
      
      {/* Render citations if they exist */}
      {resource.citations && resource.citations.length > 0 && (
        <section className="mt-6">
          <h2 className="text-2xl font-semibold mb-2">Citations</h2>
          <ol className="list-decimal pl-6 space-y-1"> {/* Added space-y-1 for better spacing */}
            {resource.citations.map((citation, idx) => (
              <li key={idx} className="text-sm text-google-text-secondary"> {/* Use consistent text style */}
                {citation.link ? (
                  <a href={citation.link} target="_blank" rel="noopener noreferrer"
                     className="text-google-blue hover:underline break-words">
                    {citation.title}
                  </a>
                ) : (
                  <span className="break-words">{citation.title}</span> // Handle citations without links
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}