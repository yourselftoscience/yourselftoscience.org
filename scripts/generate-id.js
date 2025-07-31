import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

async function addResourcePlaceholder() {
  const slug = process.argv[2];

  if (!slug) {
    console.error('Error: Please provide a URL-friendly slug as an argument.');
    console.error('Usage: node scripts/generate-id.js <your-slug-here>');
    process.exit(1);
  }

  const newId = uuidv4();
  const newResource = {
    id: newId,
    slug: slug,
    title: "Your Title Here",
    organization: "Organization Name",
    link: "https://example.com",
    dataTypes: ["Type1", "Type2"],
    countries: [],
    countryCodes: [],
    compensationType: "donation",
    entityCategory: "",
    entitySubType: "",
    description: "A brief description of the resource.",
    citations: []
  };

  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'resources.js');
    
    // Read the existing file content
    let fileContent = await fs.readFile(filePath, 'utf-8');

    // Find the end of the rawResources array
    const arrayEndIndex = fileContent.lastIndexOf('];');
    if (arrayEndIndex === -1) {
      throw new Error("Could not find the closing '];' in resources.js. The file might be malformed.");
    }

    // Find the last closing brace '}' before the array ends to insert a comma
    let lastResourceEndIndex = fileContent.lastIndexOf('}', arrayEndIndex);
    
    // Check if there are already items in the array
    const arrayStartIndex = fileContent.indexOf('[');
    const contentBetweenBrackets = fileContent.substring(arrayStartIndex + 1, arrayEndIndex).trim();
    
    let newEntryString = JSON.stringify(newResource, null, 2);

    let newFileContent;
    if (contentBetweenBrackets.length === 0) {
      // Array is empty, so just add the new object
      newFileContent = 
        fileContent.substring(0, arrayEndIndex) +
        '  ' + newEntryString + '\n' +
        fileContent.substring(arrayEndIndex);
    } else {
      // Array has content, add a comma before the new object
      newFileContent = 
        fileContent.substring(0, lastResourceEndIndex + 1) +
        ',\n' +
        '  ' + newEntryString + '\n' +
        fileContent.substring(arrayEndIndex);
    }

    await fs.writeFile(filePath, newFileContent, 'utf-8');

    console.log(`
      ✅ Successfully added a placeholder for a new resource.
      
      ID:   ${newId}
      Slug: ${slug}
      
      Please open 'src/data/resources.js' and fill in the remaining details for the new entry.
    `);
  } catch (error) {
    console.error('❌ Error adding resource placeholder:', error);
  }
}

addResourcePlaceholder(); 