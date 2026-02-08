import React, { useState, useEffect } from 'react';
import { BookOpen, Star, ArrowRight, Map, Volume2, StopCircle } from 'lucide-react';

const difficultyConfig = {
  facile: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: '⭐ Facile' },
  moyen: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: '⭐⭐ Moyen' },
  difficile: { color: 'bg-red-100 text-red-700 border-red-200', label: '⭐⭐⭐ Difficile' },
};

export default function StorySelector({ stories, onSelectStory }) {
  const [speakingStoryIndex, setSpeakingStoryIndex] = useState(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeakDescription = (story, index, e) => {
    e.stopPropagation();

    if (speakingStoryIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingStoryIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingStoryIndex(index);

    const utterance = new SpeechSynthesisUtterance(story.description);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;

    utterance.onend = () => {
      setSpeakingStoryIndex(null);
    };

    utterance.onerror = () => {
      setSpeakingStoryIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };
  // Grouper les histoires par difficulté
  const difficultyOrder = { facile: 1, moyen: 2, difficile: 3 };
  const groupedStories = stories.reduce((acc, story) => {
    const difficulty = story.difficulty || 'facile';
    if (!acc[difficulty]) acc[difficulty] = [];
    acc[difficulty].push(story);
    return acc;
  }, {});

  // Trier les groupes par ordre de difficulté
  const sortedDifficulties = Object.keys(groupedStories).sort(
    (a, b) => difficultyOrder[a] - difficultyOrder[b]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center p-4 md:p-8">

      {/* EN-TÊTE */}
      <div className="text-center mb-10 mt-4">
        <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-indigo-100 mb-6">
          <BookOpen size={32} className="text-indigo-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-900 tracking-tight">
            Aventure Lecture
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Choisis une histoire et pars à l'aventure ! Lis à haute voix pour avancer. 🎤
        </p>
      </div>

      {/* HISTOIRES GROUPÉES PAR DIFFICULTÉ */}
      <div className="w-full max-w-6xl space-y-12">
        {sortedDifficulties.map((difficulty) => {
          const storiesInGroup = groupedStories[difficulty];
          const diff = difficultyConfig[difficulty] || difficultyConfig.facile;

          return (
            <div key={difficulty} className="space-y-4">
              {/* Titre de la section */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`px-4 py-2 rounded-xl ${diff.color} border-2 font-bold text-lg`}>
                  {diff.label}
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
              </div>

              {/* GRILLE D'HISTOIRES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storiesInGroup.map((story, index) => {
          const diff = difficultyConfig[story.difficulty] || difficultyConfig.facile;
          const sceneCount = Object.keys(story.scenes).length;

          return (
            <div
              key={index}
              role="button"
              tabIndex={0}
              onClick={() => onSelectStory(story)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectStory(story);
                }
              }}
              className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-indigo-300 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] text-left overflow-hidden"
            >
              {/* Image de couverture */}
              <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-7xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <span className="group-hover:animate-bounce drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                  {story.coverImage}
                </span>

                <button
                  onClick={(e) => handleSpeakDescription(story, index, e)}
                  className={`absolute bottom-3 right-3 p-2 rounded-full transition-all shadow-sm z-10 ${speakingStoryIndex === index ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200' : 'bg-white/90 text-indigo-600 hover:bg-white hover:scale-110'}`}
                  title="Écouter la description"
                >
                  {speakingStoryIndex === index ? <StopCircle size={20} /> : <Volume2 size={20} />}
                </button>
              </div>

              {/* Contenu */}
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors min-h-[3.5rem]">
                  {story.title}
                </h2>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                  {story.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${diff.color}`}>
                    {diff.label}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    ⏱ {story.estimatedTime}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
                    <Map size={12} />
                    {sceneCount} scènes
                  </span>
                </div>

                {/* Bouton Jouer */}
                <div className="flex items-center justify-end">
                  <span className="text-sm font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors flex items-center gap-1">
                    Jouer
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucune histoire */}
      {stories.length === 0 && (
        <div className="text-center text-gray-400 mt-20">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Aucune histoire disponible.</p>
          <p className="text-sm mt-2">Ajoutez un fichier JSON dans <code className="bg-gray-100 px-2 py-1 rounded">src/stories/</code></p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 mb-4 text-center text-xs text-gray-400">
        <p>{stories.length} histoire{stories.length > 1 ? 's' : ''} disponible{stories.length > 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}
