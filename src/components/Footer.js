// src/components/Footer.js

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaGithub, FaCreativeCommons, FaCreativeCommonsBy, FaCreativeCommonsSa, FaReddit, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { usePathname } from 'next/navigation';
import { latestDoi } from '@/data/config';
import CitationModal from './CitationModal';

const FooterLink = ({ href, children, className = '' }) => (
    <li>
        <Link href={href} className={`text-apple-secondary-text hover:text-apple-accent transition-colors duration-200 ${className}`}>
            {children}
        </Link>
    </li>
);

const FooterButton = ({ onClick, children, className = '' }) => (
    <li>
        <button onClick={onClick} className={`text-apple-secondary-text hover:text-apple-accent transition-colors duration-200 ${className}`}>
            {children}
        </button>
    </li>
);

const SocialLink = ({ href, icon: Icon, name }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={name} className="text-apple-secondary-text hover:text-apple-accent transition-colors duration-200">
        <Icon className="h-6 w-6" />
    </a>
)

export default function Footer() {
  const [isCitationModalOpen, setCitationModalOpen] = useState(false);

  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  const copyrightDate = startYear === currentYear ? startYear : `${startYear}–${currentYear}`;
  
  const socialLinks = [
     { name: 'GitHub', href: 'https://github.com/yourselftoscience/yourselftoscience.org/', icon: FaGithub },
     { name: 'Reddit', href: 'https://www.reddit.com/r/YourselfToScience/', icon: FaReddit },
     { name: 'X', href: 'https://x.com/YouToScience', icon: FaXTwitter },
     { name: 'LinkedIn', href: 'https://www.linkedin.com/company/yourselftoscience/', icon: FaLinkedin },
   ];

  return (
    <>
      <footer className="bg-apple-surface border-t border-apple-divider text-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="flex justify-center mb-8">
            <div className="flex space-x-8">
                {socialLinks.map(link => <SocialLink key={link.name} {...link} />)}
            </div>
          </div>
        
          <h2 className="sr-only">Footer Navigation</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Navigate */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-apple-primary-text">Navigate</h3>
              <ul className="mt-4 space-y-3">
                <FooterLink href="/">All Resources</FooterLink>
                <FooterLink href="/stats">Stats</FooterLink>
                <FooterLink href="/clinical-trials">Clinical Trials</FooterLink>
                <FooterLink href="/organ-body-tissue-donation">Organ, Body & Tissue</FooterLink>
              </ul>
            </div>

            {/* Center Column: Get Involved */}
            <div className="text-center">
              <h3 className="font-semibold text-apple-primary-text">Get Involved</h3>
               <ul className="mt-4 space-y-3">
                <FooterLink href="/get-involved">Contribute</FooterLink>
                <FooterLink href="/get-involved#contact-us">Contact Us</FooterLink>
              </ul>
            </div>
            
            {/* Right Column: Resources */}
            <div className="text-center md:text-right">
              <h3 className="font-semibold text-apple-primary-text">Tools</h3>
              <ul className="mt-4 space-y-3">
                 <FooterButton onClick={() => setCitationModalOpen(true)}>Cite this Project</FooterButton>
                 <FooterLink href="/data">Dataset</FooterLink>
                 <li>
                    <a href="/yourselftoscience.pdf" target="_blank" rel="noopener noreferrer" className="text-apple-secondary-text hover:text-apple-accent transition-colors duration-200">
                        PDF Version
                    </a>
                 </li>
              </ul>
            </div>
          </div>

          {/* Bottom section for copyright and license */}
          <div className="mt-12 pt-8 border-t border-apple-divider text-center text-xs text-apple-secondary-text space-y-2">
            <p>
              Content is licensed under the{' '}
              <Link
                href="/license/content"
                className="underline hover:text-apple-accent transition-colors duration-200 inline-flex items-center"
              >
                <FaCreativeCommons className="mr-1" />
                <FaCreativeCommonsBy className="mr-1" />
                <FaCreativeCommonsSa className="mr-1" />
                CC BY-SA 4.0
              </Link>
              , and the underlying source code is licensed under the{' '}
              <Link
                href="/license/code"
                className="underline hover:text-apple-accent transition-colors duration-200"
              >
                AGPL-3.0 License
              </Link>.
            </p>
            <p>&copy; {copyrightDate} Yourself To Science. Some Rights Reserved.</p>
          </div>
        </div>
      </footer>
      <CitationModal isOpen={isCitationModalOpen} onClose={() => setCitationModalOpen(false)} />
    </>
  );
}
