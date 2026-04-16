import { Link, useParams } from "react-router-dom";
import "./course.css";

function QuestionBank() {
    const { courseCode } = useParams();

    return (
        <div className="course-page">
            <div className="course-container">

                <h1>Question Bank</h1>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                    <Link to={`/course/${courseCode}/questions/chapter-1`} className="submit-btn">
                        Chapter 1 Practice
                    </Link>

                    <Link to={`/course/${courseCode}/questions/chapter-2`} className="submit-btn">
                        Chapter 2 Practice
                    </Link>

                    <Link to={`/course/${courseCode}/questions/chapter-3`} className="submit-btn">
                        Chapter 3 Practice
                    </Link>

                </div>

            </div>
        </div>
    );
}

export default QuestionBank;