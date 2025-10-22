// Debug word splitting
const fs = require('fs');
const path = require('path');

const badWordsPath = path.join(__dirname, '../bad_words.json');
const badWordsData = JSON.parse(fs.readFileSync(badWordsPath, 'utf-8'));

function normalizeWord(word) {
  return word
    .toLowerCase()
    .replace(/[.\-_]+/g, '')
    .replace(/[0@]/g, 'o')
    .replace(/[1!]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/\*/g, '');
}

function containsBadWord(text, badWord) {
  // If the bad word contains spaces, it's a phrase
  if (badWord.includes(' ')) {
    const normalizedText = text.toLowerCase().replace(/[.\-_]+/g, '');
    const normalizedBadWord = badWord.toLowerCase().replace(/[.\-_]+/g, '');
    return normalizedText.includes(normalizedBadWord);
  }

  // For single words: check each word in the text individually
  const words = text.split(/\s+/);
  const normalizedBadWord = normalizeWord(badWord);
  
  console.log(`  Checking "${badWord}" (normalized: "${normalizedBadWord}")`);
  console.log(`  Text words: [${words.map(w => `"${w}" (norm: "${normalizeWord(w)}")`).join(', ')}]`);
  
  for (const word of words) {
    const normalizedWord = normalizeWord(word);
    
    // Exact match
    if (normalizedWord === normalizedBadWord) {
      console.log(`  ✅ MATCH: "${normalizedWord}" === "${normalizedBadWord}"`);
      return true;
    }
    
    // Substring match for long words
    if (normalizedBadWord.length >= 4 && normalizedWord.includes(normalizedBadWord)) {
      console.log(`  ✅ MATCH: "${normalizedWord}" contains "${normalizedBadWord}"`);
      return true;
    }
  }
  
  console.log(`  ❌ NO MATCH`);
  return false;
}

console.log('Testing "mo king" against "mok":\n');
const result = containsBadWord("mo king", "mok");
console.log(`\nFinal result: ${result}`);
