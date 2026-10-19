import Link from 'next/link';
import { maintainer, maintainerUrl } from '../../../data/maintainer';
import { softwareArchiveUrl, registryUrl } from '../../../data/catalogueMetadata';

const title = 'Mario Marcolongo — Founder and Maintainer';
const description = 'Meet Mario Marcolongo, founder and maintainer of Yourself to Science: catalogue curation, source verification, open data and software development.';

export const metadata = {
  title,
  description,
  alternates: { canonical: maintainerUrl },
  openGraph: {
    title: `${title} | Yourself to Science`,
    description,
    url: maintainerUrl,
    type: 'profile',
    firstName: 'Mario',
    lastName: 'Marcolongo',
    images: [{ url: '/preview-tm.png', alt: 'Yourself to Science' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | Yourself to Science`,
    description,
    images: ['/preview-tm.png']
  }
};

export default function MaintainerPage() {
  const profile = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${maintainerUrl}#profile`,
    url: maintainerUrl,
    name: title,
    description,
    mainEntity: maintainer,
    isPartOf: { '@type': 'WebSite', '@id': 'https://yourselftoscience.org/#website' }
  };

  return (
    <article className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-apple-primary-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profile) }} />
      <Link href="/mission" className="text-apple-accent underline underline-offset-4">About the project</Link>
      <header className="mt-8 mb-10">
        <p className="font-medium text-apple-secondary-text mb-3">Founder and maintainer · Yourself to Science</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Mario Marcolongo</h1>
        <p className="mt-6 text-lg leading-relaxed">
          I created Yourself to Science to make research-participation opportunities easier to find and compare,
          and to make the underlying catalogue openly available for others to use.
        </p>
      </header>
      <section className="mb-10 space-y-4 text-base leading-relaxed" aria-labelledby="work-heading">
        <h2 id="work-heading" className="text-2xl font-semibold">My work on the project</h2>
        <p>
          I maintain the website and catalogue, investigate sources, organise resource descriptions and metadata,
          and develop the software and data exports. I also review corrections and contributions through the
          public repository. My background includes scientific fact-checking and source investigations for
          Entropy for Life, alongside contributions to Wikimedia.
        </p>
        <p>
          The catalogue describes third-party programmes and links to their sources. It does not contain
          participant-level research data. Maintaining a listing does not mean running or endorsing the programme;
          its provider remains responsible for eligibility, consent and participation information.
        </p>
      </section>
      <section className="mb-10 space-y-4 text-base leading-relaxed" aria-labelledby="evidence-heading">
        <h2 id="evidence-heading" className="text-2xl font-semibold">Project records and contributions</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li><a className="text-apple-accent underline underline-offset-4" href="https://github.com/yourselftoscience/yourselftoscience.org">Source code, history and contributions on GitHub</a></li>
          <li><Link className="text-apple-accent underline underline-offset-4" href="/data">Live CC0 catalogue and data downloads</Link></li>
          <li><a className="text-apple-accent underline underline-offset-4" href={softwareArchiveUrl}>Versioned software archive on Zenodo</a></li>
          <li><a className="text-apple-accent underline underline-offset-4" href={registryUrl}>FAIRsharing registry record</a></li>
        </ul>
      </section>
      <section className="space-y-4 text-base leading-relaxed" aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="text-2xl font-semibold">Contact and background</h2>
        <p>
          For corrections, contributions or collaboration, use the <Link className="text-apple-accent underline underline-offset-4" href="/get-involved#contact-us">project contact form</Link> or
          email <a className="text-apple-accent underline underline-offset-4" href="mailto:hello@yourselftoscience.org">hello@yourselftoscience.org</a>.
        </p>
        <p>
          My <a className="text-apple-accent underline underline-offset-4" href="https://mariomarcolongo.com/">personal portfolio</a> covers my wider work.
          You can also find me on <a className="text-apple-accent underline underline-offset-4" href="https://orcid.org/0000-0003-2846-7115">ORCID</a>,{' '}
          <a className="text-apple-accent underline underline-offset-4" href="https://github.com/mariomarcolongo">GitHub</a> and{' '}
          <a className="text-apple-accent underline underline-offset-4" href="https://www.linkedin.com/in/mario-marcolongo/">LinkedIn</a>.
        </p>
      </section>
    </article>
  );
}
