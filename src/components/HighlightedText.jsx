import React from 'react';

const HighlightedText = ({ text, highlightIndex, textSize, textColor }) => {
  if (highlightIndex === null || highlightIndex < 0) {
    return (
      <p
        className={`leading-relaxed mb-8 transition-all duration-300 ${textColor}`}
        style={{ fontSize: `${textSize}px`, lineHeight: '1.6' }}
      >
        {text}
      </p>
    );
  }

  let start = text.lastIndexOf(' ', highlightIndex) + 1;
  let end = text.indexOf(' ', highlightIndex);
  if (end === -1) end = text.length;

  const before = text.slice(0, start);
  const current = text.slice(start, end);
  const after = text.slice(end);

  return (
    <p
      className={`leading-relaxed mb-8 transition-all duration-300 ${textColor}`}
      style={{ fontSize: `${textSize}px`, lineHeight: '1.6' }}
    >
      {before}
      <span className="bg-yellow-300 text-gray-900 rounded px-0.5 shadow-sm transition-colors duration-200">
        {current}
      </span>
      {after}
    </p>
  );
};

export default HighlightedText;
