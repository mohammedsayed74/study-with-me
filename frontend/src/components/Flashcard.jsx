import React, { useState } from 'react';
import './Flashcard.css';

const Flashcard = ({ question, answer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`flashcard ${isFlipped ? 'flipped' : ''}`} 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <p className="q-label">Question:</p>
          <p>{question}</p>
        </div>
        <div className="flashcard-back">
          <p className="a-label">Answer:</p>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
