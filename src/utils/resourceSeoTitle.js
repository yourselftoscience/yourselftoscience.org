// Concise editorial labels for long names; full names remain in headings and data.
const shortTitles = {
  'lifeblood-microbiome': 'Lifeblood Microbiome Donation',
  'wroclaw-hair-decomposition': 'Wrocław Hair Decomposition Research',
  'ucsf-social-media-archive': 'UCSF Social Media Archive',
  'conversational-ai-data-donation': 'Max Planck Conversational AI Data Donation'
};

export function resourceSeoTitle(resource) {
  return shortTitles[resource.slug] || resource.wikidataLabel || resource.title;
}
