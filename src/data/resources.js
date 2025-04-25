// src/data/resources.js
const rawResources = [
  {
    title: 'Open Humans',
    link: 'https://www.openhumans.org/add-data/',
    dataTypes: ['Genome', 'Health data', 'Fitbit data'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
    citations: [
      {
        title:
          'Greshake Tzovaras, B., Angrist, M., Arvai, K., Dulaney, M., Estrada-Galiñanes, V., Gunderson, B., ... & Price Ball, M. (2019). Open Humans: A platform for participant-centered research and personal data exploration. GigaScience, 8(6), giz076.',
        link: 'https://doi.org/10.1093/gigascience/giz076'
      },
    ],
  },
  {
    title: 'MyPHD',
    link: 'https://myphd.stanford.edu/studies/',
    dataTypes: ['Health data', 'Fitbit data'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Google Health Studies',
    link: 'https://health.google/consumers/health-studies/',
    dataTypes: ['Health data'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Apple Research',
    link: 'https://support.apple.com/en-us/108425',
    dataTypes: ['Health data'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'All of US',
    link: 'https://allofus.nih.gov/',
    dataTypes: ['Genome', 'Health data'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Health research and product development (Fitbit)',
    instructions: [
      'Open the Fitbit app',
      'Go to Fitbit settings',
      'Select Manage data and privacy',
      'Tap Data shared for research and development',
    ],
    dataTypes: ['Fitbit data'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'SPARK for Autism',
    link: 'https://sparkforautism.org/why/',
    dataTypes: ['Genome', 'Health data'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Body Donation – Faculty of Medicine at the University of British Columbia',
    link: 'https://cps.med.ubc.ca/the-donation-process/',
    dataTypes: ['Body'],
    countries: ['Canada'],
    countryCodes: ['CA'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Body Donation – Department of Anatomy at the University Of Cambridge, Tissue Donation – Cambridge Biomedical Research Centre',
    link: 'https://www.cuh.nhs.uk/our-research/get-involved/donate-body-to-medical-science/',
    dataTypes: ['Body', 'Tissue'],
    countries: ['United Kingdom'],
    countryCodes: ['GB'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Body & Tissues Donation – Ministero della Salute',
    link: 'https://www.salute.gov.it/portale/disposizionepostmortem/dettaglioContenutiDisposizionepostmortem.jsp?lingua=italiano&id=6004&area=postMortem&menu=vuoto',
    dataTypes: ['Body', 'Tissue'],
    countries: ['Italy'],
    countryCodes: ['IT'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Eggs, Sperm and Embryos Donation to Research – Human Fertilisation and Embryology Authority',
    link: 'https://www.hfea.gov.uk/donation/donors/donating-to-research/',
    dataTypes: ['Eggs', 'Embryos', 'Sperm'],
    countries: ['United Kingdom'],
    countryCodes: ['GB'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'ClinicalTrials.org',
    link: 'https://clinicaltrials.gov/',
    dataTypes: ['Clinical trials'],
    compensationType: 'mixed', // Changed from donation to mixed
  },
  {
    title: 'International Clinical Trials Registry Platform (ICTRP)',
    link: 'https://trialsearch.who.int/',
    dataTypes: ['Clinical trials'],
    compensationType: 'mixed', // Changed from donation to mixed
  },
  {
    title: 'ClinicalTrials.eu',
    link: 'https://clinicaltrials.eu/',
    dataTypes: ['Clinical trials'],
    countries: ['European Union'],
    countryCodes: ['EU'],
    compensationType: 'mixed', // Changed from donation to mixed
  },
  {
    title: 'Essais Cliniques',
    link: 'https://essaiscliniques.fr/',
    dataTypes: ['Clinical trials'],
    countries: ['France'],
    countryCodes: ['FR'],
    compensationType: 'mixed', // Changed from donation to mixed
  },
  {
    title: 'Studi Clinici',
    link: 'https://studi.clinici.it/',
    dataTypes: ['Clinical trials'],
    countries: ['Italy'],
    countryCodes: ['IT'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Klinische Studien',
    link: 'https://klinischestudien.de/',
    dataTypes: ['Clinical trials'],
    countries: ['Germany'],
    countryCodes: ['DE'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Ensayos Clinicos',
    link: 'https://ensayosclinicos.es/',
    dataTypes: ['Clinical trials'],
    countries: ['Spain'],
    countryCodes: ['ES'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Klinische Studien',
    link: 'https://klinischestudien.at/',
    dataTypes: ['Clinical trials'],
    countries: ['Austria'],
    countryCodes: ['AT'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Badania Kliniczne',
    link: 'https://badaniakliniczne.pl/',
    dataTypes: ['Clinical trials'],
    countries: ['Poland'],
    countryCodes: ['PL'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Studii Clinice',
    link: 'https://studii.clinice.ro/',
    dataTypes: ['Clinical trials'],
    countries: ['Romania'],
    countryCodes: ['RO'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'ResearchMatch',
    link: 'https://www.researchmatch.org/',
    dataTypes: ['Clinical trials'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'FluCamp',
    link: 'https://flucamp.com/',
    dataTypes: ['Clinical trials'],
    countries: ['United Kingdom'],
    countryCodes: ['GB'],
    compensationType: 'payment', // Add this line - values can be 'donation', 'payment', or 'mixed'
    citations: [
      {
        title:
          'Kelly, G., Laxton, C., Garelnabi, M., Alton, B., Addan, F., Catchpole, A., ... & Murray, E. J. (2015). Use of qualitative integrative cycler PCR (qicPCR) to identify optimal therapeutic dosing time-points in a Respiratory Syncytial Virus Human Viral Challenge Model (hVCM). Journal of virological methods, 224, 83-90.',
        link: 'https://doi.org/10.1016/j.jviromet.2015.08.019'
      },
    ],
  },
  {
    title: 'HealthStreet - University of Florida Health',
    link: 'https://healthstreet.program.ufl.edu/uf-researchers/participate-in-research/',
    dataTypes: ['Clinical trials'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'GoodNature Program',
    link: 'https://goodnatureprogram.com/apply/',
    dataTypes: ['Stool'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'payment', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Microbiome - Australian Red Cross Lifeblood',
    link: 'https://www.lifeblood.com.au/microbiome',
    dataTypes: ['Stool'],
    countries: ['Australia'],
    countryCodes: ['AU'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Stool Donation - Wesley Research Institute',
    link: 'https://www.wesleyresearch.org.au/biobank-project/stool-donation/',
    dataTypes: ['Stool'],
    countries: ['Australia'],
    countryCodes: ['AU'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Placenta Donation - Wesley Research Institute',
    link: 'https://www.wesleyresearch.org.au/biobank-project/placenta-donation/',
    dataTypes: ['Placenta'],
    countries: ['Australia'],
    countryCodes: ['AU'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    title: 'Human Hair Decomposition - Department of Human Biology, University of Wrocław',
    link: 'https://biologia.uwr.edu.pl/2023/10/12/znaczenie-wybranych-czynnikow-biologicznych-i-srodowiskowych-w-procesie-rozkladu-ludzkich-wlosow-nabor-na-badania/',
    dataTypes: ['Hair'],
    countries: ['Poland'],
    countryCodes: ['PL'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
    citations: [
      {
        title: 'Palacz, K., Cholewa, M., Bonar, M., Krzyżanowska, M., & Kadej, M. (2023). The rate and quality of post-mortem hair root changes in relation to melanin content. Forensic Science International, 350, 111784.',
        link: 'https://doi.org/10.1016/j.forsciint.2023.111784'
      },
      {
        title: 'University of Wrocław. (2023, November 9). Donate your hair for science.',
        link: 'https://uwr.edu.pl/en/donate-your-hair-for-science/'
      },
    ],
  },
  // Add more resources as needed
];

// Ensure this line exists and uses 'export const'
export const PAYMENT_TYPES = [
  { value: 'donation', label: 'Donation', emoji: '❤️' },
  { value: 'payment', label: 'Payment', emoji: '💵' },
  { value: 'mixed', label: 'Mixed', emoji: '❤️💵' },
  // Add other types if necessary
];

export const resources = rawResources.map((r, i) => ({
  id: r.id || String(i + 1), // Auto-assign id if missing
  ...r,
}));

// Helper to generate a consistent key for a citation
function getCitationKey(citation) {
  if (citation && citation.link) {
    return citation.link.trim();
  }
  if (citation && citation.title) {
    // Use a simplified version of the title if no link exists
    // This is less reliable but a fallback
    return citation.title.trim().toLowerCase().substring(0, 50);
  }
  return null; // Cannot generate key
}

// --- Generate unique citations and map ---
const allCitations = resources.flatMap(r => r.citations || []);
const uniqueCitationMap = new Map();

allCitations.forEach(citation => {
  const key = getCitationKey(citation);
  if (key && !uniqueCitationMap.has(key)) {
    uniqueCitationMap.set(key, citation);
  }
});

export const uniqueCitations = Array.from(uniqueCitationMap.values());

// Generate map from citation key to its index in uniqueCitations
export const citationMap = uniqueCitations.reduce((map, citation, index) => {
  const key = getCitationKey(citation);
  if (key) {
    map[key] = index; // Store the 0-based index
  }
  return map;
}, {});
