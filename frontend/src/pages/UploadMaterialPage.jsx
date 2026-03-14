import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "./materials.css";

function UploadMaterialPage() {
    const { courseCode } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    const fileInputRef = useRef(null);

    const token = localStorage.getItem("token");

    if (!token) {
        navigate("/login", { replace: true });
        return null;
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setFeedback({ type: "", message: "" });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setFeedback({ type: "", message: "" });

        if (!title || !title.trim()) {
            return setFeedback({ type: "error", message: "Please provide a material title." });
        }

        if (!file) {
            return setFeedback({ type: "error", message: "Please select a PDF file." });
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("courseCode", courseCode);
        formData.append("pdf", file);

        setLoading(true);

        try {
            await axios.post(`/api/materials/upload/${courseCode}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            navigate(`/course/${courseCode}`);
        } catch (err) {
            setFeedback({
                type: "error",
                message: err.response?.data?.message || "An error occurred during upload."
            });
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(`/course/${courseCode}`);
    };

    return (
        <div className="materials-page flex-center-wrapper">
            <div className="materials-blob-1"></div>
            <div className="materials-blob-2"></div>

            <div className="upload-container material-card">
                <h2 className="upload-header" style={{ justifyContent: "center", marginBottom: "2rem" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>upload_file</span>
                    Upload to {courseCode}
                </h2>

                {feedback.message && (
                    <div className={`upload-feedback ${feedback.type}`}>
                        {feedback.message}
                    </div>
                )}

                <form className="upload-form" onSubmit={handleUpload}>
                    <div className="upload-form-group">
                        <label>Material Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Chapter 1 Notes"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <div className="upload-form-group">
                        <label>PDF File</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                disabled={loading}
                                className="custom-file-input"
                            />
                            {file && <span className="file-name">{file.name}</span>}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                        <button
                            type="button"
                            className="material-btn btn-secondary"
                            onClick={handleCancel}
                            disabled={loading}
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="material-btn btn-primary"
                            disabled={loading}
                            style={{ flex: 1.5 }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner-small" style={{ margin: "0 auto" }}></div>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">send</span>
                                    Upload
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UploadMaterialPage;
