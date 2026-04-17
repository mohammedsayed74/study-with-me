import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function StudentQuiz({ courseCode, chapter, level }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [verificationResult, setVerificationResult] = useState(null); // { isCorrect: boolean, explanation: string, correctAnswer: string }
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

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

  const verifyAnswer = async () => {
    if (!selectedOption) return;
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
      setVerificationResult({ isCorrect, explanation, correctAnswer });
      
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      } else {
        setIncorrectCount((prev) => prev + 1);
      }
      
    } catch (err) {
      console.error(err);
      alert("Error verifying answer");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNext = () => {
    setSelectedOption("");
    setVerificationResult(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  if (loading) return <div className="quiz-container">Loading...</div>;

  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <h2>No questions available for this level yet!</h2>
        <Link to={`/course/${courseCode}/questions/${chapter}`} className="back-link">
           <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
           Back to Levels
        </Link>
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
          <div style={{ marginTop: "30px", display: "flex", gap: "16px", justifyContent: "center" }}>
            <Link to={`/course/${courseCode}/questions/${chapter}`} className="btn-primary" style={{ textDecoration: "none" }}>
              Back to Levels
            </Link>
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
        <Link to={`/course/${courseCode}/questions/${chapter}`} className="back-link">
           <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
           Back
        </Link>
        <h2 className="quiz-title">
          Chapter {chapter.replace("chapter-", "")} Quiz - <span style={{textTransform: 'capitalize'}}>{level}</span>
        </h2>
        <div style={{ width: "60px" }}></div> {/* Placeholder for balance */}
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
                onClick={() => !verificationResult && setSelectedOption(opt)}
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
          onClick={handleNext}
          disabled={!verificationResult}
        >
          {currentIndex + 1 === totalQ ? "View Score" : "Next Question"}
        </button>
      </div>
    </div>
  );
}

export default StudentQuiz;
