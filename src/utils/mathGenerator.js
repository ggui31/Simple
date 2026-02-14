/**
 * Math problem generator with configurable difficulty levels
 */

import { numberToFrench } from './numberUtils';

/**
 * Difficulty level configurations
 * Each level defines min/max ranges for operands
 */
const DIFFICULTY_CONFIG = {
  addition: {
    facile: { min: 1, max: 10 },
    moyen: { min: 5, max: 20 },
    difficile: { min: 10, max: 50 }
  },
  soustraction: {
    facile: { min: 1, max: 10, resultMin: 0 },
    moyen: { min: 5, max: 20, resultMin: 0 },
    difficile: { min: 10, max: 50, resultMin: 0 }
  }
};

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a single addition problem
 * @param {object} config - Difficulty configuration
 * @returns {object} Problem with question, answer, display
 */
function generateAddition(config) {
  const a = randomInt(config.min, config.max);
  const b = randomInt(config.min, config.max);
  const answer = a + b;
  
  return {
    operand1: a,
    operand2: b,
    operation: 'addition',
    answer,
    question: `${a} + ${b}`,
    displayQuestion: `Combien font ${numberToFrench(a)} plus ${numberToFrench(b)} ?`,
    spokenQuestion: `Combien font ${numberToFrench(a)} plus ${numberToFrench(b)} ?`
  };
}

/**
 * Generate a single subtraction problem
 * Ensures result is always >= resultMin (no negative numbers for young children)
 * @param {object} config - Difficulty configuration
 * @returns {object} Problem with question, answer, display
 */
function generateSubtraction(config) {
  let a, b, answer;
  
  // Ensure non-negative result
  do {
    a = randomInt(config.min, config.max);
    b = randomInt(config.min, config.max);
    answer = a - b;
  } while (answer < config.resultMin);
  
  return {
    operand1: a,
    operand2: b,
    operation: 'soustraction',
    answer,
    question: `${a} - ${b}`,
    displayQuestion: `Combien font ${numberToFrench(a)} moins ${numberToFrench(b)} ?`,
    spokenQuestion: `Combien font ${numberToFrench(a)} moins ${numberToFrench(b)} ?`
  };
}

/**
 * Generate a single math problem
 * @param {string} operation - 'addition' or 'soustraction'
 * @param {string} level - 'facile', 'moyen', or 'difficile'
 * @returns {object} Problem object
 */
export function generateProblem(operation, level) {
  const config = DIFFICULTY_CONFIG[operation]?.[level];
  
  if (!config) {
    throw new Error(`Invalid operation "${operation}" or level "${level}"`);
  }
  
  if (operation === 'addition') {
    return generateAddition(config);
  } else if (operation === 'soustraction') {
    return generateSubtraction(config);
  }
  
  throw new Error(`Unsupported operation: ${operation}`);
}

/**
 * Generate a session of multiple problems
 * @param {string} operation - 'addition' or 'soustraction'
 * @param {string} level - 'facile', 'moyen', or 'difficile'
 * @param {number} count - Number of problems to generate (default: 10)
 * @returns {array} Array of problem objects
 */
export function generateSession(operation, level, count = 10) {
  const problems = [];
  
  for (let i = 0; i < count; i++) {
    problems.push({
      ...generateProblem(operation, level),
      id: i + 1
    });
  }
  
  return problems;
}

/**
 * Get display name for operation
 * @param {string} operation - Operation key
 * @returns {string} Display name in French
 */
export function getOperationDisplayName(operation) {
  const names = {
    addition: 'Addition',
    soustraction: 'Soustraction',
    multiplication: 'Multiplication',
    division: 'Division'
  };
  
  return names[operation] || operation;
}

/**
 * Get display name for difficulty level
 * @param {string} level - Level key
 * @returns {string} Display name in French
 */
export function getLevelDisplayName(level) {
  const names = {
    facile: 'Facile',
    moyen: 'Moyen',
    difficile: 'Difficile'
  };
  
  return names[level] || level;
}

/**
 * Get emoji for operation
 * @param {string} operation - Operation key
 * @returns {string} Emoji representing the operation
 */
export function getOperationEmoji(operation) {
  const emojis = {
    addition: '➕',
    soustraction: '➖',
    multiplication: '✖️',
    division: '➗'
  };
  
  return emojis[operation] || '🔢';
}
