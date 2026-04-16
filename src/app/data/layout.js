import lastUpdatedMeta from '@/data/lastUpdated.json';
import { permanentDoi } from '@/data/config';

const title = "Open Science Data & API Hub | Programmatic Research Infrastructure";
const description = "Programmatic access to the Yourself to Science dataset. Relational data packages, AI/LLM feeds, quantitative JSON endpoints, and semantic RDF mapping. Standardized research infrastructure for open science.";
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
    // Dataset JSON-LD is rendered server-side here for reliable Google indexing,
    // rather than in the 'use client' page component.
    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Dataset",
        "name": "Yourself to Science Open Dataset",
        "description": "A curated, open-access catalog of services, platforms, and programs that allow individuals to securely contribute to scientific research with their biological and digital selves.",
        "url": "https://yourselftoscience.org/data",
        "sameAs": "https://yourselftoscience.org/resources.ttl#dataset",
        "identifier": [
            "https://yourselftoscience.org/resources.ttl#dataset",
            `https://doi.org/${permanentDoi}`
        ],
        "keywords": [
            "open dataset",
            "CC0 dataset",
            "public domain data",
            "science data",
            "clinical trials data",
            "citizen science dataset",
            "JSON API",
            "CSV download",
            "linked data",
            "research opportunities"
        ],
        "alternateName": [
            "Yourself to Science Catalogue",
            "Yourself to Science Database"
        ],
        "creator": {
            "@type": "Organization",
            "name": "Yourself to Science",
            "url": "https://yourselftoscience.org",
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "public engagement",
                "email": "hello@yourselftoscience.org"
            }
        },
        "license": "https://creativecommons.org/publicdomain/zero/1.0/",
        "isAccessibleForFree": true,
        "dateModified": lastUpdatedMeta.dateModified,
        "distribution": [
            {
                "@type": "DataDownload",
                "encodingFormat": "text/csv",
                "contentUrl": "https://yourselftoscience.org/resources.csv"
            },
            {
                "@type": "DataDownload",
                "encodingFormat": "application/json",
                "contentUrl": "https://yourselftoscience.org/resources.json"
            },
            {
                "@type": "DataDownload",
                "encodingFormat": "text/turtle",
                "contentUrl": "https://yourselftoscience.org/resources.ttl"
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
