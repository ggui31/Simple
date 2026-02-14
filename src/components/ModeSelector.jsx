import React from 'react';
import { BookOpen, Calculator } from 'lucide-react';

/**
 * Mode selector component - allows user to choose between Stories and Math modes
 */
export default function ModeSelector({ onSelectMode }) {
  const modes = [
    {
      id: 'story',
      title: 'Histoires',
      description: 'Lis des histoires à voix haute et vis des aventures',
      icon: BookOpen,
      emoji: '📚',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'math',
      title: 'Mathématiques',
      description: 'Résous des problèmes de calcul avec ta voix',
      icon: Calculator,
      emoji: '🔢',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎮 Choisis ton mode de jeu
          </h1>
          <p className="text-xl text-gray-600">
            Que veux-tu faire aujourd'hui ?
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-left"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon and Emoji */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-6xl">{mode.emoji}</div>
                    <Icon className="w-12 h-12 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-3xl font-bold text-gray-800 mb-3 group-hover:text-gray-900">
                    {mode.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {mode.description}
                  </p>
                  
                  {/* Arrow indicator */}
                  <div className="mt-6 flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
                    Commencer
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            💡 N'oublie pas d'activer ton micro pour jouer !
          </p>
        </div>
      </div>
    </div>
  );
}
