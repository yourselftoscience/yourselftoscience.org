// src/data/resources.js
const rawResources = [
  {
    id: 'open-humans',
    title: 'Open Humans',
    organization: 'Open Humans Foundation', // Added organization
    link: 'https://www.openhumans.org/add-data/',
    dataTypes: ['Genome', 'Health data', 'Wearable data', 'Search history', 'Location history'],
    compensationType: 'donation',
    citations: [
      {
        title:
          'Greshake Tzovaras, B., Angrist, M., Arvai, K., Dulaney, M., Estrada-Galiñanes, V., Gunderson, B., ... & Price Ball, M. (2019). Open Humans: A platform for participant-centered research and personal data exploration. GigaScience, 8(6), giz076.',
        link: 'https://doi.org/10.1093/gigascience/giz076'
      },
    ],
  },
  {
    id: 'myphd',
    title: 'MyPHD',
    organization: 'Stanford University', // Added organization
    link: 'https://myphd.stanford.edu/studies/',
    dataTypes: ['Health data', 'Wearable data'],
    compensationType: 'donation',
    citations: [
      {
        title:
          'Shandhi, M.M.H., Cho, P.J., Roghanizad, A.R. et al. A method for intelligent allocation of diagnostic testing by leveraging data from commercial wearable devices: a case study on COVID-19. npj Digit. Med. 5, 130 (2022)',
        link: 'https://doi.org/10.1038/s41746-022-00672-z',
      },
    ],
  },
  {
    id: 'google-health-studies',
    title: 'Google Health Studies',
    organization: 'Google', // Added organization
    link: 'https://health.google/consumers/health-studies/',
    dataTypes: ['Health data'],
    compensationType: 'donation',
  },
  {
    id: 'apple-research',
    title: 'Apple Research',
    organization: 'Apple', // Added organization
    link: 'https://support.apple.com/en-us/108425',
    dataTypes: ['Health data'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'donation',
  },
  {
    id: 'all-of-us',
    title: 'All of US',
    organization: 'National Institutes of Health (NIH)', // Added organization
    link: 'https://allofus.nih.gov/',
    dataTypes: ['Genome', 'Health data'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'mixed',
  },
  {
    id: 'fitbit-research',
    title: 'Health research and product development', // Shortened title
    organization: 'Fitbit', // Added organization
    instructions: [
      'Open the Fitbit app',
      'Go to Fitbit settings',
      'Select Manage data and privacy',
      'Tap Data shared for research and development',
    ],
    dataTypes: ['Wearable data (Fitbit only)'],
    compensationType: 'donation',
  },
  {
    id: 'spark-for-autism',
    title: 'SPARK for Autism',
    organization: 'Simons Foundation', // Added organization
    link: 'https://sparkforautism.org/why/',
    dataTypes: ['Genome', 'Health data'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'mixed',
  },
  {
    id: 'ubc-body-donation',
    title: 'Body Donation', // Shortened title
    organization: 'Faculty of Medicine at the University of British Columbia', // Added organization
    link: 'https://cps.med.ubc.ca/the-donation-process/',
    dataTypes: ['Body'],
    countries: ['Canada'],
    countryCodes: ['CA'],
    compensationType: 'donation',
  },
  {
    id: 'cambridge-body-tissue-donation',
    title: 'Body Donation; Tissue Donation', // Shortened title
    organization: 'Department of Anatomy at the University Of Cambridge; Cambridge Biomedical Research Centre', // Added organization
    link: 'https://www.cuh.nhs.uk/our-research/get-involved/donate-body-to-medical-science/',
    dataTypes: ['Body', 'Tissue'],
    countries: ['United Kingdom'],
    countryCodes: ['GB'],
    compensationType: 'donation',
  },
  {
    id: 'italy-body-tissue-donation',
    title: 'Body & Tissues Donation',
    organization: 'Ministero della Salute', // Added organization
    link: 'https://www.salute.gov.it/portale/disposizionepostmortem/dettaglioContenutiDisposizionepostmortem.jsp?lingua=italiano&id=6004&area=postMortem&menu=vuoto',
    dataTypes: ['Body', 'Tissue'],
    countries: ['Italy'],
    countryCodes: ['IT'],
    compensationType: 'donation',
  },
  {
    id: 'france-body-donation',
    title: 'Donate the Body to Science',
    organization: 'Service-Public.fr',
    link: 'https://www.service-public.fr/particuliers/vosdroits/F180',
    dataTypes: ['Body'],
    countries: ['France'],
    countryCodes: ['FR'],
    compensationType: 'donation',
  },
  {
    id: 'uk-gamete-donation',
    title: 'Eggs, Sperm and Embryos Donation to Research',
    organization: 'Human Fertilisation and Embryology Authority', // Added organization
    link: 'https://www.hfea.gov.uk/donation/donors/donating-to-research/',
    dataTypes: ['Eggs', 'Embryos', 'Sperm'],
    countries: ['United Kingdom'],
    countryCodes: ['GB'],
    compensationType: 'donation',
  },
  {
    id: 'clinicaltrials-gov',
    title: 'ClinicalTrials.gov',
    link: 'https://clinicaltrials.gov/',
    dataTypes: ['Clinical trials'],
    compensationType: 'mixed', // Changed from donation to mixed
  },
  {
    id: 'who-ictrp',
    title: 'International Clinical Trials Registry Platform (ICTRP)',
    link: 'https://trialsearch.who.int/',
    dataTypes: ['Clinical trials'],
    compensationType: 'mixed', // Changed from donation to mixed
  },
  {
    id: 'clinicaltrials-eu',
    title: 'ClinicalTrials.eu',
    link: 'https://clinicaltrials.eu/',
    dataTypes: ['Clinical trials'],
    countries: ['European Union'],
    countryCodes: ['EU'],
    compensationType: 'mixed', // Changed from donation to mixed
  },
  {
    id: 'essais-cliniques-fr',
    title: 'Essais Cliniques',
    link: 'https://essaiscliniques.fr/',
    dataTypes: ['Clinical trials'],
    countries: ['France'],
    countryCodes: ['FR'],
    compensationType: 'mixed', // Changed from donation to mixed
  },
  {
    id: 'studi-clinici-it',
    title: 'Studi Clinici',
    link: 'https://studi-clinici.it', 
    dataTypes: ['Clinical trials'],
    countries: ['Italy'],
    countryCodes: ['IT'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'klinische-studien-de',
    title: 'Klinische Studien',
    link: 'https://klinischestudien.de/',
    dataTypes: ['Clinical trials'],
    countries: ['Germany'],
    countryCodes: ['DE'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'ensayos-clinicos-es',
    title: 'Ensayos Clinicos',
    link: 'https://ensayosclinicos.es/',
    dataTypes: ['Clinical trials'],
    countries: ['Spain'],
    countryCodes: ['ES'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'klinische-studien-at',
    title: 'Klinische Studien',
    link: 'https://klinischestudien.at/',
    dataTypes: ['Clinical trials'],
    countries: ['Austria'],
    countryCodes: ['AT'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'badania-kliniczne-pl',
    title: 'Badania Kliniczne',
    link: 'https://badaniakliniczne.pl/',
    dataTypes: ['Clinical trials'],
    countries: ['Poland'],
    countryCodes: ['PL'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'studii-clinice-ro',
    title: 'Studii Clinice',
    link: 'https://studii.clinice.ro/',
    dataTypes: ['Clinical trials'],
    countries: ['Romania'],
    countryCodes: ['RO'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'researchmatch',
    title: 'ResearchMatch',
    organization: 'National Institutes of Health (NIH)', // Added organization
    link: 'https://www.researchmatch.org/',
    dataTypes: ['Clinical trials'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'flucamp',
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
    id: 'healthstreet',
    title: 'HealthStreet',
    organization: 'University of Florida Health', // Added organization
    link: 'https://healthstreet.program.ufl.edu/uf-researchers/participate-in-research/',
    dataTypes: ['Clinical trials'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'mixed', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'goodnature-program',
    title: 'GoodNature Program',
    link: 'https://goodnatureprogram.com/apply/',
    dataTypes: ['Stool'],
    countries: ['United States'],
    countryCodes: ['US'],
    compensationType: 'payment', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'lifeblood-microbiome',
    title: 'Microbiome',
    organization: 'Australian Red Cross Lifeblood', // Added organization
    link: 'https://www.lifeblood.com.au/microbiome',
    dataTypes: ['Stool'],
    countries: ['Australia'],
    countryCodes: ['AU'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'wesley-stool-donation',
    title: 'Stool Donation',
    organization: 'Wesley Research Institute', // Added organization
    link: 'https://www.wesleyresearch.org.au/biobank-project/stool-donation/',
    dataTypes: ['Stool'],
    countries: ['Australia'],
    countryCodes: ['AU'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'wesley-placenta-donation',
    title: 'Placenta Donation',
    organization: 'Wesley Research Institute', // Added organization
    link: 'https://www.wesleyresearch.org.au/biobank-project/placenta-donation/',
    dataTypes: ['Placenta'],
    countries: ['Australia'],
    countryCodes: ['AU'],
    compensationType: 'donation', // Add this line - values can be 'donation', 'payment', or 'mixed'
  },
  {
    id: 'wroclaw-hair-decomposition',
    title: 'Human Hair Decompositionw',
    organization: 'Department of Human Biology, University of Wrocław', // Added organization
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
  {
    id: 'ucsf-social-media-archive',
    title: 'Donating Your Social Media',
    link: 'https://www.library.ucsf.edu/archives/donate/materials/donating-your-social-media/',
    organization: 'UCSF Library Archives',
    dataTypes: ['Social media data'],
    compensationType: 'donation'
  },
  {
    id: 'penn-medicine-donate-your-data',
    title: 'Donate Your Data for Health',
    organization: 'Penn Medicine',
    link: 'https://cdh.nmsdev.com/donate-your-data',
    dataTypes: ['Health data', 'Wearable data', 'Social media data', 'Search history'],
    compensationType: 'payment',
    citations: [
      {
        title: 'J.C. Eichstaedt, R.J. Smith, R.M. Merchant, L.H. Ungar, P. Crutchley, D. Preoţiuc-Pietro, D.A. Asch, & H.A. Schwartz,   Facebook language predicts depression in medical records, Proc. Natl. Acad. Sci. U.S.A. 115 (44) 11203-11208, (2018).',
        link: 'https://doi.org/10.1073/pnas.1802331115'
      },
      {
        title: 'Grande D, Mitra N, Marti XL, et al. Consumer Views on Using Digital Data for COVID-19 Control in the United States. JAMA Netw Open. 2021;4(5):e2110918',
        link: 'https://doi.org/10.1001/jamanetworkopen.2021.10918'
      }
    ]
  }
  // Add more resources as needed
];

// Ensure this line exists and uses 'export const'
export const PAYMENT_TYPES = [
  { value: 'donation', label: 'Donation', emoji: '❤️' },
  { value: 'payment', label: 'Payment', emoji: '💵' },
  { value: 'mixed', label: 'Mixed', emoji: '❤️💵' },
  // Add other types if necessary
];

export const resources = rawResources.map((r) => ({
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

export const EU_COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden'
];
