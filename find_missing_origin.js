import { resources } from './src/data/resources.js';

console.log('Resources missing "origin" field:');
const missingOrigin = resources.filter(r => !r.origin);

missingOrigin.forEach(r => {
    console.log(`- ${r.title}`);
});

if (missingOrigin.length === 0) {
    console.log('No resources found missing "origin" field.');
}
