const title = "Our Mission | Yourself to Science – The Open Science Catalogue";
const description = "Yourself to Science is building a unified, open catalogue of programs where people contribute data, biological samples, and more to research. Explore clinical trials, registries, databases, and donation portals — all in one place, under a CC0 public domain license.";
const url = "https://yourselftoscience.org/mission";
const siteName = "Yourself to Science";

export const metadata = {
    title,
    description,
    keywords: [
        "open science",
        "citizen science",
        "clinical trials catalogue",
        "donate data to science",
        "donate DNA to research",
        "open dataset",
        "CC0 dataset",
        "biobank directory",
        "contribute to science",
        "organ donation",
        "body donation",
        "genetic data",
        "wearable data research",
        "microbiome research",
        "paid clinical trials",
        "volunteer research",
        "Wikidata",
        "open source science",
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
                alt: 'Yourself to Science – The Open Science Catalogue',
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

export default function MissionLayout({ children }) {
    return <>{children}</>;
}
