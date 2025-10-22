// Script to remove all patterns with asterisks from bad_words.json
const fs = require('fs');
const path = require('path');

const badWordsPath = path.join(__dirname, '../bad_words.json');
const badWordsData = JSON.parse(fs.readFileSync(badWordsPath, 'utf-8'));

let totalRemoved = 0;

// Process each category
Object.keys(badWordsData).forEach(category => {
  const originalLength = badWordsData[category].length;
  
  // Filter out patterns containing asterisks
  badWordsData[category] = badWordsData[category].filter(word => {
    return !word.includes('*');
  });
  
  const removed = originalLength - badWordsData[category].length;
  if (removed > 0) {
    console.log(`${category}: Removed ${removed} patterns with asterisks`);
    totalRemoved += removed;
  }
});

// Write back to file
fs.writeFileSync(badWordsPath, JSON.stringify(badWordsData, null, 2));

console.log(`\n✅ Total removed: ${totalRemoved} patterns`);
console.log('✅ Cleaned bad_words.json saved!');
