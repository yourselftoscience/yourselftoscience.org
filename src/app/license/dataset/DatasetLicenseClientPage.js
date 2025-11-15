'use client';

import { useScroll } from 'framer-motion';
import LicensePage from '../LicensePage';

export default function DatasetLicenseClientPage({ content, sourceUrl }) {
  const { scrollY } = useScroll();

  return (
    <main className="flex-grow pt-16">
      <LicensePage title="Dataset License (CC0 1.0)" content={content} sourceUrl={sourceUrl} />
    </main>
  );
}
