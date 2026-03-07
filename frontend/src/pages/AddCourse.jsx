import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./course.css";

function AddCourse() {
    const [title, setTitle] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const token = localStorage.getItem("token");

            await axios.post(
                "/api/courses",
                { title, courseCode, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate("/home");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="course-page">
            <div className="course-container">
                <h1>Add New Course</h1>
                {error && <div className="error-message">{error}</div>}

                <form className="course-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Course Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="E.g. Introduction to React"
                        />
                    </div>

                    <div className="form-group">
                        <label>Course Code</label>
                        <input
                            type="text"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            required
                            placeholder="E.g. CS101"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Describe the course..."
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Create Course
                    </button>
                </form>

                <Link to="/home" className="back-link">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default AddCourse;
