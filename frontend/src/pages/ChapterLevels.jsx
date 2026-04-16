import { useParams, Link } from "react-router-dom";
import "./course.css";

function ChapterLevels() {
    const { courseCode, chapter } = useParams();

    return (
        <div className="course-page">
            <div className="course-container">

                <h1>{chapter} Levels</h1>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                    <Link
                        to={`/course/${courseCode}/questions/${chapter}/easy`}
                        className="submit-btn"
                    >
                        Easy
                    </Link>

                    <Link
                        to={`/course/${courseCode}/questions/${chapter}/medium`}
                        className="submit-btn"
                    >
                        Medium
                    </Link>

                    <Link
                        to={`/course/${courseCode}/questions/${chapter}/hard`}
                        className="submit-btn"
                    >
                        Hard
                    </Link>

                </div>

                <Link to={`/course/${courseCode}/question-bank`} className="back-link">
                    Back
                </Link>

            </div>
        </div>
    );
}

export default ChapterLevels;