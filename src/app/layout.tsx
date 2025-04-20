import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import fs from 'fs'; // Import fs
import path from 'path'; // Import path

// --- Function to read DOI from file (runs at build time) ---
function getLatestDoiForBuild() {
  const doiFilePath = path.join(process.cwd(), 'public', 'latest_doi.txt'); // Use process.cwd() for build context
  const fallbackDoi = '10.5281/zenodo.15110328'; // Use the latest known version DOI as fallback
  try {
    if (fs.existsSync(doiFilePath)) {
      const doi = fs.readFileSync(doiFilePath, 'utf-8').trim();
      if (doi && doi.includes('/') && doi.startsWith('10.')) {
        console.log(`Build using DOI from file: ${doi}`);
        return doi;
      } else if (doi) {
         console.warn(`Build: Invalid DOI format found in file: ${doi}. Using fallback.`);
      }
    }
  } catch (error) {
    // --- Type check for error ---
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    console.warn(`Build: Error reading DOI file: ${errorMessage}`);
    // --- End type check ---
  }
  console.warn(`Build: DOI file not found or empty/invalid. Using fallback DOI: ${fallbackDoi}`);
  return fallbackDoi;
}
// --- End function ---

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
const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const currentYear = new Date().getFullYear();
const latestDoi = getLatestDoiForBuild(); // Read DOI for metadata

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
    'citation_doi': latestDoi, // Use the dynamically read DOI
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
