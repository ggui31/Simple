import { frenchPhonetic, calculateSimilarity } from './phonetics.js';

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
    // Si le mot-clé phonétique est contenu dans la phrase parlée
    if (pSpoken.includes(pKeyword)) return true;

    // Ou si la similarité avec le mot-clé est suffisante (ex: mot mal prononcé seul)
    if (calculateSimilarity(pSpoken, pKeyword) >= threshold) return true;

    return false;
  }

  // Mode Normal (Phrase complète)

  // 1. Calcul de similarité globale
  const similarity = calculateSimilarity(pSpoken, pTarget);
  if (similarity >= threshold) return true;

  // 2. Fallback : Inclusion stricte (si la cible est contenue phonétiquement dans le discours)
  // Utile si l'utilisateur dit une phrase plus longue contenant la cible exacte
  if (pTarget.length > 3 && pSpoken.includes(pTarget)) return true;

  return false;
};
