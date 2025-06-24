'use client';

import Link from 'next/link';
import { FaReddit, FaGithub } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScroll } from 'framer-motion';

export default function ContributeClientPage() {
  const { scrollY } = useScroll();
  const redditSuggestUrl = `https://www.reddit.com/r/YourselfToScience/submit?title=Suggestion%3A%20New%20Service%20-%20[Service%20Title]&text=Please%20fill%20out%20the%20following%20information%20as%20completely%20as%20possible.%0A%0A**Service%20Title%3A**%0A%0A**Service%20Link%3A**%0A%0A**Data%20Types%3A**%20(e.g.%2C%20Genome%2C%20Health%20data%2C%20Fitbit%20data%2C%20etc.)%0A%0A**Countries%20Available%3A**%20(e.g.%2C%20Worldwide%2C%20United%20States%2C%20etc.)%0A%0A**Why%20it's%20a%20good%20fit%20for%20the%20list%3A**`;
  const githubSuggestUrl = `https://github.com/yourselftoscience/yourselftoscience.org/issues/new?template=suggest-a-service.md&title=Suggestion:%20New%20Service%20-%20[Service%20Title]`;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header scrollY={scrollY} />
      <div className="flex-grow bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Your Contribution Matters</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl">
              Our mission is to provide a transparent, accessible, and comprehensive list of services for citizen science. This project is built by the community, for the community, and every contribution is incredibly valuable.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-12">
            {/* Option 1: Reddit */}
            <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <FaReddit className="h-10 w-10 text-orange-500" />
                    <h2 className="text-2xl font-semibold text-gray-900">Join the Discussion</h2>
                  </div>
                  <p className="mt-4 text-base text-gray-600">
                    The best place to start. Suggest new services, share ideas, and get feedback from the community. Perfect for all users.
                  </p>
                </div>
                <div className="mt-8">
                  <Link
                    href={redditSuggestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Suggest on Reddit
                  </Link>
                </div>
              </div>
            </div>

            {/* Option 2: GitHub */}
            <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <FaGithub className="h-10 w-10 text-gray-800" />
                    <h2 className="text-2xl font-semibold text-gray-900">Go Direct</h2>
                  </div>
                  <p className="mt-4 text-base text-gray-600">
                    For developers and those comfortable with GitHub. Use our template to add your suggestion directly to our project tracker.
                  </p>
                </div>
                <div className="mt-8">
                  <Link
                    href={githubSuggestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                  >
                    Suggest on GitHub
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 text-center text-gray-500">
            <p>
              Want to help in other ways? Explore our{' '}
              <Link
                href="https://github.com/yourselftoscience/yourselftoscience.org"
                className="font-medium text-blue-600 hover:text-blue-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                project repository
              </Link>{' '}
              for documentation, code, and more.
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
} 