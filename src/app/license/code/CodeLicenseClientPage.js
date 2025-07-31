'use client';


import { useScroll } from 'framer-motion';
import LicensePage from '../LicensePage';

export default function CodeLicenseClientPage({ content, sourceUrl }) {
    const { scrollY } = useScroll();

    return (
        <main className="flex-grow pt-16">
                <LicensePage title="Code License (AGPL-3.0)" content={content} sourceUrl={sourceUrl} />
            </main>
    );
} 