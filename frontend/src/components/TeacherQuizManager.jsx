import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function TeacherQuizManager({ courseCode, chapter, level }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });

  const getQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      // Use chapter number if it's like 'chapter-1'
      const chapterNumber = chapter.split("-")[1] || chapter;

      const res = await axios.get(
        `/api/MCQs?courseCode=${courseCode}&chapter=${chapterNumber}&difficulty=${level}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const chapterNumber = chapter.split("-")[1] || chapter;

    const payload = {
      ...formData,
      courseCode,
      chapter: chapterNumber,
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

  if (loading) return <div className="quiz-container">Loading...</div>;

  return (
    <>
    <div className="quiz-container">
      <div className="quiz-header">
        <h2 className="quiz-title">
          {courseCode} - Chapter {chapter.replace("chapter-", "")} ({level})
        </h2>
        <div className="teacher-actions">
          <Link to={`/course/${courseCode}/questions/${chapter}`} className="back-link" style={{ marginRight: '16px' }}>
             <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
             Back
          </Link>
          <button className="btn-primary" onClick={openAddModal}>
            + Add Question
          </button>
        </div>
      </div>

      <div className="questions-list">
        {questions.length === 0 ? (
          <p>No questions found for this level.</p>
        ) : (
          questions.map((q, index) => (
            <div key={q._id} className="question-card">
              <div className="card-actions">
                <button className="icon-btn" onClick={() => openEditModal(q)}>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                </button>
                <button className="icon-btn delete" onClick={() => handleDelete(q._id)}>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                </button>
              </div>
              
              <h3 className="question-text" style={{ marginTop: 0, marginBottom: "16px" }}>
                Q{index + 1}: {q.questionText}
              </h3>
              
              <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                {q.options.map((opt, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: "8px", 
                      borderRadius: "6px", 
                      background: opt === q.correctAnswer ? "rgba(46, 204, 113, 0.1)" : "rgba(0,0,0,0.02)",
                      border: opt === q.correctAnswer ? "1px solid #2ecc71" : "1px solid #eee",
                      color: opt === q.correctAnswer ? "#27ae60" : "inherit",
                      fontWeight: opt === q.correctAnswer ? "600" : "normal"
                    }}
                  >
                    {String.fromCharCode(65 + i)}: {opt} {opt === q.correctAnswer && "(Correct)"}
                  </div>
                ))}
              </div>
              
              {q.explanation && (
                <div style={{ marginTop: "16px", fontSize: "14px", color: "#7f8c8d" }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginTop: 0 }}>{editingQuestion ? "Edit Question" : "Add Question"}</h2>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div className="form-group">
                <label>Question Text</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  required
                />
              </div>

              {formData.options.map((opt, i) => (
                <div className="form-group" key={i}>
                  <label>Option {String.fromCharCode(65 + i)}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    required
                  />
                </div>
              ))}

              <div className="form-group">
                <label>Correct Answer (Must match one option exactly)</label>
                <select
                  className="form-control"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Correct Answer</option>
                  {formData.options.filter(o => o.trim() !== "").map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Explanation</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" className="btn-primary" style={{ background: "#95a5a6" }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default TeacherQuizManager;
