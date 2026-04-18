import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CoursesList({ userRole, onCourseClick, onEditCourse, onAddCourse }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchYear, setSearchYear] = useState("");

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div className="home-search-container" style={{ margin: 0, padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={searchDepartment} 
              onChange={(e) => setSearchDepartment(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--dash-border)', backgroundColor: '#fff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Statistics">Statistics</option>
            </select>
            <select 
              value={searchYear} 
              onChange={(e) => setSearchYear(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--dash-border)', backgroundColor: '#fff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
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
                style={{ backgroundColor: 'var(--dash-danger-bg)', color: 'var(--dash-danger)', border: 'none', padding: '10px 16px', borderRadius: '12px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
                Clear
              </button>
            )}
          </div>
        </div>

        {userRole === "teacher" && (
            <button 
              className="dash-btn" 
              onClick={onAddCourse} 
              style={{ 
                backgroundColor: 'var(--dash-primary)', 
                color: '#fff', 
                padding: '12px 28px', 
                borderRadius: '14px', 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                border: 'none',
                boxShadow: '0 4px 15px rgba(43, 140, 238, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>add_circle</span>
                Add New Course
            </button>
        )}
      </div>

      <div className="courses-container" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px',
        width: '100%'
      }}>
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
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              backgroundColor: 'var(--dash-primary-light)', 
              color: 'var(--dash-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>menu_book</span>
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--dash-text)' }}>{course.title}</h2>
            <p style={{ margin: '0 0 24px 0', color: 'var(--dash-text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>{course.courseCode}</p>

            {userRole === "teacher" && (
              <div className="course-actions" style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button
                  className="dash-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditCourse) onEditCourse(course.courseCode);
                    else navigate(`/edit-course/${course.courseCode}`);
                  }}
                  style={{ flex: 1, backgroundColor: 'var(--dash-bg)', color: 'var(--dash-text-secondary)', border: '1px solid var(--dash-border)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                  Edit
                </button>
                <button
                  className="dash-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCourse(course.courseCode);
                  }}
                  style={{ backgroundColor: 'var(--dash-danger-bg)', color: 'var(--dash-danger)', border: 'none', padding: '10px', borderRadius: '12px', flex: '0 0 44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
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
