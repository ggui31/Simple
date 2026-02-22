import { frenchPhonetic, calculateSimilarity } from './phonetics.js';
import { parseSpokenNumber, numberToFrench } from './numberUtils.js';

const DEBUG = false;

/**
 * Normalise un texte pour la comparaison vocale :
 * minuscules, suppression des accents et caractères spéciaux.
 * (Maintenu pour compatibilité, mais la logique phonétique est préférée)
 */
export const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
};

/**
 * Vérifie si le texte parlé correspond à un choix donné en utilisant la phonétique.
 * @param {string} spoken - Le texte prononcé par l'utilisateur.
 * @param {string} target - Le texte cible (la phrase complète).
 * @param {string} keyword - Le mot-clé (pour le mode simplifié).
 * @param {boolean} isSimplified - Si vrai, on compare surtout le mot-clé.
 * @param {number} threshold - Seuil de similarité (0-100). Défaut 75.
 */
export const isMatch = (spoken, target, keyword, isSimplified, threshold = 75) => {
  if (!spoken) return false;

  const pSpoken = frenchPhonetic(spoken);
  const pTarget = frenchPhonetic(target);
  const pKeyword = keyword ? frenchPhonetic(keyword) : null;

  // Mode Simplifié (Mot-clé)
  if (isSimplified && pKeyword) {
    const isKeywordIncluded = pSpoken.includes(pKeyword);
    const keywordSimilarity = calculateSimilarity(pSpoken, pKeyword);
    const isMatched = isKeywordIncluded || keywordSimilarity >= threshold;

    if (DEBUG) {
      console.groupCollapsed(`🎤 Analyse Vocale (Simplifiée) : "${keyword}"`);
      console.log(`🗣️ Entendu : "${spoken}"`);
      console.log(`🔑 Mot-clé : "${keyword}"`);
      console.log(`🔊 Phonèmes Entendus : /${pSpoken}/`);
      console.log(`🔊 Phonèmes Mot-clé : /${pKeyword}/`);
      console.log(`📊 Similarité Mot-clé : ${keywordSimilarity.toFixed(1)}%`);
      console.log(`🧩 Inclus : ${isKeywordIncluded ? "Oui" : "Non"}`);
      console.log(`✅ Résultat : ${isMatched ? "MATCH" : "NO MATCH"}`);
      console.groupEnd();
    }

    return isMatched;
  }

  // Mode Normal (Phrase complète)

  // 1. Calcul de similarité globale
  const similarity = calculateSimilarity(pSpoken, pTarget);

  // 2. Fallback : Inclusion stricte (si la cible est contenue phonétiquement dans le discours)
  // Utile si l'utilisateur dit une phrase plus longue contenant la cible exacte
  const isIncluded = pTarget.length > 3 && pSpoken.includes(pTarget);

  const isMatched = similarity >= threshold || isIncluded;

  if (DEBUG) {
    console.groupCollapsed(`🎤 Analyse Vocale : "${target}"`);
    console.log(`🗣️ Entendu : "${spoken}"`);
    console.log(`🎯 Attendu : "${target}"`);
    console.log(`🔊 Phonèmes Entendus : /${pSpoken}/`);
    console.log(`🔊 Phonèmes Attendus : /${pTarget}/`);
    console.log(`📊 Similarité : ${similarity.toFixed(1)}% (Seuil: ${threshold}%)`);
    console.log(`🧩 Inclus : ${isIncluded ? "Oui" : "Non"}`);
    console.log(`✅ Résultat : ${isMatched ? "MATCH" : "NO MATCH"}`);
    console.groupEnd();
  }

  return isMatched;
};

/**
 * Vérifie si le nombre prononcé correspond au nombre attendu.
 * Gère les variations : "vingt-trois", "vingt trois", "23", "le nombre vingt-trois"
 * @param {string} spoken - Le texte prononcé par l'utilisateur
 * @param {number} expectedNumber - Le nombre attendu
 * @param {number} threshold - Seuil de similarité phonétique (0-100). Défaut 75.
 * @returns {boolean} True si le nombre correspond
 */
export const isNumberMatch = (spoken, expectedNumber, threshold = 75) => {
  if (!spoken || expectedNumber === null || expectedNumber === undefined) {
    return false;
  }

  // Parse le nombre prononcé
  const parsedNumber = parseSpokenNumber(spoken);
  
  // Égalité stricte si le parsing réussit
  if (parsedNumber === expectedNumber) {
    if (DEBUG) {
      console.groupCollapsed(`🔢 Analyse Nombre : ${expectedNumber}`);
      console.log(`🗣️ Entendu : "${spoken}"`);
      console.log(`🎯 Attendu : ${expectedNumber} (${numberToFrench(expectedNumber)})`);
      console.log(`✅ Nombre parsé : ${parsedNumber}`);
      console.log(`✅ Résultat : MATCH EXACT`);
      console.groupEnd();
    }
    return true;
  }

  // Fallback: Comparaison phonétique si le parsing échoue
  // Utile pour les variations de prononciation
  const pSpoken = frenchPhonetic(spoken);
  const expectedFrench = numberToFrench(expectedNumber);
  const pExpected = frenchPhonetic(expectedFrench);
  
  // Aussi essayer avec variantes (avec/sans tirets)
  const expectedVariants = [
    expectedFrench,
    expectedFrench.replace(/-/g, ' '),
    expectedNumber.toString()
  ];
  
  for (const variant of expectedVariants) {
    const pVariant = frenchPhonetic(variant);
    const similarity = calculateSimilarity(pSpoken, pVariant);
    const isIncluded = pSpoken.includes(pVariant);
    
    if (similarity >= threshold || isIncluded) {
      if (DEBUG) {
        console.groupCollapsed(`🔢 Analyse Nombre (Phonétique) : ${expectedNumber}`);
        console.log(`🗣️ Entendu : "${spoken}"`);
        console.log(`🎯 Attendu : ${expectedNumber} (${expectedFrench})`);
        console.log(`🔊 Phonèmes Entendus : /${pSpoken}/`);
        console.log(`🔊 Phonèmes Attendus : /${pVariant}/`);
        console.log(`📊 Similarité : ${similarity.toFixed(1)}%`);
        console.log(`✅ Résultat : MATCH PHONÉTIQUE`);
        console.groupEnd();
      }
      return true;
    }
  }

  if (DEBUG) {
    console.groupCollapsed(`🔢 Analyse Nombre : ${expectedNumber}`);
    console.log(`🗣️ Entendu : "${spoken}"`);
    console.log(`🎯 Attendu : ${expectedNumber} (${expectedFrench})`);
    console.log(`❌ Nombre parsé : ${parsedNumber}`);
    console.log(`🔊 Phonèmes Entendus : /${pSpoken}/`);
    console.log(`🔊 Phonèmes Attendus : /${pExpected}/`);
    console.log(`❌ Résultat : NO MATCH`);
    console.groupEnd();
  }

  return false;
};
