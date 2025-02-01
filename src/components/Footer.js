// src/components/Footer.js

'use client';

import React from 'react';
import { FaCreativeCommons, FaCreativeCommonsBy, FaCreativeCommonsSa, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-6 mt-10">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-4">
          The content of this project is under the{' '}
          <a
            href="https://github.com/yourselftoscience/yourselftoscience.org/blob/main/LICENSE-CONTENT"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:underline inline-flex items-center"
          >
            <FaCreativeCommons className="mr-1" />
            <FaCreativeCommonsBy className="mr-1" />
            <FaCreativeCommonsSa className="mr-1" />
            CC BY-SA 4.0 License
          </a>
          , and the underlying source code used to format and display that content is under the{' '}
          <a
            href="https://github.com/yourselftoscience/yourselftoscience.org/blob/main/LICENSE-CODE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:underline inline-flex items-center"
          >
            AGPL-3.0 License
          </a>
          .
        </p>
        <p>
          <a
            href="https://github.com/yourselftoscience/yourselftoscience.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-500 hover:underline"
          >
            <FaGithub className="mr-2" />
            You can find my source code here.
          </a>
        </p>
      </div>
    </footer>
  );
}
