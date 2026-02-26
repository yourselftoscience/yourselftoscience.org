const title = "Genetic Data Donation Wizard | Donate DNA to Science";
const description = "Find research projects that accept your raw DNA data from 23andMe, AncestryDNA, and others. Discover academic, non-profit, commercial, and paid research opportunities.";
const url = "https://yourselftoscience.org/what-can-i-do-with-my-genetic-data";
const siteName = "Yourself to Science";

export const metadata = {
    title,
    description,
    openGraph: {
        title,
        description,
        url,
        siteName,
        locale: 'en_US',
        type: 'website',
        images: [
            {
                url: 'https://yourselftoscience.org/preview-tm.png', // Ideally personalized, fallback to tm preview
                width: 1200,
                height: 1200,
                alt: 'Yourself to Science Logo',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['https://yourselftoscience.org/preview-tm.png'],
    },
};

export default function GeneticDataLayout({ children }) {
    return <>{children}</>;
}
