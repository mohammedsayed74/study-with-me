import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function StudentQuiz({ courseCode, chapter, level }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isVerifying, setIsVerifying] = useState(false);

  const quizStateKey = `quiz_${courseCode}_${chapter}_${level}`;

  const loadInitialState = () => {
    const saved = localStorage.getItem(quizStateKey);
    if (saved) return JSON.parse(saved);
    return {
      answers: {}, // index -> { selectedOption, verificationResult, isCorrect }
      currentIndex: 0,
      quizFinished: false
    };
  };

  const [quizState, setQuizState] = useState(loadInitialState);

  useEffect(() => {
    localStorage.setItem(quizStateKey, JSON.stringify(quizState));
  }, [quizState, quizStateKey]);

  const { answers, currentIndex, quizFinished } = quizState;

  // Calculate scores dynamically from the answers object
  const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
  const incorrectCount = Object.values(answers).filter(a => a.selectedOption && !a.isCorrect).length;

  const currentAnswer = answers[currentIndex] || {};
  const selectedOption = currentAnswer.selectedOption || "";
  const verificationResult = currentAnswer.verificationResult || null;

  const getQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const chapterNumber = chapter.split("-")[1] || chapter;
      
      const res = await axios.get(
        `/api/MCQs?courseCode=${courseCode}&chapter=${chapterNumber}&difficulty=${level}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuestions();
  }, [courseCode, chapter, level]);

  const handleOptionSelect = (opt) => {
    if (verificationResult) return;
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentIndex]: {
          ...prev.answers[prev.currentIndex],
          selectedOption: opt
        }
      }
    }));
  };

  const verifyAnswer = async () => {
    if (!selectedOption || isVerifying || verificationResult) return;
    setIsVerifying(true);
    
    try {
      const token = localStorage.getItem("token");
      const currentQ = questions[currentIndex];
      
      const res = await axios.post(
        `/api/MCQs/verify`,
        { questionId: currentQ._id, selectedOption },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { isCorrect, explanation, correctAnswer } = res.data;
      
      setQuizState(prev => {
        return {
          ...prev,
          answers: {
            ...prev.answers,
            [prev.currentIndex]: {
              ...prev.answers[prev.currentIndex],
              verificationResult: { isCorrect, explanation, correctAnswer },
              isCorrect
            }
          }
        };
      });
      
    } catch (err) {
      console.error(err);
      alert("Error verifying answer");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setQuizState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    } else {
      setQuizState(prev => ({ ...prev, quizFinished: true }));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setQuizState(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
    }
  };

  // Reset quiz logic
  const handleResetQuiz = () => {
    const newState = {
      answers: {},
      currentIndex: 0,
      quizFinished: false
    };
    setQuizState(newState);
    localStorage.setItem(quizStateKey, JSON.stringify(newState));
  };

  if (loading) return <div className="quiz-container">Loading...</div>;

  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <h2>No questions available for this level yet!</h2>
      </div>
    );
  }

  if (quizFinished) {
    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    return (
      <div className="quiz-container">
        <div className="score-container">
          <h2>Quiz Completed!</h2>
          <div className="score-circle">{percentage}%</div>
          <p style={{ fontSize: "18px", color: "#7f8c8d" }}>
            You answered <strong>{correctCount}</strong> correctly out of <strong>{total}</strong> questions.
          </p>
          <div style={{ marginTop: "30px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setQuizState(prev => ({ ...prev, quizFinished: false, currentIndex: 0 }))} className="btn-primary" style={{ background: "#3498db" }}>
              Review Answers
            </button>
            <button onClick={handleResetQuiz} className="btn-primary" style={{ background: "#e74c3c" }}>
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        {currentIndex > 0 ? (
          <button onClick={handlePrevious} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
             <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
             Previous
          </button>
        ) : (
          <div style={{ width: "60px" }}></div>
        )}
        <h2 className="quiz-title">
          Chapter {chapter.replace("chapter-", "")} Quiz - <span style={{textTransform: 'capitalize'}}>{level}</span>
        </h2>
        <div style={{ width: "60px" }}></div>
      </div>

      <div className="quiz-layout">
        <div className="quiz-main">
          <p className="question-text">
            Q{currentIndex + 1}: {currentQ.questionText}
          </p>

          <div className="options-container">
            {currentQ.options.map((opt, i) => (
              <div
                key={i}
                className={`option-item ${selectedOption === opt ? "selected" : ""}`}
                onClick={() => handleOptionSelect(opt)}
                style={{
                  pointerEvents: verificationResult ? "none" : "auto",
                  opacity: verificationResult && selectedOption !== opt && verificationResult.correctAnswer !== opt ? 0.6 : 1
                }}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}:</span>
                <span>{opt}</span>
              </div>
            ))}
          </div>

          {!verificationResult ? (
            <button
              className="verify-btn"
              onClick={verifyAnswer}
              disabled={!selectedOption || isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify Answer"}
            </button>
          ) : (
            <div className={`result-box ${verificationResult.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="result-title">
                {verificationResult.isCorrect ? (
                  <><span className="material-symbols-outlined correct-text">check_circle</span> <span className="correct-text">Correct!</span></>
                ) : (
                  <><span className="material-symbols-outlined incorrect-text">cancel</span> <span className="incorrect-text">Incorrect!</span></>
                )}
              </div>
              
              {!verificationResult.isCorrect && (
                <div style={{ marginBottom: "12px", fontWeight: "600" }}>
                  Correct Answer: <span style={{ color: "#2ecc71" }}>{verificationResult.correctAnswer}</span>
                </div>
              )}
              
              {verificationResult.explanation && (
                <div>
                  <strong style={{ fontSize: "14px" }}>Explanation:</strong>
                  <p className="explanation-text" style={{ marginTop: "4px" }}>{verificationResult.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bottom-bar">
        <div className="progress-text">
          Question {currentIndex + 1} of {totalQ}
        </div>
        
        <div className="stats">
          <div className="stat-item correct">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check</span> Correct: {correctCount}
          </div>
          <div className="stat-item incorrect">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span> Incorrect: {incorrectCount}
          </div>
        </div>

        <button 
          className="next-btn"
          onClick={() => {
            if (!verificationResult) {
              if (!selectedOption) {
                alert("Please select an answer first!");
              } else {
                verifyAnswer();
              }
            } else {
              handleNext();
            }
          }}
          disabled={isVerifying}
        >
          {currentIndex + 1 === totalQ ? "View Score" : "Next Question"}
        </button>
      </div>
    </div>
  );
}

export default StudentQuiz;

