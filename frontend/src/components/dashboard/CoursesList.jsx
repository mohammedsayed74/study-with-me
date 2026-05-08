import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CoursesList({ userRole, onCourseClick, onEditCourse, onAddCourse, showOnlyFollowing = false }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchYear, setSearchYear] = useState("");

  // 🟢 FOLLOW FEATURE ADDED
  const [following, setFollowing] = useState([]);

  const toggleFollow = async (courseCode) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/users/toggle-follow",
        { courseCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowing(res.data.followedCourses);
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  const filteredCourses = courses.filter((course) => {
    let match = true;
    if (showOnlyFollowing && !following.includes(course.courseCode)) match = false;
    if (searchDepartment) match = match && course.department === searchDepartment;
    if (searchYear) match = match && course.year === Number(searchYear);
    return match;
  });

  useEffect(() => {
    getCourses();
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowing(res.data.user?.followedCourses || []);
    } catch (err) {
      console.log("Error fetching profile for follows:", err);
    }
  };

  const getCourses = async () => {
    try {
      const res = await axios.get("/api/courses/allCourses");
      setCourses(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteCourse = async (courseCode) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/courses/${courseCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getCourses();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="courses-list-component" style={{ width: '100%' }}>
      
      {/* SEARCH + FILTER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        
        <div className="home-search-container" style={{ margin: 0, padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            
            <select 
              value={searchDepartment} 
              onChange={(e) => setSearchDepartment(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--dash-border)' }}
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Statistics">Statistics</option>
            </select>

            <select 
              value={searchYear} 
              onChange={(e) => setSearchYear(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--dash-border)' }}
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>

            {(searchDepartment || searchYear) && (
              <button
                className="dash-btn"
                onClick={() => {
                  setSearchDepartment("");
                  setSearchYear("");
                }}
                style={{ backgroundColor: 'var(--dash-danger-bg)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {userRole === "teacher" && (
          <button className="dash-btn" onClick={onAddCourse}>
            Add New Course
          </button>
        )}
      </div>

      {/* COURSES GRID */}
      <div className="courses-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        
        {filteredCourses.map((course) => (
          <div
            key={course.courseCode}
            className="course-card"
            onClick={() => onCourseClick ? onCourseClick(course.courseCode) : navigate(`/course/${course.courseCode}`)}
            style={{
              backgroundColor: '#fff',
              padding: '28px',
              borderRadius: '24px',
              border: '1px solid var(--dash-border)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            
            {/* 🟢 FOLLOW HEART ICON */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleFollow(course.courseCode);
              }}
              style={{
                position: 'absolute',
                top: '28px',
                right: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: following.includes(course.courseCode) ? '#FFC107' : 'var(--dash-text-muted)',
                transition: 'color 0.3s ease, transform 0.2s ease',
                transform: following.includes(course.courseCode) ? 'scale(1.1)' : 'scale(1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = following.includes(course.courseCode) ? 'scale(1.1)' : 'scale(1)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px', fontVariationSettings: following.includes(course.courseCode) ? "'FILL' 1" : "'FILL' 0" }}>
                star
              </span>
            </div>

            {/* ICON */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'var(--dash-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <span className="material-symbols-outlined">menu_book</span>
            </div>

            {/* TITLE */}
            <h2 style={{ margin: '0 0 8px 0' }}>{course.title}</h2>

            <p style={{ margin: '0 0 12px 0', color: 'var(--dash-text-muted)' }}>
              {course.courseCode}
            </p>

            {/* TEACHER ACTIONS */}
            {userRole === "teacher" && (
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditCourse) onEditCourse(course.courseCode);
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCourse(course.courseCode);
                  }}
                >
                  Delete
                </button>

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoursesList;