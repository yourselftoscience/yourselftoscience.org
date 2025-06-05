// src/components/Footer.js

'use client';

import React from 'react';
import { FaCreativeCommons, FaCreativeCommonsBy, FaCreativeCommonsSa, FaGithub, FaLock, FaFileContract } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="relative p-4 bg-gray-800 text-white text-center">
      <div>
        <p className="mb-4">
          The content of this project is under the{' '}
          <a
            href="https://github.com/yourselftoscience/yourselftoscience.org/blob/main/LICENSE-CONTENT"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-500 hover:underline inline-flex items-center"
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
            className="text-yellow-500 hover:underline inline-flex items-center"
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
            className="inline-flex items-center text-google-blue hover:underline"
          >
            <FaGithub className="mr-2" />
            You can find my source code here.
          </a>
        </p>
      </div>
      {/* HTML Version link positioned in bottom-right and displayed in smaller text */}
      <p className="absolute bottom-2 right-2 text-xs">
        <a 
          href="/yourselftoscience.pdf" 
          className="underline text-google-blue" 
          target="_blank" 
          rel="noopener noreferrer">
          PDF Version
        </a>
      </p>
          </footer>
  );
}
