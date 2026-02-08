# Format d'Histoire — Guide de Création

Ce document décrit le format JSON utilisé pour créer de nouvelles histoires interactives pour l'application **Aventure Lecture**.

## Structure Générale

Chaque histoire est un fichier `.json` placé dans le dossier `src/stories/`. Le fichier contient deux sections : les **métadonnées** de l'histoire et les **scènes**.

```json
{
  "title": "...",
  "description": "...",
  "coverImage": "...",
  "difficulty": "...",
  "estimatedTime": "...",
  "startScene": "...",
  "scenes": { ... }
}
```

---

## Métadonnées (racine)

| Champ           | Type     | Obligatoire | Description |
|-----------------|----------|:-----------:|-------------|
| `title`         | `string` | ✅ | Titre de l'histoire affiché sur la carte de sélection |
| `description`   | `string` | ✅ | Résumé court (1-2 phrases) affiché sous le titre |
| `coverImage`    | `string` | ✅ | Un emoji représentant l'histoire (ex: `"🐫"`, `"🏴‍☠️"`) |
| `difficulty`    | `string` | ✅ | Niveau de difficulté : `"facile"`, `"moyen"` ou `"difficile"` |
| `estimatedTime` | `string` | ✅ | Durée estimée de lecture (ex: `"5 min"`, `"10 min"`) |
| `startScene`    | `string` | ✅ | L'`id` de la première scène (souvent `"start"`) |

---

## Scènes (`scenes`)

L'objet `scenes` est un dictionnaire où chaque clé est l'**identifiant unique** de la scène. Cet identifiant est utilisé dans les `nextScene` des choix pour naviguer entre les scènes.

### Champs d'une Scène

| Champ       | Type       | Obligatoire | Description |
|-------------|------------|:-----------:|-------------|
| `id`        | `string`   | ✅ | Identifiant unique (doit correspondre à la clé dans `scenes`) |
| `title`     | `string`   | ✅ | Titre affiché en haut de la scène |
| `text`      | `string`   | ✅ | Texte narratif que l'enfant lit / écoute |
| `image`     | `string`   | ✅ | Emoji illustrant la scène (ex: `"🏔️"`, `"🐫"`) |
| `xp`        | `number`   | ✅ | Points d'expérience gagnés en atteignant cette scène |
| `choices`   | `Choice[]` | ✅ | Liste des choix disponibles (minimum 1) |
| `item`      | `string`   | ❌ | Identifiant de l'objet récupéré dans cette scène |
| `itemLabel` | `string`   | ❌ | Nom affiché pour l'objet (obligatoire si `item` est défini) |
| `isEnd`     | `boolean`  | ❌ | `true` si cette scène est une fin de l'histoire |

---

## Choix (`choices`)

Chaque scène propose un tableau de choix. Chaque choix est un objet :

| Champ          | Type      | Obligatoire | Description |
|----------------|-----------|:-----------:|-------------|
| `text`         | `string`  | ✅ | Texte du choix affiché sur le bouton |
| `nextScene`    | `string`  | ✅ | `id` de la scène vers laquelle ce choix mène |
| `keyword`      | `string`  | ✅ | Mot-clé pour la reconnaissance vocale en mode simplifié. Doit être un mot **présent dans le `text`** du choix |
| `requirement`  | `string`  | ❌ | `id` d'un objet requis dans l'inventaire pour débloquer ce choix |
| `fallbackText` | `string`  | ❌ | Texte affiché quand le choix est verrouillé (obligatoire si `requirement` est défini) |
| `reset`        | `boolean` | ❌ | `true` pour recommencer l'histoire (remet XP, inventaire et historique à zéro) |

---

## Règles et Contraintes

1. **Scène de départ** — La valeur de `startScene` doit correspondre à une clé existante dans `scenes`.
2. **Au moins une fin** — L'histoire doit contenir au minimum une scène avec `isEnd: true`.
3. **Graphe connexe** — Toutes les scènes doivent être accessibles depuis la scène de départ via les `nextScene`.
4. **Mot-clé dans le texte** — Le `keyword` d'un choix doit apparaître dans le `text` de ce choix pour que le surlignage fonctionne correctement.
5. **Cohérence item/itemLabel** — Si `item` est défini, `itemLabel` doit l'être aussi.
6. **Cohérence requirement/fallbackText** — Si `requirement` est défini, `fallbackText` doit l'être aussi.
7. **Unicité des IDs** — Chaque `id` de scène doit être unique dans le fichier.
8. **Pas de boucle infinie** — S'assurer qu'il existe toujours un chemin vers une scène `isEnd`.

---

## Exemple : Choix Conditionnel (avec objet requis)

```json
{
  "text": "Ouvrir le coffre avec la clé",
  "nextScene": "treasure_room",
  "requirement": "golden_key",
  "fallbackText": "Le coffre est verrouillé, il te faut une clé...",
  "keyword": "coffre"
}
```

L'enfant ne pourra choisir cette option que s'il a récupéré l'objet `"golden_key"` dans une scène précédente.

---

## Ajouter une Nouvelle Histoire

1. Copier `story-template.json` et le renommer (ex: `mon-histoire.json`).
2. Remplir les métadonnées et créer les scènes.
3. Importer le fichier dans `src/stories/index.js` :

```js
import monHistoire from './mon-histoire.json';

// Ajouter à la liste :
const stories = [
  // ... histoires existantes
  monHistoire,
];
```

4. L'histoire apparaîtra automatiquement sur la page de sélection.
