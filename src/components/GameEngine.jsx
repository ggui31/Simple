import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Settings, Backpack, Star, Reply, Type, Mic, MicOff, CheckCircle2, Wand2 } from 'lucide-react';
import { isMatch } from '../utils/textUtils';
import Button from './Button';
import HighlightedText from './HighlightedText';

export default function GameEngine({ storyData, onBack }) {
  const startScene = storyData.startScene || 'start';
  const scenes = storyData.scenes;

  const [currentSceneId, setCurrentSceneId] = useState(startScene);
  const [history, setHistory] = useState([startScene]);
  const [inventory, setInventory] = useState([]);
  const [xp, setXp] = useState(0);

  // Accessibilité & Réglages
  const [textSize, setTextSize] = useState(20);
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isSimplifiedMode, setIsSimplifiedMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChoiceListenButtons, setShowChoiceListenButtons] = useState(false);
  const [recognitionThreshold, setRecognitionThreshold] = useState(75);
  const [enableHighlight, setEnableHighlight] = useState(false);

  // Audio & Voice
  const [isSpeakingMain, setIsSpeakingMain] = useState(false);
  const [speakingChoiceIndex, setSpeakingChoiceIndex] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(null);

  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [matchedChoiceIndex, setMatchedChoiceIndex] = useState(null);
  const [browserSupport, setBrowserSupport] = useState(true);

  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    stopAllSpeaking();
    const timer = setTimeout(() => {
      speakText(scenes[currentSceneId].text, 'main');
    }, 500);

    return () => clearTimeout(timer);
  }, [currentSceneId]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const result = event.results[event.resultIndex];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;

        setSpokenText(transcript);
        const matchFound = checkVoiceCommand(transcript);

        if (isFinal && !matchFound) {
          setFeedbackMessage(isSimplifiedMode ? "Dis juste le mot en gras !" : "Je n'ai pas bien compris...");
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'no-speech') setFeedbackMessage("Je n'ai rien entendu.");
        else setFeedbackMessage("Erreur micro.");
      };

      recognitionRef.current.onend = () => {
        if (matchedChoiceIndex === null) setIsListening(false);
      };
    } else {
      setBrowserSupport(false);
    }
  }, [currentSceneId, inventory, matchedChoiceIndex, isSimplifiedMode]);

  const currentScene = scenes[currentSceneId];

  const checkVoiceCommand = (transcript) => {
    if (matchedChoiceIndex !== null) return true;

    const matchedIndex = currentScene.choices.findIndex(choice => {
      if (choice.requirement && !inventory.includes(choice.requirement)) return false;
      return isMatch(transcript, choice.text, choice.keyword, isSimplifiedMode, recognitionThreshold);
    });

    if (matchedIndex !== -1) {
      recognitionRef.current.stop();
      setIsListening(false);
      setMatchedChoiceIndex(matchedIndex);
      setFeedbackMessage("Bravo ! ✨");
      setSpokenText(isSimplifiedMode ? currentScene.choices[matchedIndex].keyword.toUpperCase() : currentScene.choices[matchedIndex].text);

      setTimeout(() => {
        handleChoice(currentScene.choices[matchedIndex]);
        setMatchedChoiceIndex(null);
        setSpokenText("");
        setFeedbackMessage("");
      }, 1500);

      return true;
    }
    return false;
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setFeedbackMessage("");
    } else {
      stopAllSpeaking();
      setSpokenText("");
      setFeedbackMessage(isSimplifiedMode ? "Dis le mot clé..." : "Je t'écoute...");
      setMatchedChoiceIndex(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) { console.log("Recognition error", e); }
    }
  };

  const handleChoice = (choice, isTestMode = false) => {
    stopAllSpeaking();
    if (choice.reset) {
      setCurrentSceneId(startScene);
      setHistory([startScene]);
      setInventory([]);
      setXp(0);
      return;
    }
    const nextSceneData = scenes[choice.nextScene];
    if (nextSceneData.item && !inventory.includes(nextSceneData.item) && !isTestMode) {
      setInventory(prev => [...prev, nextSceneData.item]);
    }
    if (!isTestMode) {
      setXp(prev => prev + (nextSceneData.xp || 10));
    }
    setHistory(prev => [...prev, choice.nextScene]);
    setCurrentSceneId(choice.nextScene);
  };

  const handleGoBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrentSceneId(newHistory[newHistory.length - 1]);
      stopAllSpeaking();
      setMatchedChoiceIndex(null);
      setSpokenText("");
      setFeedbackMessage("");
    }
  };

  const stopAllSpeaking = () => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    setIsSpeakingMain(false);
    setSpeakingChoiceIndex(null);
    setCurrentWordIndex(null);
  };

  const speakText = (text, type, index = null) => {
    if ((type === 'main' && isSpeakingMain) || (type === 'choice' && speakingChoiceIndex === index)) {
      stopAllSpeaking();
      return;
    }

    stopAllSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.8;
    utteranceRef.current = utterance;

    if (type === 'main') setIsSpeakingMain(true);
    if (type === 'choice') setSpeakingChoiceIndex(index);

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentWordIndex(event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsSpeakingMain(false);
      setSpeakingChoiceIndex(null);
      setCurrentWordIndex(null);
    };

    utterance.onerror = () => {
      setIsSpeakingMain(false);
      setSpeakingChoiceIndex(null);
      setCurrentWordIndex(null);
    };

    synthRef.current.speak(utterance);
  };

  const toggleMainSpeech = () => speakText(currentScene.text, 'main');
  const playChoice = (index, text) => speakText(text, 'choice', index);

  const fontStyle = isDyslexicFont ? 'font-sans' : 'font-serif';
  const bgColor = highContrast ? 'bg-gray-900' : 'bg-amber-50';
  const textColor = highContrast ? 'text-yellow-300' : 'text-gray-800';
  const cardColor = highContrast ? 'bg-gray-800 border-gray-700' : 'bg-white border-amber-100';

  if (!browserSupport) return <div className="p-8 text-center">Navigateur non supporté pour la reconnaissance vocale.</div>;

  return (
    <div className={`h-screen overflow-hidden ${bgColor} ${fontStyle} transition-colors duration-300 flex flex-col md:flex-row items-center md:items-start md:justify-center p-2 md:p-4 gap-4`}>

      {/* HEADER / SIDEBAR */}
      <div className="flex-none w-full md:w-auto md:h-min max-w-2xl md:max-w-none flex justify-between md:flex-col md:justify-start items-center md:gap-4 bg-white/80 p-3 rounded-2xl shadow-sm backdrop-blur-sm border border-amber-100 z-10">
        <div className="flex items-center gap-4">
          {/* Bouton retour à la sélection */}
          <button
            onClick={() => { stopAllSpeaking(); onBack(); }}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
            title="Retour aux histoires"
          >
            <Reply size={20} />
          </button>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <Settings size={20} />
        </button>
      </div>

      <div className="flex-1 w-full max-w-2xl flex flex-col min-h-0 h-full">
        {/* PARAMÈTRES */}
        {showSettings && (
          <div className="w-full mb-6 p-4 bg-white rounded-xl shadow-lg border border-indigo-100 animate-in fade-in slide-in-from-top-4 flex-none">
          <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <Type size={18} /> Réglages de Lecture
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer border border-indigo-100">
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isSimplifiedMode ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isSimplifiedMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={isSimplifiedMode} onChange={() => setIsSimplifiedMode(!isSimplifiedMode)} />
              <div>
                <span className="font-bold text-indigo-900 block">Mode Débutant (Mots-clés)</span>
                <span className="text-xs text-gray-500">Affiche et écoute uniquement les mots importants.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer border border-indigo-100">
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${showChoiceListenButtons ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${showChoiceListenButtons ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={showChoiceListenButtons} onChange={() => setShowChoiceListenButtons(!showChoiceListenButtons)} />
              <div>
                <span className="font-bold text-indigo-900 block">Afficher les boutons d'écoute</span>
                <span className="text-xs text-gray-500">Affiche l'option d'écoute pour toutes les réponses.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer border border-indigo-100">
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${enableHighlight ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${enableHighlight ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={enableHighlight} onChange={() => setEnableHighlight(!enableHighlight)} />
              <div>
                <span className="font-bold text-indigo-900 block">Surligneur de mots</span>
                <span className="text-xs text-gray-500">Active le surlignage progressif lors de la lecture audio.</span>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Taille du texte</label>
                <input type="range" min="16" max="32" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Sensibilité de reconnaissance: {recognitionThreshold}%</label>
                <input type="range" min="0" max="100" step="5" value={recognitionThreshold} onChange={(e) => setRecognitionThreshold(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                  <input type="checkbox" checked={isDyslexicFont} onChange={() => setIsDyslexicFont(!isDyslexicFont)} className="rounded text-indigo-600" />
                  <span className="text-sm font-sans">Police simplifiée</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                  <input type="checkbox" checked={highContrast} onChange={() => setHighContrast(!highContrast)} className="rounded text-indigo-600" />
                  <span className="text-sm font-bold">Mode Contraste Élevé</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZONE PRINCIPALE */}
      <div className={`flex-1 w-full ${cardColor} rounded-3xl shadow-xl overflow-hidden border-2 transition-all duration-300 relative flex flex-col min-h-0 mb-2 md:mb-4`}>

        {/* Image Scène */}
        <div className="flex-none h-24 md:h-36 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-7xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <span className="animate-bounce-slow drop-shadow-lg filter">{currentScene.image}</span>
        </div>

        {/* Contenu Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
          <div className="flex justify-between items-start mb-4">
            <h2 className={`text-xl font-bold opacity-70 uppercase tracking-wide ${textColor}`}>
              {currentScene.title}
            </h2>
            <button
              onClick={toggleMainSpeech}
              className={`p-2 rounded-full transition-all ${isSpeakingMain ? 'bg-yellow-400 text-yellow-900 shadow-lg scale-110' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
              title="Lire l'histoire"
            >
              <Volume2 size={24} />
            </button>
          </div>

          <HighlightedText
            text={currentScene.text}
            highlightIndex={isSpeakingMain && enableHighlight ? currentWordIndex : null}
            textSize={textSize}
            textColor={textColor}
          />

          {/* Feedback Inventaire */}
          {currentScene.item && !inventory.includes(currentScene.item) && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center gap-3 animate-pulse">
              <Star className="text-yellow-500" />
              <span className="text-yellow-800 font-bold">Objet découvert : {currentScene.itemLabel} !</span>
            </div>
          )}

          <div className="border-t border-gray-200 my-4"></div>

          {/* CHOIX */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-100 rounded-full">
                {isSimplifiedMode ? <Wand2 size={16} className="text-indigo-600" /> : <Mic size={16} className="text-indigo-600" />}
              </div>
              <span className={`text-sm font-bold uppercase tracking-wider ${highContrast ? 'text-gray-300' : 'text-gray-500'}`}>
                {isSimplifiedMode ? "Dis le mot magique :" : "Lis une phrase à haute voix :"}
              </span>
            </div>

            {currentScene.choices.map((choice, index) => {
              const isLocked = choice.requirement && !inventory.includes(choice.requirement);
              return (
                <div key={index} className="transition-all duration-300">
                  <Button
                    choice={choice}
                    index={index}
                    isSimplifiedMode={isSimplifiedMode}
                    disabled={isLocked}
                    isMatched={matchedChoiceIndex === index}
                    isSpeaking={speakingChoiceIndex === index}
                    highlightIndex={speakingChoiceIndex === index && enableHighlight ? currentWordIndex : null}
                    onPlay={playChoice}
                    showChoiceListenButtons={showChoiceListenButtons}
                    onClick={(e) => {
                      if (e.ctrlKey && !isLocked) {
                        handleChoice(choice, true);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* INTERFACE VOCALE FLOTTANTE */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-indigo-100 flex flex-col items-center z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">

          <div className="mb-3 h-8 flex items-center justify-center w-full">
            {spokenText && (
              <span className={`text-lg font-medium truncate max-w-full px-4 ${matchedChoiceIndex !== null ? 'text-emerald-600 font-bold' : 'text-indigo-800'}`}>
                "{spokenText}"
              </span>
            )}
            {!spokenText && feedbackMessage && (
              <span className={`text-sm font-medium animate-pulse ${feedbackMessage.includes('Bravo') ? 'text-emerald-600 text-lg font-bold' : 'text-orange-500'}`}>
                {feedbackMessage}
              </span>
            )}
          </div>

          <div className="relative">
            {isListening && (
              <>
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-[-10px] bg-red-400 rounded-full animate-pulse opacity-10"></div>
              </>
            )}

            <button
              onClick={toggleListening}
              className={`
                relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-105 active:scale-95 border-4
                ${isListening
                  ? 'bg-red-500 border-red-100 text-white'
                  : 'bg-indigo-600 border-indigo-100 text-white hover:bg-indigo-700'
                }
                ${matchedChoiceIndex !== null ? 'bg-emerald-500 border-emerald-200' : ''}
              `}
            >
              {matchedChoiceIndex !== null ? <CheckCircle2 size={40} /> : (isListening ? <MicOff size={32} /> : <Mic size={36} />)}
            </button>
          </div>

          <span className="text-xs text-gray-400 mt-3 font-medium uppercase tracking-widest">
            {isListening ? (isSimplifiedMode ? "Dis un mot..." : "Je t'écoute...") : "Appuie pour parler"}
          </span>
        </div>

      </div>
      </div>
    </div>
  );
}
