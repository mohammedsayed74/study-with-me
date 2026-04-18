import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import QuestionBank from "./pages/QuestionBank";
import ChapterLevels from "./pages/ChapterLevels";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

function RootRedirect() {
  const token = localStorage.getItem("token");
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Question Bank and Chapter Levels might still need standalone routes or be integrated later */}
        {/* For now, I'll keep them but the user wants everything in dashboard */}
        <Route
          path="/course/:courseCode/question-bank"
          element={
            <ProtectedRoute>
              <QuestionBank />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseCode/questions/:chapter"
          element={<ProtectedRoute><ChapterLevels /></ProtectedRoute>}
        />

        {/* Redirect any other legacy routes to dashboard */}
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
        <Route path="/add-course" element={<Navigate to="/dashboard" replace />} />
        <Route path="/edit-course/:courseCode" element={<Navigate to="/dashboard" replace />} />
        <Route path="/course/:courseCode" element={<Navigate to="/dashboard" replace />} />
        <Route path="/course/:courseCode/upload" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;