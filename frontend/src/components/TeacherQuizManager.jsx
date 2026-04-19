import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function TeacherQuizManager({ courseCode, chapter, level }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });

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
      } else {
        setError("Failed to fetch questions.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "An error occurred while loading questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuestions();
  }, [courseCode, chapter, level]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      ...formData,
      courseCode,
      chapter: chapter, 
      difficulty: level,
    };

    try {
      if (editingQuestion) {
        await axios.put(`/api/MCQs/${editingQuestion._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`/api/MCQs`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowModal(false);
      setEditingQuestion(null);
      getQuestions();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving question");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/MCQs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getQuestions();
    } catch (err) {
      alert("Error deleting question");
    }
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    });
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid #eee", borderTopColor: "#2b8cee", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", padding: "20px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
           <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <button 
                onClick={() => navigate(`/course/${courseCode}/questions/${chapter}`)}
                style={{ background: "#fff", border: "1px solid #e2e8f0", color: "#052859", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "#052859" }}>
                {courseCode} - {chapter.replace("chapter-", "Chapter ")}
              </h2>
           </div>
           <p style={{ margin: 0, color: "#5483B3", fontWeight: "600" }}>
             Managing <span style={{ textTransform: "capitalize", color: "#2b8cee" }}>{level}</span> difficulty questions
           </p>
        </div>
        <button 
          onClick={openAddModal}
          style={{ 
            background: "#2b8cee", 
            color: "#fff", 
            border: "none", 
            padding: "12px 24px", 
            borderRadius: "12px", 
            fontWeight: "700", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(43, 140, 238, 0.2)"
          }}
        >
          <span className="material-symbols-outlined">add</span>
          Add New Question
        </button>
      </div>

      {error && (
          <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", color: "#dc2626", marginBottom: "24px", fontWeight: "600" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="material-symbols-outlined">error</span>
                  {error}
              </div>
          </div>
      )}

      {/* Questions List */}
      <div style={{ display: "grid", gap: "24px" }}>
        {questions.length === 0 && !error ? (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "#fff", borderRadius: "24px", border: "1px dashed #cbd5e1" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "16px" }}>inventory_2</span>
            <h3 style={{ margin: "0 0 8px 0", color: "#052859" }}>No questions found</h3>
            <p style={{ margin: 0, color: "#5483B3" }}>Start building your question bank by adding your first question above.</p>
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={q._id} style={{ background: "#fff", borderRadius: "24px", padding: "32px", border: "1px solid rgba(125, 160, 202, 0.15)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", position: "relative" }}>
              <div style={{ position: "absolute", top: "24px", right: "24px", display: "flex", gap: "8px" }}>
                <button 
                    onClick={() => openEditModal(q)}
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                </button>
                <button 
                    onClick={() => handleDelete(q._id)}
                    style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                </button>
              </div>

              <div style={{ padding: "4px 12px", background: "rgba(43, 140, 238, 0.05)", color: "#2b8cee", borderRadius: "8px", fontWeight: "800", fontSize: "0.75rem", display: "inline-block", marginBottom: "16px" }}>
                QUESTION {index + 1}
              </div>
              
              <h3 style={{ margin: "0 0 24px 0", fontSize: "1.25rem", fontWeight: "700", color: "#021024", paddingRight: "100px", lineHeight: "1.5" }}>
                {q.questionText}
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                {q.options.map((opt, i) => {
                  const isCorrect = opt === q.correctAnswer;
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        padding: "16px", 
                        borderRadius: "12px", 
                        background: isCorrect ? "#f0fdf4" : "#f8fafc",
                        border: isCorrect ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                        color: isCorrect ? "#166534" : "#64748b",
                        fontWeight: isCorrect ? "700" : "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}
                    >
                      <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: isCorrect ? "#10b981" : "#cbd5e1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {isCorrect && <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span>}
                    </div>
                  );
                })}
              </div>
              
              {q.explanation && (
                <div style={{ marginTop: "24px", padding: "16px", background: "#f1f5f9", borderRadius: "12px", fontSize: "0.9rem", color: "#475569", borderLeft: "4px solid #cbd5e1" }}>
                  <strong style={{ color: "#052859", display: "block", marginBottom: "4px" }}>Explanation:</strong> 
                  {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2, 16, 36, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "32px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "40px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <h2 style={{ marginTop: 0, marginBottom: "24px", fontSize: "1.5rem", fontWeight: "800", color: "#052859" }}>
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </h2>
            <form onSubmit={handleSave} style={{ display: "grid", gap: "20px" }}>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.85rem", color: "#5483B3", textTransform: "uppercase" }}>Question Text</label>
                <textarea
                  style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid #cbd5e1", outline: "none", fontFamily: "inherit", fontSize: "1rem", resize: "vertical" }}
                  rows="3"
                  placeholder="Enter the question here..."
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {formData.options.map((opt, i) => (
                    <div key={i}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.85rem", color: "#5483B3", textTransform: "uppercase" }}>Option {String.fromCharCode(65 + i)}</label>
                    <input
                        type="text"
                        style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none" }}
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        required
                    />
                    </div>
                ))}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.85rem", color: "#5483B3", textTransform: "uppercase" }}>Correct Answer</label>
                <select
                  style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid #cbd5e1", outline: "none", appearance: "none", background: "#fff" }}
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  required
                >
                  <option value="" disabled>Select the correct option</option>
                  {formData.options.filter(o => o.trim() !== "").map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.85rem", color: "#5483B3", textTransform: "uppercase" }}>Explanation</label>
                <textarea
                  style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid #cbd5e1", outline: "none", fontFamily: "inherit", fontSize: "0.95rem", resize: "vertical" }}
                  rows="2"
                  placeholder="Explain why this is the correct answer..."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="button" style={{ background: "#f1f5f9", border: "none", color: "#64748b", padding: "14px 24px", borderRadius: "14px", fontWeight: "700", cursor: "pointer" }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={{ background: "#2b8cee", color: "#fff", border: "none", padding: "14px 32px", borderRadius: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 16px rgba(43, 140, 238, 0.2)" }}>
                  {editingQuestion ? "Update Question" : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherQuizManager;
