import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "./course.css";

function EditCourse() {
    const { courseCode } = useParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourseDetails();
    }, [courseCode]);

    const fetchCourseDetails = async () => {
        try {
            const res = await axios.get(`/api/courses/${courseCode}`);
            const course = res.data.data;
            setTitle(course.title);
            setDescription(course.description);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching course details");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `/api/courses/${courseCode}`,
                { title, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate("/home");
        } catch (err) {
            setError(err.response?.data?.message || "Error updating course");
        }
    };

    if (loading) {
        return (
            <div className="course-page">
                <div className="course-container">
                    <h2 style={{ textAlign: "center" }}>Loading...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="course-page">
            <div className="course-container">
                <h1>Edit Course: {courseCode}</h1>
                {error && <div className="error-message">{error}</div>}

                <form className="course-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Course Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Update Course
                    </button>
                </form>

                <Link to="/home" className="back-link">
                    Cancel and Return
                </Link>
            </div>
        </div>
    );
}

export default EditCourse;
