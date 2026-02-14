import React from 'react';
import { ArrowLeft, Star, TrendingUp, Zap } from 'lucide-react';
import { getOperationEmoji, getOperationDisplayName, getLevelDisplayName } from '../utils/mathGenerator';

/**
 * Math level selector - displays available operations and difficulty levels
 */
export default function MathLevelSelector({ onSelectLevel, onBack }) {
  const levels = [
    // Addition levels
    {
      operation: 'addition',
      level: 'facile',
      description: 'Nombres de 1 à 10',
      icon: Star,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50'
    },
    {
      operation: 'addition',
      level: 'moyen',
      description: 'Nombres de 5 à 20',
      icon: TrendingUp,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50'
    },
    {
      operation: 'addition',
      level: 'difficile',
      description: 'Nombres de 10 à 50',
      icon: Zap,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50'
    },
    // Subtraction levels
    {
      operation: 'soustraction',
      level: 'facile',
      description: 'Nombres de 1 à 10',
      icon: Star,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    {
      operation: 'soustraction',
      level: 'moyen',
      description: 'Nombres de 5 à 20',
      icon: TrendingUp,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50'
    },
    {
      operation: 'soustraction',
      level: 'difficile',
      description: 'Nombres de 10 à 50',
      icon: Zap,
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      textColor: 'text-pink-700',
      bgColor: 'bg-pink-50'
    }
  ];

  // Group by operation
  const additionLevels = levels.filter(l => l.operation === 'addition');
  const subtractionLevels = levels.filter(l => l.operation === 'soustraction');

  const renderLevelCard = (levelConfig) => {
    const Icon = levelConfig.icon;
    
    return (
      <button
        key={`${levelConfig.operation}-${levelConfig.level}`}
        onClick={() => onSelectLevel({ 
          operation: levelConfig.operation, 
          level: levelConfig.level 
        })}
        className={`${levelConfig.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left relative overflow-hidden group`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <div className={`${levelConfig.color} rounded-full w-32 h-32`} />
        </div>
        
        <div className="relative z-10">
          {/* Header with icon */}
          <div className="flex items-center justify-between mb-4">
            <Icon className={`w-8 h-8 ${levelConfig.textColor}`} />
            <div className={`${levelConfig.color} ${levelConfig.hoverColor} text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md transition-colors`}>
              {getLevelDisplayName(levelConfig.level)}
            </div>
          </div>
          
          {/* Description */}
          <p className={`${levelConfig.textColor} font-medium mb-2`}>
            {levelConfig.description}
          </p>
          
          {/* Difficulty indicator */}
          <div className="flex gap-1 mt-3">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={`w-2 h-2 rounded-full ${
                  (levelConfig.level === 'facile' && dot <= 1) ||
                  (levelConfig.level === 'moyen' && dot <= 2) ||
                  (levelConfig.level === 'difficile' && dot <= 3)
                    ? levelConfig.color
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour</span>
          </button>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔢 Choisis ton niveau
          </h1>
          <p className="text-lg text-gray-600">
            Sélectionne une opération et un niveau de difficulté
          </p>
        </div>

        {/* Addition Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">{getOperationEmoji('addition')}</div>
            <h2 className="text-3xl font-bold text-gray-800">
              {getOperationDisplayName('addition')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {additionLevels.map(renderLevelCard)}
          </div>
        </div>

        {/* Subtraction Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">{getOperationEmoji('soustraction')}</div>
            <h2 className="text-3xl font-bold text-gray-800">
              {getOperationDisplayName('soustraction')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {subtractionLevels.map(renderLevelCard)}
          </div>
        </div>

        {/* Footer hint */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            🎯 Tu vas résoudre 10 problèmes par session !
          </p>
        </div>
      </div>
    </div>
  );
}
