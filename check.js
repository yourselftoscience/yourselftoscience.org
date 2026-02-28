import { activeResources } from './src/data/resources.js';
const genSources = activeResources.filter(r => r.dataTypes && r.dataTypes.some(t => t.includes('Genome') || t.includes('DNA') || t.includes('Genetic')));
const noSources = genSources.filter(r => !r.compatibleSources || r.compatibleSources.length === 0);
console.log(noSources.map(r => r.title));
