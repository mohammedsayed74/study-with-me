import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import TeacherQuizManager from "../components/TeacherQuizManager";
import StudentQuiz from "../components/StudentQuiz";
import "./quiz.css";

function QuizArea() {
  const { courseCode, chapter, level } = useParams();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      } catch (err) {
        console.error("Error decoding token", err);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="quiz-page">Loading...</div>;
  }

  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="quiz-page">
      {userRole === "teacher" ? (
        <TeacherQuizManager courseCode={courseCode} chapter={chapter} level={level} />
      ) : (
        <StudentQuiz courseCode={courseCode} chapter={chapter} level={level} />
      )}
    </div>
  );
}

export default QuizArea;
