import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./dashboard.css";
import StudentDashboard from "../components/dashboard/StudentDashboard";
import DoctorDashboard from "../components/dashboard/DoctorDashboard";
import CoursesList from "../components/dashboard/CoursesList";
import ProfileView from "../components/dashboard/ProfileView";
import MaterialsView from "../components/dashboard/MaterialsView";
import AddCourseView from "../components/dashboard/AddCourseView";
import EditCourseView from "../components/dashboard/EditCourseView";
import UploadMaterialView from "../components/dashboard/UploadMaterialView";
import ResetPasswordView from "../components/dashboard/ResetPasswordView";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedCourseCode, setSelectedCourseCode] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setUser({ ...data.user });
        } else {
          localStorage.removeItem("token");
          navigate("/");
        }
      } catch (err) {
        console.error("Profile fetch error", err);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  if (!user) return null;

  const isTeacher = user.role === "teacher";

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const openCourse = (courseCode) => {
    setSelectedCourseCode(courseCode);
    setActiveView("materials");
  };

  const openEditCourse = (courseCode) => {
    setSelectedCourseCode(courseCode);
    setActiveView("editCourse");
  };

  const openUpload = (courseCode) => {
    setSelectedCourseCode(courseCode);
    setActiveView("upload");
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return isTeacher ? (
          <DoctorDashboard token={token} />
        ) : (
          <StudentDashboard token={token} />
        );
      case "courses":
        return <CoursesList 
          userRole={user.role} 
          onCourseClick={openCourse} 
          onAddCourse={() => setActiveView("addCourse")}
          onEditCourse={openEditCourse}
        />;
      case "materials":
        return <MaterialsView 
          courseCode={selectedCourseCode} 
          onBack={() => setActiveView("courses")} 
          onUpload={() => openUpload(selectedCourseCode)}
          onQuestionBank={() => navigate(`/course/${selectedCourseCode}/question-bank`)}
        />;
      case "profile":
        return <ProfileView onResetPassword={() => setActiveView("resetPassword")} />;
      case "addCourse":
        return <AddCourseView 
          onSuccess={() => setActiveView("courses")} 
          onCancel={() => setActiveView("courses")} 
        />;
      case "editCourse":
        return <EditCourseView 
          courseCode={selectedCourseCode} 
          onSuccess={() => setActiveView("courses")} 
          onCancel={() => setActiveView("courses")} 
        />;
      case "upload":
        return <UploadMaterialView 
          courseCode={selectedCourseCode} 
          onSuccess={() => setActiveView("materials")} 
          onCancel={() => setActiveView("materials")} 
        />;
      case "resetPassword":
        return <ResetPasswordView 
          onSuccess={() => setActiveView("profile")} 
          onCancel={() => setActiveView("profile")} 
        />;
      default:
        return <DoctorDashboard token={token} />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeView) {
      case "dashboard": return isTeacher ? "Instructor Dashboard" : "Student Dashboard";
      case "courses": return "Courses Catalog";
      case "materials": return `Materials: ${selectedCourseCode}`;
      case "profile": return "My Profile";
      case "addCourse": return "Create New Course";
      case "editCourse": return `Edit Course: ${selectedCourseCode}`;
      case "upload": return `Upload to ${selectedCourseCode}`;
      case "resetPassword": return "Security Settings";
      default: return "Dashboard";
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Toggle Button */}
      <button className="dash-mobile-toggle" onClick={toggleSidebar}>
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Mobile Overlay */}
      <div className={`dash-overlay ${sidebarOpen ? "visible" : ""}`} onClick={closeSidebar}></div>

      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="dash-sidebar-brand">
          <div className="dash-sidebar-brand-icon">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h2>Study With Me</h2>
          </div>
        </div>

        <nav className="dash-sidebar-nav">
          <div className="dash-nav-section-label">Main</div>
          <button className={`dash-nav-item ${activeView === "dashboard" ? "active" : ""}`} onClick={() => { setActiveView("dashboard"); closeSidebar(); }}>
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </button>
          <button className={`dash-nav-item ${activeView === "courses" ? "active" : ""}`} onClick={() => { setActiveView("courses"); closeSidebar(); }}>
            <span className="material-symbols-outlined">library_books</span>
            Courses
          </button>
          <div className="dash-nav-section-label">{isTeacher ? "Instructor Tools" : "My Stuffs"}</div>
          <button className={`dash-nav-item ${activeView === "profile" ? "active" : ""}`} onClick={() => { setActiveView("profile"); closeSidebar(); }}>
            <span className="material-symbols-outlined">person</span>
            Profile
          </button>
        </nav>

        <div className="dash-sidebar-footer">
          <button onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <h1>{getHeaderTitle()}</h1>
            <p>Welcome back! Here is your latest overview.</p>
          </div>
          <div className="dash-topbar-right">
            <div className="dash-topbar-user">
              <div className="dash-topbar-user-name">Hello {user.name || "User"}</div>
              <div className="dash-topbar-user-role">{user.role}</div>
            </div>
          </div>
        </header>

        <div className="dash-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
