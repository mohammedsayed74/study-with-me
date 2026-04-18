import { useParams, Link, useNavigate } from "react-router-dom";
import "./course.css";

function ChapterLevels() {
    const { courseCode, chapter } = useParams();
    const navigate = useNavigate();

    const levels = [
        { id: "easy", title: "Easy", color: "#10b981", icon: "sentiment_satisfied", description: "Basic concepts and straightforward questions to build confidence." },
        { id: "medium", title: "Medium", color: "#f59e0b", icon: "sentiment_neutral", description: "Balanced challenge focusing on application and logical reasoning." },
        { id: "hard", title: "Hard", color: "#ef4444", icon: "sentiment_very_dissatisfied", description: "Complex scenarios and advanced problems for mastery." }
    ];

    const formattedChapter = chapter.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="course-page" style={{ 
            padding: "40px 5%", 
            background: "linear-gradient(135deg, #f8fcff 0%, #eef6ff 100%)",
            minHeight: "100vh",
            display: "block"
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
                    onClick={() => navigate(`/course/${courseCode}/question-bank`)}
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
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
                    Back to Chapters
                </button>

                <div style={{ textAlign: "right", display: "flex", gap: "10px" }}>
                    <div style={{ padding: "6px 14px", background: "#fff", border: "1px solid rgba(43, 140, 238, 0.1)", color: "#5483B3", borderRadius: "12px", fontWeight: "700", fontSize: "0.85rem" }}>
                        {courseCode.toUpperCase()}
                    </div>
                    <div style={{ padding: "6px 14px", background: "rgba(43, 140, 238, 0.1)", color: "#2b8cee", borderRadius: "12px", fontWeight: "800", fontSize: "0.85rem" }}>
                        {formattedChapter}
                    </div>
                </div>
            </div>

            {/* Main Title Area */}
            <div style={{ maxWidth: "1200px", margin: "0 auto 48px", textAlign: "center" }}>
                <h1 style={{ 
                    fontSize: "2.2rem", 
                    fontWeight: "800", 
                    color: "#021024", 
                    margin: "0 0 12px 0",
                    letterSpacing: "-0.02em"
                }}>
                    Select Difficulty Level
                </h1>
                <p style={{ 
                    fontSize: "1.1rem", 
                    color: "#5483B3", 
                    maxWidth: "600px", 
                    margin: "0 auto",
                    lineHeight: "1.6"
                }}>
                    Choose a level that matches your current understanding. You can always try harder levels as you progress.
                </p>
            </div>

            {/* Levels Grid */}
            <div style={{ 
                maxWidth: "1100px", 
                margin: "0 auto", 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
                gap: "30px" 
            }}>
                {levels.map((level) => (
                    <Link
                        key={level.id}
                        to={`/course/${courseCode}/quiz/${chapter}/${level.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <div style={{
                            background: "#fff",
                            borderRadius: "28px",
                            padding: "40px 32px",
                            border: "1px solid rgba(125, 160, 202, 0.15)",
                            boxShadow: "0 10px 30px -5px rgba(0,0,0,0.05)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            height: "100%",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden"
                        }}
                        className="level-card"
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = "translateY(-8px)";
                            e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(0,0,0,0.1)";
                            e.currentTarget.style.borderColor = level.color;
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 10px 30px -5px rgba(0,0,0,0.05)";
                            e.currentTarget.style.borderColor = "rgba(125, 160, 202, 0.15)";
                        }}
                    >
                            <div style={{ 
                                width: "70px", 
                                height: "70px", 
                                borderRadius: "22px", 
                                background: `${level.color}15`, 
                                color: level.color, 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                marginBottom: "24px"
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "36px" }}>{level.icon}</span>
                            </div>

                            <h2 style={{ 
                                fontSize: "1.5rem", 
                                fontWeight: "800", 
                                color: "#052859", 
                                marginBottom: "12px"
                            }}>
                                {level.title}
                            </h2>

                            <p style={{ 
                                color: "#5483B3", 
                                fontSize: "1rem", 
                                lineHeight: "1.6",
                                marginBottom: "32px",
                                flexGrow: 1
                            }}>
                                {level.description}
                            </p>

                            <div style={{
                                width: "100%",
                                padding: "14px",
                                borderRadius: "16px",
                                background: level.color,
                                color: "#fff",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                boxShadow: `0 8px 16px -4px ${level.color}60`
                            }}>
                                Practice {level.title}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default ChapterLevels;