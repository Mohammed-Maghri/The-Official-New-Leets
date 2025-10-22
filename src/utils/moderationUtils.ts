import badWordsData from '../../bad_words.json';

interface ModerationResult {
  blocked: boolean;
  categories?: string[];
  matched_terms?: string[];
  severity?: 'low' | 'medium' | 'high';
}

interface BadWordsDataset {
  profanity: string[];
  sexual: string[];
  arabic: string[];
  darija_franco: string[];
  hate_speech: string[];
  phrases: string[];
  religious_insults: string[];
  emoji_insults: string[];
}

const badWords = badWordsData as BadWordsDataset;

// Normalize a single word for detection (handle leet speak and obfuscation)
function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[.\-_]+/g, '') // Remove dots, dashes, underscores WITHIN a word
    .replace(/[0@]/g, 'o')
    .replace(/[1!]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/\*/g, ''); // Remove asterisks
}

// Check if text contains a bad word/phrase with fuzzy matching
function containsBadWord(text: string, badWord: string): boolean {
  // Check original text for exact emoji matches first
  if (badWord.match(/[\u{1F300}-\u{1F9FF}]/u)) {
    return text.includes(badWord);
  }

  // If the bad word contains spaces, it's a phrase - check the whole text
  if (badWord.includes(' ')) {
    const normalizedText = text.toLowerCase().replace(/[.\-_]+/g, '');
    const normalizedBadWord = badWord.toLowerCase().replace(/[.\-_]+/g, '');
    return normalizedText.includes(normalizedBadWord);
  }

  // For single words: check each word in the text individually
  const words = text.split(/\s+/); // Split by spaces
  const normalizedBadWord = normalizeWord(badWord);
  
  for (const word of words) {
    const normalizedWord = normalizeWord(word);
    
    // Exact match after normalization (always check this)
    if (normalizedWord === normalizedBadWord) {
      return true;
    }
    
    // For longer bad words (4+ chars), allow substring matching
    // This catches "fuckhead", "shitty", etc. but avoids "mo king" matching "mok"
    if (normalizedBadWord.length >= 4 && normalizedWord.includes(normalizedBadWord)) {
      return true;
    }
  }
  
  return false;
}

// Check for phrase matches (multi-word patterns)
function checkPhrases(text: string, phrases: string[]): string[] {
  const matched: string[] = [];
  const normalizedText = text.toLowerCase().replace(/[.\-_]+/g, '');
  
  for (const phrase of phrases) {
    const normalizedPhrase = phrase.toLowerCase().replace(/[.\-_]+/g, '');
    if (normalizedText.includes(normalizedPhrase)) {
      matched.push(phrase);
    }
  }
  
  return matched;
}

// Main moderation function
export function moderateMessage(message: string): ModerationResult {
  if (!message || message.trim().length === 0) {
    return { blocked: false };
  }

  const categories: string[] = [];
  const matchedTerms: string[] = [];
  
  // Check each category
  Object.entries(badWords).forEach(([category, words]) => {
    const categoryMatches: string[] = [];
    
    if (category === 'phrases') {
      // Special handling for multi-word phrases
      const phraseMatches = checkPhrases(message, words);
      if (phraseMatches.length > 0) {
        categoryMatches.push(...phraseMatches);
      }
    } else {
      // Regular word checking
      for (const word of words) {
        if (containsBadWord(message, word)) {
          categoryMatches.push(word);
        }
      }
    }
    
    if (categoryMatches.length > 0) {
      categories.push(category);
      matchedTerms.push(...categoryMatches);
    }
  });

  // Determine severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (categories.includes('hate_speech') || categories.includes('phrases')) {
    severity = 'high';
  } else if (categories.includes('sexual') || categories.includes('religious_insults')) {
    severity = 'medium';
  }

  if (categories.length > 0) {
    return {
      blocked: true,
      categories: [...new Set(categories)], // Remove duplicates
      matched_terms: [...new Set(matchedTerms)], // Remove duplicates
      severity
    };
  }

  return { blocked: false };
}

// Sanitize message for frontend display (replace with asterisks)
export function sanitizeMessage(message: string, moderationResult: ModerationResult): string {
  if (!moderationResult.blocked || !moderationResult.matched_terms) {
    return message;
  }

  let sanitized = message;
  
  for (const term of moderationResult.matched_terms) {
    const regex = new RegExp(term.split('').join('[\\s\\-._*]*'), 'gi');
    sanitized = sanitized.replace(regex, (match) => '*'.repeat(Math.max(3, match.length)));
  }
  
  return sanitized;
}

// Store flagged message for audit
export interface FlaggedMessage {
  id: string;
  message: string;
  username: string;
  timestamp: number;
  blocked: boolean;
  categories?: string[];
  matched_terms?: string[];
  severity?: 'low' | 'medium' | 'high';
}
