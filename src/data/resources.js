// src/data/resources.js

const rawResources = [
  {
    "id": "1e7d825c-6b1e-4368-936c-2a4ad415b828",
    "slug": "open-humans",
    "title": "Open Humans",
    "organization": "Open Humans Foundation",
    "link": "https://www.openhumans.org/add-data/",
    "dataTypes": [
      "Genome",
      "Health data",
      "Wearable data",
      "Search history",
      "Location history"
    ],
    "compensationType": "donation",
    "entityCategory": "Non-Profit",
    "entitySubType": "Research Foundation",
    "citations": [
      {
        "title": "Greshake Tzovaras, B., Angrist, M., Arvai, K., Dulaney, M., Estrada-Galiñanes, V., Gunderson, B., ... & Price Ball, M. (2019). Open Humans: A platform for participant-centered research and personal data exploration. GigaScience, 8(6), giz076.",
        "link": "https://doi.org/10.1093/gigascience/giz076"
      }
    ]
  },
  {
    "id": "9a1f26a8-2b81-4b1e-9b5a-1c6d7e8f9a0b",
    "slug": "myphd",
    "title": "MyPHD",
    "organization": "Stanford University",
    "link": "https://myphd.stanford.edu/studies/",
    "dataTypes": [
      "Health data",
      "Wearable data"
    ],
    "compensationType": "donation",
    "entityCategory": "Academic",
    "entitySubType": "Academic",
    "citations": [
      {
        "title": "Shandhi, M.M.H., Cho, P.J., Roghanizad, A.R. et al. A method for intelligent allocation of diagnostic testing by leveraging data from commercial wearable devices: a case study on COVID-19. npj Digit. Med. 5, 130 (2022)",
        "link": "https://doi.org/10.1038/s41746-022-00672-z"
      }
    ]
  },
  {
    "id": "c7a8b9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    "slug": "google-health-studies",
    "title": "Google Health Studies",
    "organization": "Google",
    "link": "https://health.google/consumers/health-studies/",
    "dataTypes": [
      "Health data"
    ],
    "compensationType": "donation",
    "entityCategory": "Commercial",
    "entitySubType": "Commercial"
  },
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "slug": "apple-research",
    "title": "Apple Research",
    "organization": "Apple",
    "link": "https://support.apple.com/en-us/108425",
    "dataTypes": [
      "Health data"
    ],
    "countries": [
      "United States"
    ],
    "countryCodes": [
      "US"
    ],
    "compensationType": "donation",
    "entityCategory": "Commercial",
    "entitySubType": "Commercial"
  },
  {
    "id": "b3c4d5e6-f7g8-9h0i-j1k2-l3m4n5o6p7q8",
    "slug": "all-of-us",
    "title": "All of US",
    "organization": "National Institutes of Health (NIH)",
    "link": "https://allofus.nih.gov/",
    "dataTypes": [
      "Genome",
      "Health data"
    ],
    "countries": [
      "United States"
    ],
    "countryCodes": [
      "US"
    ],
    "compensationType": "mixed",
    "entityCategory": "Government",
    "entitySubType": "Research Agency"
  },
  {
    "id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9g",
    "slug": "fitbit-research",
    "title": "Health research and product development",
    "organization": "Fitbit",
    "instructions": [
      "Open the Fitbit app",
      "Go to Fitbit settings",
      "Select Manage data and privacy",
      "Tap Data shared for research and development"
    ],
    "dataTypes": [
      "Wearable data (Fitbit only)"
    ],
    "compensationType": "donation",
    "entityCategory": "Commercial",
    "entitySubType": "Commercial"
  },
  {
    "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "slug": "spark-for-autism",
    "title": "SPARK for Autism",
    "organization": "Simons Foundation",
    "link": "https://sparkforautism.org/why/",
    "dataTypes": [
      "Genome",
      "Health data"
    ],
    "countries": [
      "United States"
    ],
    "countryCodes": [
      "US"
    ],
    "compensationType": "mixed",
    "entityCategory": "Non-Profit",
    "entitySubType": "Research Foundation"
  },
  {
    "id": "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9g0h",
    "slug": "ubc-body-donation",
    "title": "Body Donation",
    "organization": "Faculty of Medicine at the University of British Columbia",
    "link": "https://cps.med.ubc.ca/the-donation-process/",
    "dataTypes": [
      "Body"
    ],
    "countries": [
      "Canada"
    ],
    "countryCodes": [
      "CA"
    ],
    "compensationType": "donation",
    "entityCategory": "Academic",
    "entitySubType": "Academic"
  },
  {
    "id": "f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8g9h0i1",
    "slug": "cambridge-body-tissue-donation",
    "title": "Body Donation; Tissue Donation",
    "organization": "Department of Anatomy at the University Of Cambridge; Cambridge Biomedical Research Centre",
    "link": "https://www.cuh.nhs.uk/our-research/get-involved/donate-body-to-medical-science/",
    "dataTypes": [
      "Body",
      "Tissue"
    ],
    "countries": [
      "United Kingdom"
    ],
    "countryCodes": [
      "GB"
    ],
    "compensationType": "donation",
    "entityCategory": "Academic",
    "entitySubType": "Academic"
  },
  {
    "id": "a7b8c9d0-e1f2-a3b4-c5d6-e7f8g9h0i1j2",
    "slug": "italy-body-tissue-donation",
    "title": "Body & Tissues Donation",
    "organization": "Ministero della Salute",
    "link": "https://www.salute.gov.it/portale/disposizionepostmortem/dettaglioContenutiDisposizionepostmortem.jsp?lingua=italiano&id=6004&area=postMortem&menu=vuoto",
    "dataTypes": [
      "Body",
      "Tissue"
    ],
    "countries": [
      "Italy"
    ],
    "countryCodes": [
      "IT"
    ],
    "compensationType": "donation",
    "entityCategory": "Government",
    "entitySubType": "Public Health Service"
  },
  {
    "id": "b8c9d0e1-f2a3-b4c5-d6e7-f8g9h0i1j2k3",
    "slug": "france-body-donation",
    "title": "Donate the Body to Science",
    "organization": "Service-Public.fr",
    "link": "https://www.service-public.fr/particuliers/vosdroits/F180",
    "dataTypes": [
      "Body"
    ],
    "countries": [
      "France"
    ],
    "countryCodes": [
      "FR"
    ],
    "compensationType": "donation",
    "entityCategory": "Government",
    "entitySubType": "Public Health Service"
  },
  {
    "id": "c9d0e1f2-a3b4-c5d6-e7f8-g9h0i1j2k3l4",
    "slug": "uk-gamete-donation",
    "title": "Eggs, Sperm and Embryos Donation to Research",
    "organization": "Human Fertilisation and Embryology Authority",
    "link": "https://www.hfea.gov.uk/donation/donors/donating-to-research/",
    "dataTypes": [
      "Eggs",
      "Embryos",
      "Sperm"
    ],
    "countries": [
      "United Kingdom"
    ],
    "countryCodes": [
      "GB"
    ],
    "compensationType": "donation",
    "entityCategory": "Government",
    "entitySubType": "Statutory Authority"
  },
  {
    "id": "d0e1f2a3-b4c5-d6e7-f8g9-h0i1j2k3l4m5",
    "slug": "clinicaltrials-gov",
    "title": "ClinicalTrials.gov",
    "organization": "United States National Library of Medicine (NLM)",
    "link": "https://clinicaltrials.gov/",
    "dataTypes": [
      "Clinical trials"
    ],
    "compensationType": "mixed",
    "resourceType": "registry",
    "entityCategory": "Government",
    "entitySubType": "Research Agency",
    "description": "A comprehensive registry and results database of publicly and privately supported clinical studies conducted around the world. Managed by the U.S. National Library of Medicine."
  },
  {
    "id": "e1f2a3b4-c5d6-e7f8-g9h0-i1j2k3l4m5n6",
    "slug": "who-ictrp",
    "title": "International Clinical Trials Registry Platform (ICTRP)",
    "organization": "World Health Organization (WHO)",
    "link": "https://trialsearch.who.int/",
    "dataTypes": [
      "Clinical trials"
    ],
    "compensationType": "mixed",
    "resourceType": "registry",
    "entityCategory": "Intergovernmental",
    "entitySubType": "Intergovernmental Organization"
  },
  {
    "id": "f2a3b4c5-d6e7-f8g9-h0i1-j2k3l4m5n6o7",
    "slug": "eu-clinical-trials-register",
    "title": "EU Clinical Trials Register",
    "organization": "European Medicines Agency (EMA)",
    "link": "https://euclinicaltrials.eu/search-for-clinical-trials/",
    "dataTypes": [
      "Clinical trials"
    ],
    "countries": [
      "European Union",
      "Iceland",
      "Liechtenstein",
      "Norway"
    ],
    "countryCodes": [
      "EU",
      "IS",
      "LI",
      "NO"
    ],
    "compensationType": "mixed",
    "resourceType": "registry",
    "entityCategory": "Government",
    "entitySubType": "Regulatory Agency",
    "description": "The European Union's official database for clinical trials conducted in the EU and EEA."
  },
  {
    "id": "a3b4c5d6-e7f8-g9h0-i1j2-k3l4m5n6o7p8",
    "slug": "ectin-poland",
    "title": "European Clinical Trials Information Network",
    "organization": "Clinical Trials Information Network (CTIN Poland)",
    "link": "https://clinicaltrials.eu/",
    "dataTypes": [
      "Clinical trials"
    ],
    "countries": [
      "European Union"
    ],
    "countryCodes": [
      "EU"
    ],
    "compensationType": "mixed",
    "resourceType": "registry",
    "entityCategory": "Commercial",
    "entitySubType": "Commercial",
    "citations": [
      {
        "title": "Figueira-Gonçalves, J. M., Callejas-González, F. J., Golpe, R., Máiz-Carro, L., Marín-Oto, M., de Miguel-Díez, J., ... & Hurtado-Fuentes, Á. (2025). Current Evidence on the Usefulness of Potential Therapies in the Prevention of COPD Exacerbations: Beyond the Use of Bronchodilator Therapy and Inhaled Corticosteroids. Open Respiratory Archives, 7(2), 100438.",
        "link": "https://doi.org/10.1016/j.opresp.2025.100438"
      },
      {
        "title": "Pranaitytė, G., Grybaitė, B., Endriulaityte, U., Mickevičius, V., & Petrikaitė, V. (2025). Exploration of 1-(2, 4-difluorophenyl)-5-oxopyrrolidine-3-carboxylic acid derivatives effect on triple-negative breast, prostate cancer and melanoma cell 2D and 3D cultures. Scientific Reports, 15(1), 1-16.",
        "link": "https://doi.org/10.1038/s41598-025-02106-8"
      }
    ]
  },
  {
    "id": "b4c5d6e7-f8g9-h0i1-j2k3-l4m5n6o7p8q9",
    "slug": "curewiki",
    "title": "Curewiki",
    "organization": "Curewiki",
    "link": "https://www.curewiki.health/",
    "dataTypes": [
      "Clinical trials"
    ],
    "countries": [
      "European Union",
      "Iceland",
      "Liechtenstein",
      "Norway"
    ],
    "countryCodes": [
      "EU",
      "IS",
      "LI",
      "NO"
    ],
    "compensationType": "mixed",
    "resourceType": "registry",
    "entityCategory": "Commercial",
    "entitySubType": "Commercial",
    "citations": [
      {
        "title": "van der Laan, P., van Houdt, W. J., van Boven, H., Snaebjornsson, P., Bosch, L. J. W., Monkhorst, K., ... & van der Graaf, W. T. A. (2025). The role of whole-genome sequencing for guiding systemic therapy in patients with soft tissue sarcoma. ESMO open, 10(6), 105287.",
        "link": "https://doi.org/10.1016/j.esmoop.2025.105287"
      }
    ]
  },
  {
    "id": "c5d6e7f8-g9h0-i1j2-k3l4-m5n6o7p8q9r0",
    "slug": "esperity-clinical-trials",
    "title": "Clinical Trial Discovery",
    "organization": "Esperity",
    "link": "https://clinicaltrial.be/",
    "dataTypes": [
      "Clinical trials"
    ],
    "compensationType": "mixed",
    "resourceType": "registry",
    "entityCategory": "Commercial",
    "entitySubType": "Commercial",
    "citations": [
      {
        "title": "De Corte, W., Delrue, H., Vanfleteren, L. J. J., Dutré, P. E. M., Pottel, H., Devriendt, D. K. J. C., ... & Desmet, M. B. (2012). Randomized clinical trial on the influence of anaesthesia protocol on intestinal motility during laparoscopic surgery requiring small bowel anastomosis. Journal of British Surgery, 99(11), 1524-1529.",
        "link": "https://doi.org/10.1002/bjs.8883"
      },
      {
        "title": "Desmet, M., Braems, H., Reynvoet, M., Plasschaert, S., Van Cauwelaert, J., Pottel, H., ... & Van de Velde, M. (2013). IV and perineural dexamethasone are equivalent in increasing the analgesic duration of a single-shot interscalene block with ropivacaine for shoulder surgery: a prospective, randomized, placebo-controlled study. British journal of anaesthesia, 111(3), 445-452.",
        "link": "https://doi.org/10.1093/bja/aet109"
      },
      {
        "title": "Jacobs, H., Bockaert, M., Bonte, J., D'Haese, M., Degrande, J., Descamps, L., ... & De Bacquer, D. (2020). The impact of a group-based multidisciplinary rehabilitation program on the quality of life in patients with fibromyalgia: results from the QUALIFIBRO study. JCR: Journal of Clinical Rheumatology, 26(8), 313-319.",
        "link": "https://doi.org/10.1097/RHU.0000000000001120"
      },
      {
        "title": "Terryn, S., De Medts, J., & Delsupehe, K. (2015). Comparative effectiveness of the different treatment modalities for snoring. Otolaryngology–Head and Neck Surgery, 153(3), 468-475.",
        "link": "https://doi.org/10.1177/0194599815596166"
      },
      {
        "title": "Calus, L., Van Bruaene, N., Bosteels, C., Dejonckheere, S., Van Zele, T., Holtappels, G., ... & Gevaert, P. (2019). Twelve‐year follow‐up study after endoscopic sinus surgery in patients with chronic rhinosinusitis with nasal polyposis. Clinical and translational allergy, 9(1), 30.",
        "link": "https://doi.org/10.1186/s13601-019-0269-4"
      }
    ]
  },
  {
    "id": "d6e7f8g9-h0i1-j2k3-l4m5-n6o7p8q9r0s1",
    "slug": "researchmatch",
    "title": "ResearchMatch",
    "organization": "National Institutes of Health (NIH)",
    "link": "https://www.researchmatch.org/",
    "dataTypes": [
      "Clinical trials"
    ],
    "countries": [
      "United States"
    ],
    "countryCodes": [
      "US"
    ],
    "compensationType": "mixed",
    "entityCategory": "Government",
    "entitySubType": "Research Agency",
    "description": "A nonprofit program funded by the National Institutes of Health (NIH) that connects people interested in research studies with researchers from top medical centers across the U.S."
  },
  {
    "id": "e7f8g9h0-i1j2-k3l4-m5n6-o7p8q9r0s1t2",
    "slug": "flucamp",
    "title": "FluCamp",
    "link": "https://flucamp.com/",
    "dataTypes": [
      "Clinical trials"
    ],
    "countries": [
      "United Kingdom"
    ],
    "countryCodes": [
      "GB"
    ],
    "compensationType": "payment",
    "entityCategory": "Commercial",
    "entitySubType": "Commercial",
    "description": "Conducts clinical trials for flu and common cold viruses in London and Manchester, compensating volunteers for their time.",
    "citations": [
      {
        "title": "Kelly, G., Laxton, C., Garelnabi, M., Alton, B., Addan, F., Catchpole, A., ... & Murray, E. J. (2015). Use of qualitative integrative cycler PCR (qicPCR) to identify optimal therapeutic dosing time-points in a Respiratory Syncytial Virus Human Viral Challenge Model (hVCM). Journal of virological methods, 224, 83-90.",
        "link": "https://doi.org/10.1016/j.jviromet.2015.08.019"
      }
    ]
  },
  {
    "id": "f8g9h0i1-j2k3-l4m5-n6o7-p8q9r0s1t2u3",
    "slug": "healthstreet",
    "title": "HealthStreet",
    "organization": "University of Florida Health",
    "link": "https://healthstreet.program.ufl.edu/uf-researchers/participate-in-research/",
    "dataTypes": [
      "Clinical trials"
    ],
    "countries": [
      "United States"
    ],
    "countryCodes": [
      "US"
    ],
    "compensationType": "mixed",
    "entityCategory": "Academic",
    "entitySubType": "Academic",
    "description": "Connects community members in Florida with health research opportunities at the University of Florida."
  },
  {
    "id": "a9h0i1j2-k3l4-m5n6-o7p8-q9r0s1t2u3v4",
    "slug": "goodnature-program",
    "title": "GoodNature Program",
    "link": "https://goodnatureprogram.com/apply/",
    "dataTypes": [
      "Stool"
    ],
    "countries": [
      "United States"
    ],
    "countryCodes": [
      "US"
    ],
    "compensationType": "payment",
    "entityCategory": "Commercial",
    "entitySubType": "Commercial"
  },
  {
    "id": "b0i1j2k3-l4m5-n6o7-p8q9-r0s1t2u3v4w5",
    "slug": "lifeblood-microbiome",
    "title": "Microbiome",
    "organization": "Australian Red Cross Lifeblood",
    "link": "https://www.lifeblood.com.au/microbiome",
    "dataTypes": [
      "Stool"
    ],
    "countries": [
      "Australia"
    ],
    "countryCodes": [
      "AU"
    ],
    "compensationType": "donation",
    "entityCategory": "Non-Profit",
    "entitySubType": "Non-Profit Organization"
  },
  {
    "id": "c1j2k3l4-m5n6-o7p8-q9r0-s1t2u3v4w5x6",
    "slug": "wesley-stool-donation",
    "title": "Stool Donation",
    "organization": "Wesley Research Institute",
    "link": "https://www.wesleyresearch.org.au/biobank-project/stool-donation/",
    "dataTypes": [
      "Stool"
    ],
    "countries": [
      "Australia"
    ],
    "countryCodes": [
      "AU"
    ],
    "compensationType": "donation",
    "entityCategory": "Non-Profit",
    "entitySubType": "Non-Profit Organization"
  },
  {
    "id": "d2k3l4m5-n6o7-p8q9-r0s1-t2u3v4w5x6y7",
    "slug": "wesley-placenta-donation",
    "title": "Placenta Donation",
    "organization": "Wesley Research Institute",
    "link": "https://www.wesleyresearch.org.au/biobank-project/placenta-donation/",
    "dataTypes": [
      "Placenta"
    ],
    "countries": [
      "Australia"
    ],
    "countryCodes": [
      "AU"
    ],
    "compensationType": "donation",
    "entityCategory": "Non-Profit",
    "entitySubType": "Non-Profit Organization"
  },
  {
    "id": "e3l4m5n6-o7p8-q9r0-s1t2-u3v4w5x6y7z8",
    "slug": "wroclaw-hair-decomposition",
    "title": "Human Hair Decompositionw",
    "organization": "Department of Human Biology, University of Wrocław",
    "link": "https://biologia.uwr.edu.pl/2023/10/12/znaczenie-wybranych-czynnikow-biologicznych-i-srodowiskowych-w-procesie-rozkladu-ludzkich-wlosow-nabor-na-badania/",
    "dataTypes": [
      "Hair"
    ],
    "countries": [
      "Poland"
    ],
    "countryCodes": [
      "PL"
    ],
    "compensationType": "donation",
    "entityCategory": "Academic",
    "entitySubType": "Academic",
    "citations": [
      {
        "title": "Palacz, K., Cholewa, M., Bonar, M., Krzyżanowska, M., & Kadej, M. (2023). The rate and quality of post-mortem hair root changes in relation to melanin content. Forensic Science International, 350, 111784.",
        "link": "https://doi.org/10.1016/j.forsciint.2023.111784"
      },
      {
        "title": "University of Wrocław. (2023, November 9). Donate your hair for science.",
        "link": "https://uwr.edu.pl/en/donate-your-hair-for-science/"
      }
    ]
  },
  {
    "id": "f4m5n6o7-p8q9-r0s1-t2u3-v4w5x6y7z8a9",
    "slug": "ucsf-social-media-archive",
    "title": "Donating Your Social Media",
    "link": "https://www.library.ucsf.edu/archives/donate/materials/donating-your-social-media/",
    "organization": "UCSF Library Archives",
    "dataTypes": [
      "Social media data"
    ],
    "compensationType": "donation",
    "entityCategory": "Academic",
    "entitySubType": "Academic"
  },
  {
    "id": "a5n6o7p8-q9r0-s1t2-u3v4-w5x6y7z8a9b0",
    "slug": "penn-medicine-donate-your-data",
    "title": "Donate Your Data for Health",
    "organization": "Penn Medicine",
    "link": "https://cdh.nmsdev.com/donate-your-data",
    "dataTypes": [
      "Health data",
      "Wearable data",
      "Social media data",
      "Search history"
    ],
    "compensationType": "payment",
    "entityCategory": "Academic",
    "entitySubType": "Academic",
    "citations": [
      {
        "title": "J.C. Eichstaedt, R.J. Smith, R.M. Merchant, L.H. Ungar, P. Crutchley, D. Preoţiuc-Pietro, D.A. Asch, & H.A. Schwartz,   Facebook language predicts depression in medical records, Proc. Natl. Acad. Sci. U.S.A. 115 (44) 11203-11208, (2018).",
        "link": "https://doi.org/10.1073/pnas.1802331115"
      },
      {
        "title": "Grande D, Mitra N, Marti XL, et al. Consumer Views on Using Digital Data for COVID-19 Control in the United States. JAMA Netw Open. 2021;4(5):e2110918",
        "link": "https://doi.org/10.1001/jamanetworkopen.2021.10918"
      }
    ]
  },
  {
    "id": "b6o7p8q9-r0s1-t2u3-v4w5-x6y7z8a9b0c1",
    "slug": "hra-research-summaries",
    "title": "Research Summaries",
    "organization": "NHS Health Research Authority",
    "link": "https://www.hra.nhs.uk/planning-and-improving-research/application-summaries/research-summaries/",
    "dataTypes": [
      "Health data"
    ],
    "countries": [
      "United Kingdom"
    ],
    "countryCodes": [
      "GB"
    ],
    "compensationType": "donation",
    "entityCategory": "Government",
    "entitySubType": "Regulatory Agency",
    "description": "Plain-language summaries of research studies approved by the NHS Health Research Authority."
  },
  {
    "id": "c7p8q9r0-s1t2-u3v4-w5x6-y7z8a9b0c1d2",
    "slug": "cochrane-central-register-of-controlled-trials",
    "title": "Cochrane Central Register of Controlled Trials (CENTRAL)",
    "organization": "Cochrane Library",
    "link": "https://www.cochranelibrary.com/central",
    "dataTypes": [
      "Clinical trials"
    ],
    "compensationType": "mixed",
    "resourceType": "database",
    "entityCategory": "Non-Profit",
    "entitySubType": "Research Collaborative",
    "description": "A highly concentrated source of reports of randomized and quasi-randomized controlled trials from various databases and other sources. Access requires a subscription to the Cochrane Library."
  },
  {
    "id": "d8q9r0s1-t2u3-v4w5-x6y7-z8a9b0c1d2e3",
    "slug": "belgian-clinical-trials-database",
    "title": "Clinical Trials Database",
    "organization": "Federal Agency for Medicines and Health Products (FAMHP)",
    "link": "https://clinicaltrialsdatabase.be/",
    "dataTypes": [
      "Clinical trials"
    ],
    "countries": [
      "Belgium"
    ],
    "countryCodes": [
      "BE"
    ],
    "compensationType": "mixed",
    "resourceType": "registry",
    "entityCategory": "Government",
    "entitySubType": "Regulatory Agency",
    "description": "A database of clinical trials approved by the Belgian Federal Agency for Medicines and Health Products (FAMHP).",
    "citations": [
      {
        "title": "Krumb, E., Lambert, C., & Hermans, C. (2021). Patient selection for hemophilia gene therapy: Real-life data from a single center. Research and practice in thrombosis and haemostasis, 5(3), 390-394.",
        "link": "https://doi.org/10.1002/rth2.12494"
      }
    ]
  },
  {
    "id": "e9r0s1t2-u3v4-w5x6-y7z8-a9b0c1d2e3f4",
    "slug": "german-clinical-trials-register",
    "title": "German Clinical Trials Register (DRKS)",
    "organization": "DRKS",
    "link": "https://drks.de/",
    "dataTypes": [
      "Clinical trials"
    ],
    "countries": [
      "Germany"
    ],
    "countryCodes": [
      "DE"
    ],
    "compensationType": "mixed",
    "resourceType": "registry",
    "entityCategory": "Academic",
    "entitySubType": "Academic",
    "description": "The primary register for clinical trials conducted in Germany, providing public access to study information."
  },
  {
    "id": "f0s1t2u3-v4w5-x6y7-z8a9-b0c1d2e3f4g5",
    "slug": "health-canada-clinical-trials-database",
    "title": "Health Canada's Clinical Trials Database",
    "link": "https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/health-canada-clinical-trials-database.html",
    "organization": "Health Canada",
    "dataTypes": [
      "Clinical trials"
    ],
    "countries": [
      "Canada"
    ],
    "countryCodes": [
      "CA"
    ],
    "compensationType": "mixed",
    "resourceType": "database",
    "entityCategory": "Government",
    "entitySubType": "Regulatory Agency",
    "description": "A listing of specific information relating to phase I, II, and III clinical trials in patients authorized by Health Canada."
  },
  {
    "id": "a1t2u3v4-w5x6-y7z8-a9b0-c1d2e3f4g5h6",
    "slug": "aatb-accredited-bank-search",
    "title": "AATB Accredited Bank Search",
    "organization": "American Association of Tissue Banks (AATB)",
    "link": "https://www.aatb.org/accredited-bank-search",
    "dataTypes": [
      "Tissue",
      "Body",
      "Organ",
      "Placenta",
      "Eggs",
      "Sperm",
      "Embryos"
    ],
    "countries": [
      "United States"
    ],
    "countryCodes": [
      "US"
    ],
    "compensationType": "mixed",
    "resourceType": "Directory",
    "entityCategory": "Non-Profit",
    "entitySubType": "Professional Association",
    "description": "A search tool to find AATB-accredited tissue banks in the United States, covering various types of tissue, organ, and birth tissue donation."
  },
  {
    "id": "b2u3v4w5-x6y7-z8a9-b0c1-d2e3f4g5h6i7",
    "slug": "organdonor-gov",
    "title": "OrganDonor.gov",
    "organization": "U.S. Department of Health & Human Services",
    "link": "https://www.organdonor.gov/sign-up",
    "dataTypes": [
      "Organ",
      "Tissue"
    ],
    "countries": [
      "United States"
    ],
    "countryCodes": [
      "US"
    ],
    "compensationType": "donation",
    "resourceType": "Donation Portal",
    "entityCategory": "Government",
    "entitySubType": "Public Health Service",
    "description": "The official U.S. government website for organ, eye, and tissue donation. Provides information and links to state registries to sign up as a donor."
  },
  {
    "id": "c3v4w5x6-y7z8-a9b0-c1d2-e3f4g5h6i7j8",
    "slug": "bloodworks-research",
    "title": "Research Donations",
    "organization": "Bloodworks Northwest",
    "link": "https://bloodworksnw.org/donate/research",
    "dataTypes": [
      "Blood",
      "Plasma",
      "Stem cells"
    ],
    "countries": [
      "United States"
    ],
    "countryCodes": [
      "US"
    ],
    "compensationType": "donation",
    "entityCategory": "Non-Profit",
    "entitySubType": "Non-Profit Organization",
    "description": "Bloodworks Northwest’s research program accepts blood donations to support a variety of studies, from developing new treatments to understanding blood-related diseases. This service is available in the Pacific Northwest.",
    "citations": [
      {
        "title": "Miller, M. J., Skrzekut, A., Kracalik, I., Jones, J. M., Lofy, K. H., Konkle, B. A., ... & Paranjape, S. (2021). How do I… facilitate a rapid response to a public health emergency requiring plasma collection with a public–private partnership?. Transfusion, 61(10), 2814-2824.",
        "link": "https://doi.org/10.1111/trf.16630"
      }
    ]
  }
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
const allCitations = rawResources.flatMap(r => r.citations || []);
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
