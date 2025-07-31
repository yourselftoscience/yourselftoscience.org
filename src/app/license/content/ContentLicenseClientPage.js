'use client';


import { useScroll } from 'framer-motion';
import LicensePage from '../LicensePage';

export default function ContentLicenseClientPage({ content, sourceUrl }) {
    const { scrollY } = useScroll();

    return (
        <main className="flex-grow pt-16">
                <LicensePage title="Content License (CC BY-SA 4.0)" content={content} sourceUrl={sourceUrl} />
            </main>
    );
} 