import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./home.css"

function Home() {

  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    } catch (err) {
      console.log("Error decoding token", err);
    }

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
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`/api/courses/${courseCode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      getCourses();

    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (

    <div className="home-page">
      <div className="home-blob-1"></div>
      <div className="home-blob-2"></div>

      <div className="home-header">

        <div className="home-header-title">
          <div className="home-brand-icon">
            <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
              school
            </span>
          </div>
          <h1>Study With Me Courses</h1>
        </div>

        <div className="home-actions">

          {userRole === 'teacher' && (
            <button
              className="add-course"
              onClick={() => navigate("/add-course")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
              Add Course
            </button>
          )}

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>logout</span>
          </button>

        </div>

      </div>

      <div className="courses-container">

        {courses.map((course) => (

          <div
            key={course._id}
            className="course-card"
            onClick={() => navigate(`/course/${course._id}`)}
          >

            <h2>{course.title}</h2>

            <p>{course.courseCode}</p>

            {userRole === 'teacher' && (
              <div className="course-actions">
                <button
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit-course/${course.courseCode}`);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCourse(course.courseCode);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
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

export default Home;