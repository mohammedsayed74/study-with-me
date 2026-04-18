import { useState, useRef } from "react";
import axios from "axios";

function UploadMaterialView({ courseCode, onSuccess, onCancel }) {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const fileInputRef = useRef(null);
    const token = localStorage.getItem("token");

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
            if (onSuccess) onSuccess();
        } catch (err) {
            setFeedback({
                type: "error",
                message: err.response?.data?.message || "An error occurred during upload."
            });
            setLoading(false);
        }
    };

    return (
        <div className="upload-view-container" style={{ width: '100%' }}>
            <div className="dash-card" style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid var(--dash-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 32px 0', fontSize: '1.6rem', fontWeight: 800, color: 'var(--dash-text)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: 'var(--dash-primary-light)', color: 'var(--dash-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "30px" }}>upload_file</span>
                    </div>
                    Upload to {courseCode}
                </h2>

                {feedback.message && (
                    <div style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        marginBottom: '24px', 
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        backgroundColor: feedback.type === 'error' ? 'var(--dash-danger-bg)' : 'var(--dash-success-bg)',
                        color: feedback.type === 'error' ? 'var(--dash-danger)' : 'var(--dash-success)',
                        border: `1px solid ${feedback.type === 'error' ? 'var(--dash-danger)' : 'var(--dash-success)'}22`
                    }}>
                        {feedback.message}
                    </div>
                )}

                <form onSubmit={handleUpload}>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--dash-text-secondary)' }}>Material Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Chapter 1 Notes"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                padding: '14px 18px', 
                                borderRadius: '14px', 
                                border: '1px solid var(--dash-border)', 
                                outline: 'none',
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                                backgroundColor: '#fcfdfe'
                            }}
                            autoFocus
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--dash-text-secondary)' }}>PDF File</label>
                        <div style={{ 
                            border: '2px dashed var(--dash-border)', 
                            padding: '24px', 
                            borderRadius: '16px', 
                            textAlign: 'center',
                            backgroundColor: '#fcfdfe',
                            position: 'relative'
                        }}>
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                disabled={loading}
                                style={{ 
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: 0,
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            />
                            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--dash-text-muted)', marginBottom: '10px' }}>cloud_upload</span>
                            <div style={{ fontWeight: 600, color: 'var(--dash-text-secondary)' }}>
                                {file ? file.name : "Click or drag PDF here to upload"}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "14px" }}>
                        <button
                            type="submit"
                            className="dash-btn"
                            disabled={loading}
                            style={{ 
                                flex: 1.5, 
                                padding: '14px', 
                                color: '#fff', 
                                backgroundColor: 'var(--dash-primary)', 
                                border: 'none', 
                                borderRadius: '14px', 
                                fontWeight: 700, 
                                fontSize: '1rem',
                                boxShadow: '0 4px 15px rgba(43, 140, 238, 0.3)',
                                cursor: 'pointer'
                            }}
                        >
                            {loading ? "Uploading..." : "Upload Material"}
                        </button>
                        <button
                            type="button"
                            className="dash-btn"
                            onClick={onCancel}
                            disabled={loading}
                            style={{ 
                                flex: 1, 
                                padding: '14px', 
                                backgroundColor: 'var(--dash-danger-bg)', 
                                color: 'var(--dash-danger)', 
                                border: '1px solid var(--dash-danger)22', 
                                borderRadius: '14px', 
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UploadMaterialView;
