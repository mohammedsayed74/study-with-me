import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function StudentQuiz({ courseCode, chapter, level }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const quizStateKey = `quiz_${courseCode}_${chapter}_${level}`;

  const loadInitialState = () => {
    const saved = localStorage.getItem(quizStateKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse quiz state", e);
      }
    }
    return {
      answers: {}, 
      currentIndex: 0,
      quizFinished: false
    };
  };

  const [quizState, setQuizState] = useState(loadInitialState);

  useEffect(() => {
    localStorage.setItem(quizStateKey, JSON.stringify(quizState));
  }, [quizState, quizStateKey]);

  const { answers, currentIndex, quizFinished } = quizState;

  const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
  const incorrectCount = Object.values(answers).filter(a => a.selectedOption && !a.isCorrect).length;

  const currentAnswer = answers[currentIndex] || {};
  const selectedOption = currentAnswer.selectedOption || "";
  const verificationResult = currentAnswer.verificationResult || null;

  const getQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.get(
        `/api/MCQs?courseCode=${courseCode}&chapter=${chapter}&difficulty=${level}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setQuestions(res.data.data || []);
        if (res.data.data.length === 0) {
          setError("No questions found for this level yet.");
        }
      } else {
        setError("Failed to fetch questions.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred while loading the quiz.");
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
      
      setQuizState(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [prev.currentIndex]: {
            ...prev.answers[prev.currentIndex],
            verificationResult: { isCorrect, explanation, correctAnswer },
            isCorrect
          }
        }
      }));
      
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

  const handleResetQuiz = () => {
    const newState = {
      answers: {},
      currentIndex: 0,
      quizFinished: false
    };
    setQuizState(newState);
    localStorage.setItem(quizStateKey, JSON.stringify(newState));
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fcff" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ width: "50px", height: "50px", border: "5px solid #eee", borderTopColor: "#2b8cee", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }}></div>
          <p style={{ color: "#5483B3", fontWeight: "600" }}>Preparing your quiz...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fcff", padding: "20px" }}>
        <div style={{ 
          maxWidth: "500px", 
          width: "100%", 
          background: "#fff", 
          padding: "40px", 
          borderRadius: "24px", 
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          border: "1px solid rgba(125, 160, 202, 0.2)"
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#cbd5e1", marginBottom: "20px" }}>quiz</span>
          <h2 style={{ color: "#052859", marginBottom: "12px", fontSize: "1.5rem" }}>{error || "No Questions Found"}</h2>
          <p style={{ color: "#5483B3", marginBottom: "30px", lineHeight: "1.6" }}>
            We couldn't find any questions for this chapter and difficulty level yet. Check back soon or try another level!
          </p>
          <button 
            onClick={() => navigate(`/course/${courseCode}/questions/${chapter}`)}
            style={{ 
              background: "#2b8cee", 
              color: "#fff", 
              border: "none", 
              padding: "12px 30px", 
              borderRadius: "12px", 
              fontWeight: "700", 
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(43, 140, 238, 0.2)"
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    return (
      <div style={{ minHeight: "100vh", padding: "40px 5%", background: "#f8fcff" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", background: "#fff", borderRadius: "32px", padding: "60px 40px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.05)", border: "1px solid rgba(125, 160, 202, 0.1)" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#052859", marginBottom: "40px" }}>Quiz Completed!</h2>
          
          <div style={{ position: "relative", width: "180px", height: "180px", margin: "0 auto 40px" }}>
             <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="80" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="90" cy="90" r="80" fill="none" stroke="#2b8cee" strokeWidth="12" 
                        strokeDasharray={502} strokeDashoffset={502 - (502 * percentage / 100)}
                        strokeLinecap="round" transform="rotate(-90 90 90)" />
             </svg>
             <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "2.5rem", fontWeight: "800", color: "#2b8cee" }}>
                {percentage}%
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "400px", margin: "0 auto 40px" }}>
             <div style={{ padding: "20px", background: "#f0fdf4", borderRadius: "20px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#16a34a" }}>{correctCount}</div>
                <div style={{ fontSize: "0.85rem", color: "#166534", fontWeight: "600", textTransform: "uppercase" }}>Correct</div>
             </div>
             <div style={{ padding: "20px", background: "#fef2f2", borderRadius: "20px", border: "1px solid #fecaca" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#dc2626" }}>{incorrectCount}</div>
                <div style={{ fontSize: "0.85rem", color: "#991b1b", fontWeight: "600", textTransform: "uppercase" }}>Incorrect</div>
             </div>
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button 
                onClick={() => setQuizState(prev => ({ ...prev, quizFinished: false, currentIndex: 0 }))} 
                style={{ background: "#fff", border: "1px solid #e2e8f0", color: "#052859", padding: "14px 28px", borderRadius: "14px", fontWeight: "700", cursor: "pointer" }}
            >
              Review Answers
            </button>
            <button 
                onClick={handleResetQuiz} 
                style={{ background: "#2b8cee", color: "#fff", border: "none", padding: "14px 28px", borderRadius: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 16px rgba(43, 140, 238, 0.2)" }}
            >
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
    <div style={{ minHeight: "100vh", background: "#f8fcff", padding: "40px 5%" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <button 
                    onClick={() => navigate(`/course/${courseCode}/questions/${chapter}`)}
                    style={{ background: "#fff", border: "1px solid rgba(125, 160, 202, 0.2)", width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#052859" }}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "#052859" }}>
                        {chapter.replace("chapter-", "Chapter ")} Quiz
                    </h2>
                    <div style={{ fontSize: "0.85rem", color: "#5483B3", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ textTransform: "uppercase" }}>{courseCode}</span>
                        <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#cbd5e1" }}></span>
                        <span style={{ textTransform: "capitalize" }}>{level} Difficulty</span>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.9rem", color: "#5483B3", marginBottom: "8px", fontWeight: "700" }}>
                    Question {currentIndex + 1} of {totalQ}
                </div>
                <div style={{ width: "200px", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${((currentIndex + 1) / totalQ) * 100}%`, height: "100%", background: "#2b8cee", transition: "width 0.3s ease" }}></div>
                </div>
            </div>
        </div>

        {/* Question Area */}
        <div style={{ background: "#fff", borderRadius: "32px", padding: "48px", border: "1px solid rgba(125, 160, 202, 0.15)", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", marginBottom: "32px" }}>
            <div style={{ marginBottom: "40px" }}>
                <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(43, 140, 238, 0.08)", color: "#2b8cee", borderRadius: "12px", fontWeight: "800", fontSize: "0.8rem", marginBottom: "16px" }}>
                    QUESTION {currentIndex + 1}
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#021024", lineHeight: "1.5", margin: 0 }}>
                    {currentQ.questionText}
                </h3>
            </div>

            <div style={{ display: "grid", gap: "16px", marginBottom: "40px" }}>
                {currentQ.options.map((opt, i) => {
                    let border = "1px solid #e2e8f0";
                    let background = "#fff";
                    let icon = null;

                    if (selectedOption === opt) {
                        border = "2px solid #2b8cee";
                        background = "rgba(43, 140, 238, 0.03)";
                    }

                    if (verificationResult) {
                        if (opt === verificationResult.correctAnswer) {
                            border = "2px solid #10b981";
                            background = "#f0fdf4";
                            icon = <span className="material-symbols-outlined" style={{ color: "#10b981", fontSize: "20px" }}>check_circle</span>;
                        } else if (selectedOption === opt && !verificationResult.isCorrect) {
                            border = "2px solid #ef4444";
                            background = "#fef2f2";
                            icon = <span className="material-symbols-outlined" style={{ color: "#ef4444", fontSize: "20px" }}>cancel</span>;
                        }
                    }

                    return (
                        <div
                            key={i}
                            onClick={() => handleOptionSelect(opt)}
                            style={{
                                padding: "20px 24px",
                                borderRadius: "16px",
                                border: border,
                                backgroundColor: background,
                                cursor: verificationResult ? "default" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                transition: "all 0.2s ease",
                                opacity: verificationResult && selectedOption !== opt && verificationResult.correctAnswer !== opt ? 0.5 : 1
                            }}
                        >
                            <div style={{ 
                                width: "32px", 
                                height: "32px", 
                                borderRadius: "8px", 
                                background: selectedOption === opt ? "#2b8cee" : "#f1f5f9", 
                                color: selectedOption === opt ? "#fff" : "#64748b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "800",
                                fontSize: "0.9rem"
                            }}>
                                {String.fromCharCode(65 + i)}
                            </div>
                            <span style={{ fontSize: "1.05rem", fontWeight: "600", color: "#052859", flex: 1 }}>{opt}</span>
                            {icon}
                        </div>
                    );
                })}
            </div>

            {/* Verification Result / Explanation */}
            {verificationResult && (
                <div style={{ 
                    padding: "24px", 
                    borderRadius: "20px", 
                    background: verificationResult.isCorrect ? "#f0fdf4" : "#fff7ed",
                    border: `1px solid ${verificationResult.isCorrect ? "#bbf7d0" : "#ffedd5"}`,
                    marginBottom: "32px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <span className="material-symbols-outlined" style={{ color: verificationResult.isCorrect ? "#10b981" : "#f59e0b" }}>
                            {verificationResult.isCorrect ? "verified" : "info"}
                        </span>
                        <strong style={{ color: verificationResult.isCorrect ? "#166534" : "#9a3412", fontSize: "1.1rem" }}>
                            {verificationResult.isCorrect ? "Correct Solution" : "Learning Note"}
                        </strong>
                    </div>
                    <p style={{ margin: 0, color: verificationResult.isCorrect ? "#166534" : "#9a3412", lineHeight: "1.6", fontSize: "0.95rem" }}>
                        {verificationResult.explanation}
                    </p>
                </div>
            )}

            {/* Actions Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "32px", borderTop: "1px solid #f1f5f9" }}>
                <button 
                    onClick={handlePrevious} 
                    disabled={currentIndex === 0 || isVerifying}
                    style={{ background: "transparent", border: "none", color: currentIndex === 0 ? "#cbd5e1" : "#5483B3", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Previous
                </button>

                {!verificationResult ? (
                    <button 
                        onClick={verifyAnswer}
                        disabled={!selectedOption || isVerifying}
                        style={{ 
                            background: "#2b8cee", 
                            color: "#fff", 
                            border: "none", 
                            padding: "14px 40px", 
                            borderRadius: "14px", 
                            fontWeight: "700", 
                            cursor: "pointer",
                            boxShadow: "0 8px 16px rgba(43, 140, 238, 0.2)",
                            opacity: !selectedOption ? 0.5 : 1
                        }}
                    >
                        {isVerifying ? "Checking..." : "Verify Answer"}
                    </button>
                ) : (
                    <button 
                        onClick={handleNext}
                        style={{ 
                            background: "#021024", 
                            color: "#fff", 
                            border: "none", 
                            padding: "14px 40px", 
                            borderRadius: "14px", 
                            fontWeight: "700", 
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        {currentIndex + 1 === totalQ ? "Finish Quiz" : "Next Question"}
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                )}
            </div>
        </div>

        {/* Footer Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }}></span>
                <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "600" }}>Correct: {correctCount}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }}></span>
                <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "600" }}>Incorrect: {incorrectCount}</span>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default StudentQuiz;
