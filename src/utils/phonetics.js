/**
 * Convertit un texte en une représentation phonétique simplifiée pour le français.
 * @param {string} text - Le texte à convertir.
 * @returns {string} - La représentation phonétique.
 */
export function frenchPhonetic(text) {
  if (!text) return "";
  let s = text.toLowerCase();

  // 0. Remplacements spécifiques avant normalisation
  s = s.replace(/ç/g, "s");

  // 1. Normalisation des accents et caractères spéciaux
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 2. Garder uniquement les lettres
  s = s.replace(/[^a-z]/g, "");

  // 3. Remplacements phonétiques majeurs
  // Digraphes et trigraphes
  s = s.replace(/ph/g, "f");
  s = s.replace(/ch/g, "S"); // Son "ch"
  s = s.replace(/sh/g, "S");
  s = s.replace(/qu/g, "k");

  // Voyelles composées
  s = s.replace(/(eau|au)/g, "o");
  s = s.replace(/ou/g, "u"); // Son "ou"
  s = s.replace(/(ai|ei|eu)/g, "e"); // Son "é/è" approximatif

  // Nasales (simplification)
  s = s.replace(/(an|en|am|em)/g, "A"); // Son "an"
  s = s.replace(/(in|ain|ein|im|aim)/g, "I"); // Son "in"
  s = s.replace(/(on|om)/g, "O"); // Son "on"
  s = s.replace(/(un|um)/g, "U"); // Son "un"

  // Consonnes contextuelles
  s = s.replace(/gn/g, "N"); // Son "gn"

  // C dur/doux
  s = s.replace(/c(?=[eiy])/g, "s");
  s = s.replace(/c/g, "k");

  // G dur/doux
  s = s.replace(/g(?=[eiy])/g, "j");
  s = s.replace(/gu(?=[eiy])/g, "g"); // "guerre" -> "gerr"

  // S entre voyelles (souvent z, mais on simplifie en s pour la robustesse)
  // s = s.replace(/s/g, "s");

  // X -> ks ou gz (simplifié en s ou z selon contexte, souvent ks)
  s = s.replace(/x/g, "ks");

  // H muet
  s = s.replace(/h/g, "");

  // 4. Simplification des doubles lettres
  s = s.replace(/(.)\1+/g, "$1");

  // 5. Gestion des finales muettes (Approximation courante)

  // Gestion des terminaisons en "er" et "ez" (son "é") pour les mots de plus de 3 lettres
  if (s.length > 3 && (s.endsWith("er") || s.endsWith("ez"))) {
      s = s.slice(0, -1); // Remplace "er"/"ez" par "e" (phonétiquement proche de é)
  }

  // On supprime e, s, t, d, z à la fin
  // Attention: "mer" (r prononcé), "sel" (l prononcé), "sac" (c prononcé)
  // "parler" (r muet -> é), "tapis" (s muet)
  // C'est la partie la plus dure. Pour l'instant, on laisse tel quel sauf e muet final strict.
  // "autel" -> "otel"
  // "hôtel" -> "otel"
  // Le "l" final est prononcé.

  // Supprimer e final s'il n'est pas la seule lettre (ex: "le")
  if (s.length > 1 && s.endsWith("e")) {
      s = s.slice(0, -1);
  }

  return s;
}

/**
 * Calcule la distance de Levenshtein entre deux chaînes.
 * @param {string} a
 * @param {string} b
 * @returns {number} Distance d'édition
 */
export function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calcule le pourcentage de similarité entre deux chaînes.
 * @param {string} a
 * @param {string} b
 * @returns {number} Pourcentage (0-100)
 */
export function calculateSimilarity(a, b) {
  const dist = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 100;
  return ((maxLength - dist) / maxLength) * 100;
}
