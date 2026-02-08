/**
 * Normalise un texte pour la comparaison vocale :
 * minuscules, suppression des accents et caractères spéciaux.
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
 * Vérifie si le texte parlé correspond à un choix donné.
 * En mode simplifié, seul le mot-clé est comparé.
 * En mode normal, un ratio de mots communs >= 75% est requis.
 */
export const isMatch = (spoken, target, keyword, isSimplified) => {
  const normSpoken = normalizeText(spoken);
  const normTarget = normalizeText(target);
  const normKeyword = keyword ? normalizeText(keyword) : null;

  if (isSimplified && normKeyword) {
    return normSpoken.includes(normKeyword);
  }

  if (normTarget.length < 10) {
    return normSpoken.includes(normTarget);
  }

  const spokenWords = normSpoken.split(/\s+/).filter(w => w.length > 2);
  const targetWords = normTarget.split(/\s+/).filter(w => w.length > 2);

  if (targetWords.length === 0) return false;

  let matchCount = 0;
  targetWords.forEach(word => {
    if (spokenWords.includes(word)) matchCount++;
  });

  return (matchCount / targetWords.length) >= 0.75;
};
