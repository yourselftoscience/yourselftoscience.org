import { FaGithub } from 'react-icons/fa';

const LicensePage = ({ title, content, sourceUrl }) => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 ml-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaGithub className="h-5 w-5" />
              <span>View Source</span>
            </a>
          )}
        </div>
        <div className="prose prose-lg text-gray-700 max-w-none">
          <pre className="whitespace-pre-wrap font-sans">{content}</pre>
        </div>
      </div>
    </div>
  );
};

export default LicensePage; 