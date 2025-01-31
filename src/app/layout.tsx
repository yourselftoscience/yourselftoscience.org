import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Head from 'next/head';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Yourself To Science",
  description: "List of Services for Contribuiting to Science with Your Data, Genome, Body, and More",
  icons: {
    icon: '/Logo.svg', // SVG favicon
    // Optional: Add PNG favicon for better compatibility
    // icon: [
    //   { url: '/favicon.ico', type: 'image/x-icon' },
    //   { url: '/Logo.svg', type: 'image/svg+xml' },
    // ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta property="og:title" content="Yourself To Science" />
        <meta property="og:description" content="Yourself To Science" />
        <meta property="og:image" content="/preview.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta property="og:image:alt" content="Yourself To Science Logo" />
        <meta property="og:url" content="https://yourwebsite.com" />
        <meta property="og:type" content="website" />
        <meta property="og:logo" content="/path/to/logo.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Yourself To Science" />
        <meta name="twitter:description" content="Yourself To Science" />
        <meta name="twitter:image" content="/preview.png" />
        <meta name="twitter:image:alt" content="Yourself To Science Logo" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
