import React from 'react';
import { Volume2, CheckCircle2 } from 'lucide-react';

const Button = ({ choice, index, isSimplifiedMode, disabled = false, isMatched = false, isSpeaking, highlightIndex, onPlay, showChoiceListenButtons }) => {
  const baseStyle = "px-4 py-3 rounded-xl font-bold transition-all transform shadow-sm flex items-center justify-between gap-2 relative overflow-hidden";

  let variantStyle = "";
  if (disabled) {
    variantStyle = "bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-100";
  } else if (isMatched) {
    variantStyle = "bg-emerald-100 text-emerald-900 border-2 border-emerald-400 scale-105 shadow-md ring-2 ring-emerald-200 z-10";
  } else {
    variantStyle = "bg-white text-indigo-900 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-default";
  }

  const renderText = () => {
    const text = disabled ? choice.fallbackText : choice.text;

    // Mode Karaoké
    if (isSpeaking && highlightIndex !== null) {
      let start = text.lastIndexOf(' ', highlightIndex) + 1;
      let end = text.indexOf(' ', highlightIndex);
      if (end === -1) end = text.length;

      const before = text.slice(0, start);
      const current = text.slice(start, end);
      const after = text.slice(end);

      return (
        <span className="text-lg flex-1 text-left">
          {before}
          <span className="bg-yellow-300 text-gray-900 rounded px-0.5 shadow-sm">{current}</span>
          {after}
        </span>
      );
    }

    // Mode Mot-Clé
    if (isSimplifiedMode && choice.keyword && !disabled) {
      const parts = text.split(new RegExp(`(${choice.keyword})`, 'gi'));
      return (
        <span className="text-lg flex-1 text-left">
          {parts.map((part, i) => (
            part.toLowerCase() === choice.keyword.toLowerCase()
              ? <span key={i} className="text-indigo-600 font-extrabold text-xl bg-indigo-50 px-1 rounded mx-0.5 border-b-2 border-indigo-200">{part}</span>
              : <span key={i} className="opacity-70 text-base">{part}</span>
          ))}
        </span>
      );
    }

    return <span className="text-lg flex-1 text-left">{text}</span>;
  };

  return (
    <div className={`${baseStyle} ${variantStyle} w-full h-auto min-h-[60px] transition-all duration-500 ease-out`}>
      {!disabled && !isMatched && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-400/50"></div>
      )}
      {isMatched && (
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-500"></div>
      )}

      {renderText()}

      <div className="flex items-center gap-2 z-20">
        {!isMatched && (disabled || showChoiceListenButtons) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(index, disabled ? choice.fallbackText : choice.text);
            }}
            className={`p-2 rounded-full transition-all transform active:scale-95 ${isSpeaking ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-200' : 'bg-indigo-50 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600'}`}
            title="Écouter ce choix"
          >
            {isSpeaking ? <Volume2 size={20} className="animate-pulse" /> : <Volume2 size={20} />}
          </button>
        )}

        {isMatched && (
          <CheckCircle2 size={24} className="text-emerald-600 animate-bounce" />
        )}

        {disabled && (
          <div className="text-xs font-bold uppercase px-2 py-1 bg-gray-300 rounded text-gray-500">Verrouillé</div>
        )}
      </div>
    </div>
  );
};

export default Button;
