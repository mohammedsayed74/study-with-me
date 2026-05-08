import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CoursesList({ userRole, onCourseClick, onEditCourse, onAddCourse }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchYear, setSearchYear] = useState("");

  // 🟢 FOLLOW FEATURE ADDED
  const [following, setFollowing] = useState(() => {
    return JSON.parse(localStorage.getItem("followingCourses")) || [];
  });

  const toggleFollow = (courseCode) => {
    let updated;

    if (following.includes(courseCode)) {
      updated = following.filter(c => c !== courseCode);
    } else {
      updated = [...following, courseCode];
    }

    setFollowing(updated);
    localStorage.setItem("followingCourses", JSON.stringify(updated));
  };

  const filteredCourses = courses.filter((course) => {
    let match = true;
    if (searchDepartment) match = match && course.department === searchDepartment;
    if (searchYear) match = match && course.year === Number(searchYear);
    return match;
  });

  useEffect(() => {
    getCourses();
  }, []);

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
              cursor: 'pointer'
            }}
          >
            
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

            {/* 🟢 FOLLOW BUTTON ADDED HERE */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFollow(course.courseCode);
              }}
              style={{
                marginBottom: '16px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                background: following.includes(course.courseCode)
                  ? 'var(--dash-success)'
                  : 'var(--dash-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                width: 'fit-content'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {following.includes(course.courseCode) ? "check" : "add"}
              </span>

              {following.includes(course.courseCode) ? "Followed" : "Follow"}
            </button>

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