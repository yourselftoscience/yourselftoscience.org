const title = "Open Dataset & API | Yourself to Science – CC0 Public Domain Data";
const description = "Download the complete Yourself to Science dataset in JSON, CSV, and Markdown formats. CC0 1.0 public domain licensed. Aligned with Wikidata QIDs for interoperability. Explore the schema, licensing, and data endpoints.";
const url = "https://yourselftoscience.org/data";
const siteName = "Yourself to Science";

export const metadata = {
    title,
    description,
    keywords: [
        "open dataset",
        "CC0 dataset",
        "public domain data",
        "science data download",
        "clinical trials data",
        "citizen science dataset",
        "JSON API",
        "CSV download",
        "Wikidata QID",
        "linked data",
        "open science data",
        "research opportunities dataset",
    ],
    openGraph: {
        title,
        description,
        url,
        siteName,
        locale: 'en_US',
        type: 'website',
        images: [
            {
                url: 'https://yourselftoscience.org/preview-tm.png',
                width: 1200,
                height: 1200,
                alt: 'Yourself to Science – Open Dataset',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['https://yourselftoscience.org/preview-tm.png'],
    },
    alternates: {
        canonical: url,
    },
};

export default function DataLayout({ children }) {
    return <>{children}</>;
}
