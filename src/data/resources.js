// src/data/resources.js

export const resources = [
  {
    title: 'Open Humans',
    link: 'https://www.openhumans.org/add-data/',
    dataTypes: ['Genome', 'Health data', 'Fitbit data'],
    // No countries field since it's available worldwide
  },
  {
    title: 'MyPHD',
    link: 'https://myphd.stanford.edu/studies/',
    dataTypes: ['Health data','Fitbit data'],
  },
  {
    title: 'Google Health Studies',
    link: 'https://health.google/consumers/health-studies/',
    dataTypes: ['Health data'],
  },
  {
    title: 'Apple Research',
    link: 'https://support.apple.com/en-us/108425',
    dataTypes: ['Health data'],
    countries: ['United States'],
    countryCodes: ['US'],
  },
  {
    title: 'All of US',
    link: 'https://allofus.nih.gov/',
    dataTypes: ['Genome', 'Health data'],
    countries: ['United States'],
    countryCodes: ['US'],
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
  },
  {
    title: 'SPARK for Autism',
    link: 'https://sparkforautism.org/why/',
    dataTypes: ['Genome', 'Health data'],
    countries: ['United States'],
    countryCodes: ['US'],
  },
  {
    title: 'Body Donation – Faculty of Medicine at the University of British Columbia',
    link: 'https://cps.med.ubc.ca/the-donation-process/',
    dataTypes: ['Body'],
    countries: ['Canada'],
    countryCodes: ['CA'],
  },
  {
    title: 'Body Donation – Department of Anatomy at the University Of Cambridge, Tissue Donation – Cambridge Biomedical Research Centre',
    link: 'https://www.cuh.nhs.uk/our-research/get-involved/donate-body-to-medical-science/',
    dataTypes: ['Body', 'Tissue'],
    countries: ['United Kingdom'],
    countryCodes: ['GB'],
  },
  {
    title: 'Body & Tissues Donation – Ministero della Salute',
    link: 'https://www.salute.gov.it/portale/disposizionepostmortem/dettaglioContenutiDisposizionepostmortem.jsp?lingua=italiano&id=6004&area=postMortem&menu=vuoto',
    dataTypes: ['Body', 'Tissue'],
    countries: ['Italy'],
    countryCodes: ['IT'],
  },
  {
    title: 'Eggs, Sperm and Embryos Donation to Research – Human Fertilisation and Embryology Authority',
    link: 'https://www.hfea.gov.uk/donation/donors/donating-to-research/',
    dataTypes: ['Eggs', 'Embryos', 'Sperm'],
    countries: ['United Kingdom'],
    countryCodes: ['GB'],
  }
  // Add more resources as needed
];
