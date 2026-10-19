import Link from 'next/link';

// Keep a useful page identity and navigation while URL-driven controls initialise.
export default function PageLoading({ title, description }) {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-12 md:py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-apple-primary-text mb-6">{title}</h1>
      <p className="text-lg text-apple-secondary-text mb-6">{description}</p>
      <p role="status" className="text-apple-secondary-text mb-4">Loading interactive content…</p>
      <p><Link href="/resources" className="text-apple-accent underline">Browse the resource index</Link> or <Link href="/get-involved#contact-us" className="text-apple-accent underline">contact the project</Link>.</p>
    </section>
  );
}
