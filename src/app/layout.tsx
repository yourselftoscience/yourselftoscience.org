// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from '../components/ClientLayout';


// This file is the single source of truth for the latest DOI.
import { latestDoi } from '@/data/config';

// Define fonts at module scope with const
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: 'swap',
  fallback: ['Consolas', 'monospace'],
});

// Get current date in YYYY/MM/DD format for citation
const currentDate = new Date().toISOString().split('T')[0].replaceAll('-', '/');
const currentYear = new Date().getFullYear();

// This export is necessary to prevent a build error.
// See: https://github.com/vercel/next.js/issues/53354
export const metadata: Metadata = {
  title: {
    default: "Yourself to Science",
    template: "%s | Yourself to Science",
  },
  description: "A Comprehensive Open-Source List of Services for Contributing to Science with Your Data, Genome, Body, and More",
  icons: {
    icon: [
      {
        url: "/logo-tm.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.png",
        type: "image/png",
      },
      {
        url: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
  other: {
    'citation_title': "Yourself to Science: A Comprehensive Open-Source List of Services for Contributing to Science with Your Data, Genome, Body, and More",
    'citation_author': "Mario Marcolongo",
    'citation_publication_date': '2025/01/31',
    'citation_pdf_url': "https://yourselftoscience.org/yourselftoscience.pdf",
    'citation_fulltext_html_url': "https://yourselftoscience.org",
    'citation_doi': latestDoi,
    'citation_fulltext_world_readable': ' '
  },
  openGraph: {
    title: "Yourself to Science",
    siteName: "Yourself to Science",
    description: "List of Services for Contributing to Science with Your Data, Genome, Body, and More",
    url: "https://yourselftoscience.org",
    type: "website",
    images: [
      {
        url: "https://yourselftoscience.org/preview-tm.png",
        width: 1200,
        height: 1200,
        alt: "Yourself to Science Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yourself to Science",
    description: "List of Services for Contributing to Science with Your Data, Genome, Body, and More",
    images: ["https://yourselftoscience.org/preview-tm.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Yourself to Science",
    "url": "https://yourselftoscience.org",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://yourselftoscience.org/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://github.com/yourselftoscience/yourselftoscience.org/",
      "https://www.reddit.com/r/YourselfToScience/",
      "https://x.com/YouToScience",
      "https://www.linkedin.com/company/yourselftoscience/",
      "https://www.facebook.com/61584505973946/"
    ]
  };

  return (
    // Keep suppressHydrationWarning on html for good measure
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Prefer explicit canonical and application name to help search engines pick the proper site title */}
        <link rel="canonical" href="https://yourselftoscience.org" />
        <meta name="application-name" content="Yourself to Science" />
        <link rel="preconnect" href="https://cloudflareinsights.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cloudflareinsights.com" />
        <link rel="preconnect" href="https://static.cloudflareinsights.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
        <meta name="citation_online_date" content={currentDate} />
        {/* Add other necessary head elements like charset, viewport */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Umami Analytics via same-origin proxy */}
        <script
          defer
          src="/umami/script.js"
          data-website-id="4a93fee5-ce95-4799-a524-fc117493239e"
          data-host-url="/umami"
        />
      </head>
      {/* Add suppressHydrationWarning to body as well */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
