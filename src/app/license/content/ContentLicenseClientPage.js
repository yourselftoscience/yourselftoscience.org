'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScroll } from 'framer-motion';
import LicensePage from '../LicensePage';

export default function ContentLicenseClientPage({ content, sourceUrl }) {
    const { scrollY } = useScroll();

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header scrollY={scrollY} />
            <main className="flex-grow pt-16">
                <LicensePage title="Content License (CC BY-SA 4.0)" content={content} sourceUrl={sourceUrl} />
            </main>
            <Footer />
        </div>
    );
} 