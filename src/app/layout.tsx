import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Define fonts at module scope with const
// Use optional catch binding to handle missing files gracefully
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
const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: "Yourself To Science",
  description: "A Comprehensive List of Services for Contributing to Science with Your Data, Genome, Body, and More",
  icons: {
    icon: '/Logo.svg', // SVG favicon
  },
  // Google Scholar metadata
  other: {
    'citation_title': "Yourself To Science: A Comprehensive List of Services for Contributing to Science",
    'citation_author': "Mario Marcolongo",
    'citation_publication_date': `${currentYear}/${currentDate.split('/')[1]}/${currentDate.split('/')[2]}`,
    'citation_pdf_url': "https://yourselftoscience.org/yourselftoscience.pdf",
    'citation_fulltext_html_url': "https://yourselftoscience.org",
    'citation_doi': "10.5281/zenodo.15109359", // Updated to correct concept DOI
    'citation_fulltext_world_readable': ' '
  },
  openGraph: {
    title: "Yourself To Science",
    description: "List of Services for Contributing to Science with Your Data, Genome, Body, and More",
    url: "https://yourselftoscience.org",
    type: "website",
    images: [
      {
        url: "https://yourselftoscience.org/preview.png",
        width: 1200,
        height: 1200,
        alt: "Yourself To Science Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yourself To Science",
    description: "List of Services for Contributing to Science with Your Data, Genome, Body, and More",
    images: ["https://yourselftoscience.org/preview.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="citation_online_date" content={currentDate} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
