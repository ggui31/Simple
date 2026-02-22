/**
 * Utilities for converting numbers to French words and parsing spoken numbers
 */

const UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const TEENS = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

const DEBUG = false;

/**
 * Converts a number (0-100) to French words
 * @param {number} n - Number to convert
 * @returns {string} French word representation
 */
export function numberToFrench(n) {
  if (n < 0 || n > 100) {
    throw new Error('Number must be between 0 and 100');
  }

  if (n < 10) {
    return UNITS[n];
  }

  if (n >= 10 && n < 20) {
    return TEENS[n - 10];
  }

  if (n >= 20 && n < 70) {
    const tens = Math.floor(n / 10);
    const units = n % 10;
    
    if (units === 0) {
      return TENS[tens];
    }
    
    // Special case: "et un" for 21, 31, 41, 51, 61
    if (units === 1 && tens !== 8) {
      return `${TENS[tens]} et un`;
    }
    
    return `${TENS[tens]}-${UNITS[units]}`;
  }

  if (n >= 70 && n < 80) {
    // 70-79: soixante-dix, soixante et onze, soixante-douze...
    const units = n - 60;
    if (units === 10) return 'soixante-dix';
    if (units === 11) return 'soixante et onze';
    return `soixante-${TEENS[units - 10]}`;
  }

  if (n === 80) {
    return 'quatre-vingts';
  }

  if (n > 80 && n < 90) {
    // 81-89: quatre-vingt-un, quatre-vingt-deux...
    const units = n - 80;
    if (units === 1) {
      return 'quatre-vingt-un';
    }
    return `quatre-vingt-${UNITS[units]}`;
  }

  if (n >= 90 && n <= 99) {
    // 90-99: quatre-vingt-dix, quatre-vingt-onze...
    const units = n - 80;
    if (units === 10) return 'quatre-vingt-dix';
    if (units === 11) return 'quatre-vingt-onze';
    return `quatre-vingt-${TEENS[units - 10]}`;
  }

  if (n === 100) {
    return 'cent';
  }

  return n.toString();
}

/**
 * Parse spoken French text to extract a number
 * Handles variations: "vingt-trois", "vingt trois", "23", "le nombre vingt-trois"
 * @param {string} text - Spoken text
 * @returns {number|null} Parsed number or null if not found
 */
export function parseSpokenNumber(text) {
  if (!text) return null;
  
  if (DEBUG) console.log('🔍 Parsing spoken text:', text);
  
  // Normalize text: lowercase, trim
  const normalized = text.toLowerCase().trim();
  
  // Try direct numeric match first (e.g., "23", "5")
  const directNumber = parseInt(normalized, 10);
  if (!isNaN(directNumber) && directNumber >= 0 && directNumber <= 100) {
    if (DEBUG) console.log('✅ Direct number match:', directNumber);
    return directNumber;
  }
  
  // Remove common prefixes and suffixes
  let cleaned = normalized
    .replace(/^(le nombre|la réponse est|c'est|ça fait)\s*/i, '')
    .replace(/\s*(c'est ça|voilà|merci)$/i, '')
    .trim();
  
  if (DEBUG) console.log('🧹 Cleaned text:', cleaned);
  
  // Normalize hyphens and spaces for comparison
  const normalizedCleaned = cleaned.replace(/[\s\-]+/g, ' ').trim();
  
  // Try to match against all French number words (0-100)
  for (let i = 0; i <= 100; i++) {
    const frenchWord = numberToFrench(i);
    
    // Create variations: with/without hyphens, with/without spaces
    const variations = [
      frenchWord,
      frenchWord.replace(/-/g, ' '),
      frenchWord.replace(/\s+/g, ''),
      frenchWord.replace(/-/g, ''),
      frenchWord.replace(/\s+/g, '-')
    ];
    
    // Check if cleaned text matches any variation (exact match or contains)
    for (const variation of variations) {
      const normalizedVariation = variation.replace(/[\s\-]+/g, ' ').trim();
      
      if (normalizedCleaned === normalizedVariation) {
        if (DEBUG) console.log(`✅ Exact match found: ${i} (${frenchWord})`);
        return i;
      }
      
      // Also check if the variation is contained in the cleaned text
      if (normalizedCleaned.includes(normalizedVariation) && normalizedVariation.length > 2) {
        if (DEBUG) console.log(`✅ Partial match found: ${i} (${frenchWord})`);
        return i;
      }
    }
  }
  
  // Special handling for complex numbers with phonetic variations
  // Handle "quatre-vingt" vs "quatre vingt" etc.
  const numberPatterns = [
    // 70-79
    { pattern: /soixante[\s\-]*(dix|et[\s\-]*onze|douze|treize|quatorze|quinze|seize|dix[\s\-]*sept|dix[\s\-]*huit|dix[\s\-]*neuf)/i, base: 60 },
    // 80-99
    { pattern: /quatre[\s\-]*vingt[\s\-]*(dix|onze|douze|treize|quatorze|quinze|seize|dix[\s\-]*sept|dix[\s\-]*huit|dix[\s\-]*neuf)/i, base: 80 },
    { pattern: /quatre[\s\-]*vingts?$/i, value: 80 },
    { pattern: /quatre[\s\-]*vingt[\s\-]*(un|deux|trois|quatre|cinq|six|sept|huit|neuf)/i, base: 80 },
  ];
  
  for (const { pattern, base, value } of numberPatterns) {
    const match = cleaned.match(pattern);
    if (match) {
      if (value !== undefined) return value;
      
      const suffix = match[1].replace(/[\s\-]+/g, '');
      
      // Map suffix to number
      if (suffix.includes('onze')) return base + 11;
      if (suffix.includes('douze')) return base + 12;
      if (suffix.includes('treize')) return base + 13;
      if (suffix.includes('quatorze')) return base + 14;
      if (suffix.includes('quinze')) return base + 15;
      if (suffix.includes('seize')) return base + 16;
      if (suffix.includes('dixsept')) return base + 17;
      if (suffix.includes('dixhuit')) return base + 18;
      if (suffix.includes('dixneuf')) return base + 19;
      if (suffix.includes('dix')) return base + 10;
      
      const unitWords = ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
      for (let i = 0; i < unitWords.length; i++) {
        if (suffix.includes(unitWords[i])) {
          return base + i + 1;
        }
      }
    }
  }
  
  if (DEBUG) console.log('❌ No match found for:', text);
  return null;
}

/**
 * Get all possible variations of a number's French representation
 * Useful for voice recognition matching
 * @param {number} n - Number to get variations for
 * @returns {string[]} Array of possible spoken variations
 */
export function getNumberVariations(n) {
  const base = numberToFrench(n);
  const variations = [
    n.toString(),
    base,
    base.replace(/-/g, ' '),
    base.replace(/\s+/g, '-'),
    `le nombre ${base}`,
    `c'est ${base}`,
    `la réponse est ${base}`,
  ];
  
  return [...new Set(variations)]; // Remove duplicates
}
