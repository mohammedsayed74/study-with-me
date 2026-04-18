import { Link, useParams, useNavigate } from "react-router-dom";
import "./course.css";

function QuestionBank() {
    const { courseCode } = useParams();
    const navigate = useNavigate();

    const chapters = [
        { id: 1, title: "Chapter 1: Foundations & Core Concepts", description: "Master the fundamental principles and introductory topics." },
        { id: 2, title: "Chapter 2: Intermediate Theory & Analysis", description: "Deep dive into more complex theoretical frameworks and analytical methods." },
        { id: 3, title: "Chapter 3: Advanced Applications & Case Studies", description: "Apply your knowledge to real-world scenarios and advanced problem sets." }
    ];

    return (
        <div className="course-page" style={{ 
            padding: "40px 5%", 
            background: "linear-gradient(135deg, #f8fcff 0%, #eef6ff 100%)",
            minHeight: "100vh",
            display: "block" // Change from flex to block to allow natural scrolling and spacing
        }}>
            {/* Navigation Header */}
            <div style={{ 
                maxWidth: "1200px", 
                margin: "0 auto 40px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between" 
            }}>
                <button 
                    onClick={() => navigate("/dashboard")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#fff",
                        border: "1px solid rgba(43, 140, 238, 0.2)",
                        padding: "10px 20px",
                        borderRadius: "12px",
                        color: "#052859",
                        fontWeight: "700",
                        cursor: "pointer",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                        transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f7ff"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
                    Back to Dashboard
                </button>

                <div style={{ textAlign: "right" }}>
                    <div style={{ 
                        display: "inline-block", 
                        padding: "6px 14px", 
                        background: "rgba(43, 140, 238, 0.1)", 
                        color: "#2b8cee", 
                        borderRadius: "20px", 
                        fontWeight: "800", 
                        fontSize: "0.85rem",
                        letterSpacing: "0.05em",
                        marginBottom: "4px"
                    }}>
                        {courseCode.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Main Title Area */}
            <div style={{ maxWidth: "1200px", margin: "0 auto 48px", textAlign: "left" }}>
                <h1 style={{ 
                    fontSize: "2.5rem", 
                    fontWeight: "800", 
                    color: "#021024", 
                    margin: "0 0 12px 0",
                    letterSpacing: "-0.02em"
                }}>
                    Question Bank
                </h1>
                <p style={{ 
                    fontSize: "1.1rem", 
                    color: "#5483B3", 
                    maxWidth: "600px", 
                    margin: 0,
                    lineHeight: "1.6"
                }}>
                    Access a comprehensive collection of practice questions designed to help you master each chapter and excel in your exams.
                </p>
            </div>

            {/* Chapters Grid */}
            <div style={{ 
                maxWidth: "1200px", 
                margin: "0 auto", 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
                gap: "24px" 
            }}>
                {chapters.map((chapter) => (
                    <div key={chapter.id} className="chapter-card" style={{
                        background: "#fff",
                        borderRadius: "24px",
                        padding: "32px",
                        border: "1px solid rgba(125, 160, 202, 0.15)",
                        boxShadow: "0 10px 25px -5px rgba(43, 140, 238, 0.05)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        {/* Decorative background element */}
                        <div style={{
                            position: "absolute",
                            top: "-20px",
                            right: "-20px",
                            width: "100px",
                            height: "100px",
                            background: "linear-gradient(135deg, rgba(43, 140, 238, 0.05) 0%, rgba(43, 140, 238, 0) 100%)",
                            borderRadius: "50%",
                            zIndex: 0
                        }}></div>

                        <div style={{ position: "relative", zIndex: 1 }}>
                            <div style={{ 
                                width: "48px", 
                                height: "48px", 
                                borderRadius: "14px", 
                                background: "rgba(43, 140, 238, 0.1)", 
                                color: "#2b8cee", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                marginBottom: "20px"
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>menu_book</span>
                            </div>

                            <h2 style={{ 
                                fontSize: "1.25rem", 
                                fontWeight: "800", 
                                color: "#052859", 
                                marginBottom: "12px",
                                lineHeight: "1.4"
                            }}>
                                {chapter.title}
                            </h2>

                            <p style={{ 
                                color: "#5483B3", 
                                fontSize: "0.95rem", 
                                lineHeight: "1.6",
                                marginBottom: "28px"
                            }}>
                                {chapter.description}
                            </p>

                            <Link 
                                to={`/course/${courseCode}/questions/chapter-${chapter.id}`} 
                                className="submit-btn"
                                style={{
                                    textDecoration: "none",
                                    marginTop: "auto",
                                    background: "#2b8cee",
                                    color: "#fff",
                                    borderRadius: "14px",
                                    padding: "14px",
                                    fontWeight: "700",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    boxShadow: "0 4px 14px 0 rgba(43, 140, 238, 0.3)",
                                    border: "none"
                                }}
                            >
                                Start Practice
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Footer/Support Section */}
            <div style={{ 
                maxWidth: "1200px", 
                margin: "80px auto 0", 
                padding: "32px", 
                background: "rgba(255, 255, 255, 0.5)", 
                borderRadius: "24px",
                border: "1px dashed rgba(125, 160, 202, 0.4)",
                textAlign: "center"
            }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#052859", fontSize: "1.1rem", fontWeight: "700" }}>Need more materials?</h3>
                <p style={{ margin: 0, color: "#5483B3", fontSize: "0.95rem" }}>
                    New questions and practice sets are added regularly by instructors. Check back often!
                </p>
            </div>
        </div>
    );
}

export default QuestionBank;