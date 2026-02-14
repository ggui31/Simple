import React, { useState } from 'react';
import stories from './stories';
import StorySelector from './components/StorySelector';
import GameEngine from './components/GameEngine';
import ModeSelector from './components/ModeSelector';
import MathLevelSelector from './components/MathLevelSelector';
import MathEngine from './components/MathEngine';

export default function App() {
  // App mode: 'mode-selection' | 'story-mode' | 'math-mode'
  const [appMode, setAppMode] = useState('mode-selection');
  
  // Story mode state
  const [selectedStory, setSelectedStory] = useState(null);
  
  // Math mode state
  const [mathConfig, setMathConfig] = useState(null); // { operation, level }

  // Handle mode selection
  const handleModeSelection = (mode) => {
    if (mode === 'story') {
      setAppMode('story-mode');
    } else if (mode === 'math') {
      setAppMode('math-mode');
    }
  };

  // Handle math level selection
  const handleMathLevelSelection = (config) => {
    setMathConfig(config);
  };

  // Handle back navigation
  const handleBackToModeSelection = () => {
    setAppMode('mode-selection');
    setSelectedStory(null);
    setMathConfig(null);
  };

  const handleBackToStorySelector = () => {
    setSelectedStory(null);
  };

  const handleBackToMathLevelSelector = () => {
    setMathConfig(null);
  };

  // Mode Selection Screen
  if (appMode === 'mode-selection') {
    return <ModeSelector onSelectMode={handleModeSelection} />;
  }

  // Story Mode
  if (appMode === 'story-mode') {
    if (selectedStory) {
      return (
        <GameEngine
          storyData={selectedStory}
          onBack={handleBackToStorySelector}
        />
      );
    }
    
    return (
      <StorySelector
        stories={stories}
        onSelectStory={setSelectedStory}
        onBack={handleBackToModeSelection}
      />
    );
  }

  // Math Mode
  if (appMode === 'math-mode') {
    if (mathConfig) {
      return (
        <MathEngine
          operation={mathConfig.operation}
          level={mathConfig.level}
          onBack={handleBackToMathLevelSelector}
        />
      );
    }
    
    return (
      <MathLevelSelector
        onSelectLevel={handleMathLevelSelection}
        onBack={handleBackToModeSelection}
      />
    );
  }

  // Fallback
  return <ModeSelector onSelectMode={handleModeSelection} />;
}
