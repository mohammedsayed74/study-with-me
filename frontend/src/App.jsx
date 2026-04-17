import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import AddCourse from "./pages/AddCourse";
import EditCourse from "./pages/EditCourse";
import UserProfile from "./pages/UserProfile";
import ResetPassword from "./pages/ResetPassword";
import CourseMaterials from "./pages/CourseMaterials";
import UploadMaterialPage from "./pages/UploadMaterialPage";
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
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-course"
          element={
            <ProtectedRoute>
              <AddCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-course/:courseCode"
          element={
            <ProtectedRoute>
              <EditCourse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseCode"
          element={
            <ProtectedRoute>
              <CourseMaterials />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseCode/upload"
          element={
            <ProtectedRoute>
              <UploadMaterialPage />
            </ProtectedRoute>
          }
        />


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

      </Routes>
    </BrowserRouter>
  );


}

export default App;