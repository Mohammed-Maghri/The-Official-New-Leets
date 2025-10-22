// Quick moderation test
const fs = require('fs');
const path = require('path');

// Read bad words JSON
const badWordsPath = path.join(__dirname, '../bad_words.json');
const badWordsData = JSON.parse(fs.readFileSync(badWordsPath, 'utf-8'));

// Normalize text for detection
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[.\-_\s]+/g, '')
    .replace(/[0@]/g, 'o')
    .replace(/[1!]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/\*/g, '');
}

// Check if text contains a bad word
function containsBadWord(text, badWord) {
  const normalizedText = normalizeText(text);
  const normalizedBadWord = normalizeText(badWord);
  
  if (normalizedText.includes(normalizedBadWord)) {
    return true;
  }
  
  const wordBoundaryRegex = new RegExp(`\\b${normalizedBadWord}\\b`, 'i');
  if (wordBoundaryRegex.test(normalizedText)) {
    return true;
  }
  
  return false;
}

// Test messages
const testMessages = [
  "fuck you",
  "f*ck",
  "sh1t",
  "hello world",
  "9ahba",
  "mo king",
  "mok",
];

console.log("🧪 Testing Moderation Detection\n");

testMessages.forEach(msg => {
  console.log(`Message: "${msg}"`);
  
  let detected = false;
  let matchedWords = [];
  
  // Check profanity
  for (const word of badWordsData.profanity) {
    if (containsBadWord(msg, word)) {
      detected = true;
      matchedWords.push(word);
    }
  }
  
  // Check darija_franco
  for (const word of badWordsData.darija_franco) {
    if (containsBadWord(msg, word)) {
      detected = true;
      matchedWords.push(word);
    }
  }
  
  // Check darija_arabic
  for (const word of badWordsData.darija_arabic) {
    if (containsBadWord(msg, word)) {
      detected = true;
      matchedWords.push(word);
    }
  }
  
  if (detected) {
    console.log(`✅ DETECTED: ${matchedWords.join(', ')}`);
  } else {
    console.log(`❌ NOT DETECTED`);
  }
  console.log('');
});
