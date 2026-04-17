import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./dashboard.css";
import StudentDashboard from "../components/dashboard/StudentDashboard";
import DoctorDashboard from "../components/dashboard/DoctorDashboard";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (e) {
      console.error("Invalid token", e);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [token, navigate]);

  if (!user) return null;

  const isTeacher = user.role === "teacher";

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Toggle Button */}
      <button className="dash-mobile-toggle" onClick={toggleSidebar}>
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Mobile Overlay */}
      <div
        className={`dash-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="dash-sidebar-brand">
          <div className="dash-sidebar-brand-icon">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h2>Material Archive</h2>
            <span>Dashboard</span>
          </div>
        </div>

        <nav className="dash-sidebar-nav">
          <div className="dash-nav-section-label">Main</div>

          <button className="dash-nav-item active">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </button>

          <Link to="/home" className="dash-nav-item" onClick={closeSidebar}>
            <span className="material-symbols-outlined">library_books</span>
            All Courses
          </Link>

          <div className="dash-nav-section-label">
            {isTeacher ? "Instructor Tools" : "My Stuffs"}
          </div>

          <Link to="/profile" className="dash-nav-item" onClick={closeSidebar}>
            <span className="material-symbols-outlined">person</span>
            Profile
          </Link>
        </nav>

        <div className="dash-sidebar-footer">
          <button onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dash-main">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <h1>{isTeacher ? "Instructor Dashboard" : "Student Dashboard"}</h1>
            <p>Welcome back! Here is your latest overview.</p>
          </div>
          <div className="dash-topbar-right">
            <div className="dash-topbar-user">
              <div className="dash-topbar-user-name">My Account</div>
              <div className="dash-topbar-user-role">{user.role}</div>
            </div>
            <Link to="/profile" className="dash-topbar-avatar">
              <span className="material-symbols-outlined">person</span>
            </Link>
          </div>
        </header>

        <div className="dash-content">
          {isTeacher ? (
            <DoctorDashboard token={token} />
          ) : (
            <StudentDashboard token={token} />
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
