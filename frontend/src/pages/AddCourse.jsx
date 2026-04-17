import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./course.css";

function AddCourse() {
    const [title, setTitle] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [department, setDepartment] = useState('Computer Science');
    const [year, setYear] = useState(1);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const token = localStorage.getItem("token");

            await axios.post(
                "/api/courses",
                { title, courseCode, description, department, year },
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
                            placeholder="E.g. Software Engineering"
                        />
                    </div>

                    <div className="form-group">
                        <label>Course Code</label>
                        <input
                            type="text"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            required
                            placeholder="E.g. CS303"
                        />
                    </div>

                    <div className="form-group">
                        <label>Department</label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                        >
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Statistics">Statistics</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Academic Year</label>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            required
                        >
                            <option value={1}>Year 1</option>
                            <option value={2}>Year 2</option>
                            <option value={3}>Year 3</option>
                            <option value={4}>Year 4</option>
                        </select>
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
