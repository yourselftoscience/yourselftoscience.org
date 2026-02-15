import { resources } from './src/data/resources.js';
import { EU_COUNTRIES } from './src/data/constants.js';

const resourcesByCountry = resources.reduce((acc, resource) => {
    if (resource.countries && resource.countries.length > 0) {
        for (const country of resource.countries) {
            const countryName = country === 'European Union' || EU_COUNTRIES.includes(country) ? 'European Union' : country;
            acc[countryName] = (acc[countryName] || 0) + 1;
        }
    } else {
        acc['Worldwide'] = (acc['Worldwide'] || 0) + 1;
    }
    return acc;
}, {});

console.log('Total distinct countries:', Object.keys(resourcesByCountry).length);
// Sort and print all entries
const sortedCountries = Object.entries(resourcesByCountry).sort(([, a], [, b]) => b - a);
sortedCountries.forEach(([country, count]) => {
    console.log(`${country}: ${count}`);
});
