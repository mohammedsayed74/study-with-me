import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./home.css"

function Home() {

  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }

    getCourses();

  }, []);

  const getCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/courses");
      setCourses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteCourse = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/courses/${id}`, {
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

      <div className="home-header">

        <h1>Study With Me Courses</h1>

        <div className="home-actions">

          <button
            className="add-course"
            onClick={() => navigate("/add-course")}
          >
            + Add Course
          </button>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
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

            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteCourse(course._id);
              }}
            >
              🗑
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Home;