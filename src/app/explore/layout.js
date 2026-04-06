// src/app/explore/layout.js

export const metadata = {
  title: 'Data Explorer',
  description: 'Interactive database view for technical users, including researchers, investors, and policy makers. Filter, sort, and export the complete citizen science catalogue.',
  alternates: {
    canonical: 'https://yourselftoscience.org/explore',
  },
  openGraph: {
    title: 'Data Explorer | Yourself to Science',
    description: 'Interactive database view for technical users, including researchers, investors, and policy makers. Filter, sort, and export the complete citizen science catalogue.',
    url: 'https://yourselftoscience.org/explore',
    type: 'website',
  },
};

export default function ExploreLayout({ children }) {
  return children;
}
