'use client';

import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaTimes, FaRegCopy } from 'react-icons/fa';
import { latestDoi } from '@/data/config';

// Function to generate citation in different formats
const getCitations = (doi) => {
  const year = new Date().getFullYear();
  const title = "Yourself to Science™: A Comprehensive Open-Source List of Services for Contributing to Science with Your Data, Genome, Body, and More";
  const url = "https://yourselftoscience.org";
  const doiUrl = `https://doi.org/${doi}`;
  const accessDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return {
    apa: `Marcolongo, M. (${year}). *${title}*. Yourself to Science™. ${url}. ${doiUrl}`,
    mla: `Marcolongo, Mario. "${title}." *Yourself to Science™*, ${year}, ${url}, ${doiUrl}.`,
    chicago: `Marcolongo, Mario. ${year}. "${title}." Yourself to Science™. Accessed ${accessDate}. ${url}. ${doiUrl}.`,
    bibtex: `@misc{Marcolongo_${year}_YourselfToScience,\n  author = {Marcolongo, Mario},\n  title = {${title}},\n  year = {${year}},\n  publisher = {Yourself to Science™},\n  journal = {yourselftoscience.org},\n  howpublished = {\\url{${url}}},\n  doi = {${doi}}\n}`,
    ris: `TY  - GEN\nAU  - Marcolongo, Mario\nPY  - ${year}\nTI  - ${title}\nUR  - ${url}\nPB  - Yourself to Science™\nDO  - ${doi}\nER  -`
  };
};

// A small component for each citation format
function CitationFormat({ label, text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-700 mb-2">{label}</h4>
      <div className="relative">
        <pre className="bg-gray-100 p-3 rounded-md text-xs text-gray-800 whitespace-pre-wrap break-words">
          {text}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-600 transition-colors"
          aria-label={`Copy ${label} citation`}
        >
          {copied ? 'Copied!' : <FaRegCopy />}
        </button>
      </div>
    </div>
  );
}

export default function CitationModal({ isOpen, onClose }) {
  const citations = getCitations(latestDoi);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  <span>Cite This Resource</span>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Close"
                  >
                    <FaTimes />
                  </button>
                </Dialog.Title>
                <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-4">
                        Copy the citation in your preferred format or download the RIS file for your reference manager.
                    </p>
                    <CitationFormat label="APA" text={citations.apa} />
                    <CitationFormat label="MLA" text={citations.mla} />
                    <CitationFormat label="Chicago" text={citations.chicago} />
                    <CitationFormat label="BibTeX" text={citations.bibtex} />
                    <CitationFormat label="RIS (for Zotero/EndNote)" text={citations.ris} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 