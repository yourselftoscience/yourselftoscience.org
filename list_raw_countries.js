import { resources } from './src/data/resources.js';

const allCountries = resources.reduce((acc, resource) => {
    if (resource.countries && resource.countries.length > 0) {
        for (const country of resource.countries) {
            acc[country] = (acc[country] || 0) + 1;
        }
    } else {
        acc['Worldwide'] = (acc['Worldwide'] || 0) + 1;
    }
    return acc;
}, {});

console.log('Raw country counts:');
Object.entries(allCountries)
    .sort(([, a], [, b]) => b - a)
    .forEach(([country, count]) => {
        console.log(`${country}: ${count}`);
    });
