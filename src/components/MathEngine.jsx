import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, Mic, MicOff, Check, X, Trophy, Target, Zap } from 'lucide-react';
import { generateSession, getOperationEmoji, getOperationDisplayName, getLevelDisplayName } from '../utils/mathGenerator';
import { parseSpokenNumber, numberToFrench } from '../utils/numberUtils';

/**
 * Math game engine - manages math problem sessions with voice recognition
 */
export default function MathEngine({ operation, level, onBack }) {
  // Problem state
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  
  // Accessibility settings (reuse from localStorage if available)
  const [textSize, setTextSize] = useState(() => localStorage.getItem('textSize') || 'normal');
  const [isDyslexicFont, setIsDyslexicFont] = useState(() => localStorage.getItem('dyslexicFont') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true');
  
  // Browser support check
  const [browserSupport, setBrowserSupport] = useState({
    speechRecognition: false,
    speechSynthesis: false
  });

  // Initialize session
  useEffect(() => {
    const session = generateSession(operation, level, 10);
    setProblems(session);
    
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setBrowserSupport({
      speechRecognition: !!SpeechRecognition,
      speechSynthesis: 'speechSynthesis' in window
    });
    
    // Initialize speech recognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Recognition result:', transcript);
        setSpokenText(transcript);
      };
      
      recognition.onend = () => {
        console.log('🎤 Recognition ended');
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('🎤 Speech recognition error:', event.error);
        setIsListening(false);
        setSpokenText('');
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [operation, level]);

  // Process spoken text when it changes
  useEffect(() => {
    if (spokenText && !showFeedback) {
      const currentProblem = problems[currentIndex];
      if (!currentProblem) return;
      
      console.log('📝 Processing spoken text:', spokenText);
      console.log('📝 Current problem:', currentProblem.question, '=', currentProblem.answer);
      
      const spokenNumber = parseSpokenNumber(spokenText);
      console.log('🔢 Parsed number:', spokenNumber, '| Expected:', currentProblem.answer);
      
      if (spokenNumber !== null && spokenNumber !== undefined) {
        console.log('✅ Valid number detected, checking answer...');
        checkAnswer(spokenNumber);
      } else {
        console.log('⚠️ Could not parse number, clearing text...');
        setTimeout(() => setSpokenText(''), 2000);
      }
    }
  }, [spokenText]);

  // Auto-read question when it changes
  useEffect(() => {
    if (problems.length > 0 && !showFeedback && !sessionComplete) {
      // Small delay to ensure UI is rendered
      const timer = setTimeout(() => {
        const currentProblem = problems[currentIndex];
        if (currentProblem && browserSupport.speechSynthesis) {
          speakText(currentProblem.spokenQuestion);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, problems, showFeedback, sessionComplete]);

  // Check if answer is correct
  const checkAnswer = (answer) => {
    const currentProblem = problems[currentIndex];
    const correct = answer === currentProblem.answer;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    setAttempts(attempts + 1);
    
    if (correct) {
      setScore(score + 1);
      speakText('Bravo !');
      
      // Move to next problem after short delay for success
      setTimeout(() => {
        setShowFeedback(false);
        setSpokenText('');
        
        if (currentIndex < problems.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setSessionComplete(true);
        }
      }, 2000);
    } else {
      speakText(`C'est pas bon. La réponse est ${numberToFrench(currentProblem.answer)}.`);
      
      // Move to next problem after longer delay for error (to show correction)
      setTimeout(() => {
        setShowFeedback(false);
        setSpokenText('');
        
        if (currentIndex < problems.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setSessionComplete(true);
        }
      }, 3500);
    }
  };



  // Text-to-speech function
  const speakText = (text) => {
    if (!browserSupport.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle listening
  const toggleListening = () => {
    if (!browserSupport.speechRecognition) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setSpokenText('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Speak current problem
  const speakProblem = () => {
    const problem = problems[currentIndex];
    if (problem) {
      speakText(problem.spokenQuestion);
    }
  };

  // Text size classes
  const textSizeClasses = {
    small: 'text-base',
    normal: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl'
  };

  const problemTextSize = {
    small: 'text-4xl',
    normal: 'text-5xl',
    large: 'text-6xl',
    xlarge: 'text-7xl'
  };

  if (sessionComplete) {
    const percentage = Math.round((score / problems.length) * 100);
    
    return (
      <div className={`min-h-screen ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} p-8 flex items-center justify-center`}>
        <div className={`max-w-2xl w-full ${highContrast ? 'bg-gray-900 border-4 border-white' : 'bg-white'} rounded-3xl shadow-2xl p-12 text-center`}>
          <div className="text-8xl mb-6">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '🎉' : '💪'}
          </div>
          
          <h2 className={`text-4xl font-bold mb-4 ${highContrast ? 'text-white' : 'text-gray-800'}`}>
            Session terminée !
          </h2>
          
          <div className="mb-8">
            <div className={`text-7xl font-bold mb-2 ${highContrast ? 'text-yellow-300' : 'text-indigo-600'}`}>
              {score}/{problems.length}
            </div>
            <p className={`text-2xl ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
              {percentage}% de réussite
            </p>
          </div>
          
          <p className={`text-xl mb-8 ${highContrast ? 'text-gray-300' : 'text-gray-700'}`}>
            {percentage >= 80 
              ? 'Incroyable ! Tu es un champion des maths !' 
              : percentage >= 60
              ? 'Bravo ! Continue comme ça !'
              : 'Continue à t\'entraîner, tu vas y arriver !'}
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setProblems(generateSession(operation, level, 10));
                setCurrentIndex(0);
                setScore(0);
                setAttempts(0);
                setSessionComplete(false);
              }}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                highContrast 
                  ? 'bg-white text-black border-4 border-white hover:bg-gray-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Recommencer
            </button>
            
            <button
              onClick={onBack}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                highContrast
                  ? 'bg-gray-700 text-white border-4 border-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Choisir un autre niveau
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentProblem = problems[currentIndex];
  if (!currentProblem) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} p-4 md:p-8 ${isDyslexicFont ? 'font-mono' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              highContrast 
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          
          <div className="text-center">
            <div className="text-3xl mb-1">
              {getOperationEmoji(operation)}
            </div>
            <div className={`text-sm font-semibold ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
              {getOperationDisplayName(operation)} - {getLevelDisplayName(level)}
            </div>
          </div>
          
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        {/* Progress bar */}
        <div className={`mb-8 ${highContrast ? 'bg-gray-800' : 'bg-white/80'} rounded-full p-2`}>
          <div className="flex items-center justify-between mb-2 px-2">
            <span className={`text-sm font-semibold ${highContrast ? 'text-white' : 'text-gray-700'}`}>
              Question {currentIndex + 1}/{problems.length}
            </span>
            <span className={`text-sm font-semibold ${highContrast ? 'text-yellow-300' : 'text-indigo-600'}`}>
              Score: {score}/{attempts}
            </span>
          </div>
          <div className={`h-3 ${highContrast ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div
              className={`h-full ${highContrast ? 'bg-yellow-300' : 'bg-indigo-600'} transition-all duration-500`}
              style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Problem card */}
        <div className={`${highContrast ? 'bg-gray-900 border-4 border-white' : 'bg-white'} rounded-3xl shadow-2xl p-8 md:p-12 mb-8`}>
          {/* Question */}
          <div className="text-center mb-8">
            <p className={`${textSizeClasses[textSize]} ${highContrast ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              {currentProblem.displayQuestion}
            </p>
            
            <div className={`${problemTextSize[textSize]} font-bold ${highContrast ? 'text-white' : 'text-gray-800'} mb-6`}>
              {currentProblem.question} = ?
            </div>
            
            {/* Speak button */}
            <button
              onClick={speakProblem}
              disabled={isSpeaking}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isSpeaking
                  ? highContrast ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'
                  : highContrast 
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              <Volume2 className={`w-5 h-5 inline mr-2 ${isSpeaking ? 'animate-pulse' : ''}`} />
              {isSpeaking ? 'En cours...' : 'Écouter'}
            </button>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`text-center py-6 rounded-2xl mb-6 ${
              isCorrect 
                ? highContrast ? 'bg-green-900 border-2 border-green-400' : 'bg-green-100'
                : highContrast ? 'bg-red-900 border-2 border-red-400' : 'bg-red-100'
            }`}>
              <div className="text-6xl mb-3">
                {isCorrect ? <Check className={`w-16 h-16 mx-auto ${highContrast ? 'text-green-400' : 'text-green-600'}`} /> : <X className={`w-16 h-16 mx-auto ${highContrast ? 'text-red-400' : 'text-red-600'}`} />}
              </div>
              <p className={`text-2xl font-bold ${
                isCorrect 
                  ? highContrast ? 'text-green-300' : 'text-green-700'
                  : highContrast ? 'text-red-300' : 'text-red-700'
              }`}>
                {isCorrect ? 'Bravo !' : `C'est pas bon ! La réponse est ${currentProblem.answer}`}
              </p>
            </div>
          )}

          {/* Voice recognition */}
          {spokenText && !showFeedback && (
            <div className={`text-center mb-4 p-4 rounded-xl ${highContrast ? 'bg-gray-800' : 'bg-blue-50'}`}>
              <p className={`${textSizeClasses[textSize]} ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                Tu as dit: <span className={`font-bold ${highContrast ? 'text-white' : 'text-gray-800'}`}>{spokenText}</span>
              </p>
            </div>
          )}
        </div>

        {/* Floating voice control */}
        {browserSupport.speechRecognition && (
          <div className="fixed bottom-8 right-8">
            <button
              onClick={toggleListening}
              disabled={showFeedback}
              className={`w-20 h-20 rounded-full shadow-2xl transition-all transform hover:scale-110 ${
                showFeedback
                  ? highContrast ? 'bg-gray-700' : 'bg-gray-400'
                  : isListening
                    ? highContrast ? 'bg-red-600 animate-pulse' : 'bg-red-500 animate-pulse'
                    : highContrast ? 'bg-white text-black' : 'bg-indigo-600 text-white'
              }`}
            >
              {isListening ? <MicOff className="w-10 h-10 mx-auto" /> : <Mic className="w-10 h-10 mx-auto" />}
            </button>
            <p className={`text-center text-sm mt-2 font-semibold ${highContrast ? 'text-white' : 'text-gray-700'}`}>
              {isListening ? 'Écoute...' : 'Parler'}
            </p>
          </div>
        )}

        {/* Browser support warning */}
        {!browserSupport.speechRecognition && (
          <div className={`${highContrast ? 'bg-yellow-900 border-2 border-yellow-400' : 'bg-yellow-100'} border-l-4 border-yellow-500 p-4 rounded-lg`}>
            <p className={`${highContrast ? 'text-yellow-300' : 'text-yellow-800'}`}>
              ⚠️ La reconnaissance vocale n'est pas supportée par ton navigateur. Utilise Chrome ou Edge pour profiter de toutes les fonctionnalités.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
