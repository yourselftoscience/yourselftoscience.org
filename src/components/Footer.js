// src/components/Footer.js

'use client';

import React from 'react';
import Link from 'next/link';
import { FaGithub, FaCreativeCommons, FaCreativeCommonsBy, FaCreativeCommonsSa, FaReddit, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function Footer() {
  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/yourselftoscience/yourselftoscience.org/', icon: FaGithub },
    { name: 'Reddit', href: 'https://www.reddit.com/r/YourselfToScience/', icon: FaReddit },
    { name: 'X', href: 'https://x.com/YouToScience', icon: FaXTwitter },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/yourselftoscience/', icon: FaLinkedin },
  ];

  const navLinks = [
    { name: 'Stats', href: '/stats', external: false },
    { name: 'Suggest a Service', href: '/contribute', external: false },
    { name: 'PDF Version', href: '/yourselftoscience.pdf', external: true },
  ];

  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  const copyrightDate = startYear === currentYear ? startYear : `${startYear}–${currentYear}`;

  return (
    <footer className="bg-apple-surface border-t border-apple-divider text-apple-secondary-text">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center space-y-8">
        
          {/* Social Links */}
          <div className="flex space-x-6">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-apple-secondary-text hover:text-apple-accent transition-colors duration-200"
                target={item.href === '#' ? '_self' : '_blank'}
                rel="noopener noreferrer"
                aria-label={item.name}
              >
                <item.icon className="h-6 w-6" />
              </a>
            ))}
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navLinks.map((item) => (
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-base hover:text-apple-accent transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.name}
                </a>
              ) : (
                <Link key={item.name} href={item.href} className="text-base hover:text-apple-accent transition-colors duration-200">
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* License and Copyright */}
          <div className="text-center text-xs space-y-2">
            <p>
              Content is licensed under the{' '}
              <a
                href="https://github.com/yourselftoscience/yourselftoscience.org/blob/main/LICENSE-CONTENT"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-apple-accent transition-colors duration-200 inline-flex items-center"
              >
                <FaCreativeCommons className="mr-1" />
                <FaCreativeCommonsBy className="mr-1" />
                <FaCreativeCommonsSa className="mr-1" />
                CC BY-SA 4.0 License
              </a>
              , and the underlying source code is licensed under the{' '}
              <a
                href="https://github.com/yourselftoscience/yourselftoscience.org/blob/main/LICENSE-CODE"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-apple-accent transition-colors duration-200"
              >
                AGPL-3.0 License
              </a>.
            </p>
            <p>&copy; {copyrightDate} Yourself To Science. Some Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
