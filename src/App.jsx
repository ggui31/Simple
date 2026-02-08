import React, { useState } from 'react';
import stories from './stories';
import StorySelector from './components/StorySelector';
import GameEngine from './components/GameEngine';

export default function App() {
  const [selectedStory, setSelectedStory] = useState(null);

  if (selectedStory) {
    return (
      <GameEngine
        storyData={selectedStory}
      />
    );
  }

  return (
    <StorySelector
      stories={stories}
      onSelectStory={setSelectedStory}
    />
  );
}
