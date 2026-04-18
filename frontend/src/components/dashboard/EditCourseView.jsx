import { useState, useEffect } from "react";
import axios from "axios";

function EditCourseView({ courseCode, onSuccess, onCancel }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchCourseDetails();
    }, [courseCode]);

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

            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Error updating course");
        }
    };

    if (loading) {
        return (
            <div className="dash-empty" style={{ padding: '100px 0', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p>Loading course details...</p>
            </div>
        );
    }

    return (
        <div className="course-view-container" style={{ width: '100%' }}>
            <div className="dash-card" style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid var(--dash-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 32px 0', fontSize: '1.6rem', fontWeight: 800, color: 'var(--dash-text)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: 'var(--dash-primary-light)', color: 'var(--dash-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "30px" }}>edit</span>
                    </div>
                    Edit Course: {courseCode}
                </h1>

                {error && (
                    <div style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        marginBottom: '24px', 
                        backgroundColor: 'var(--dash-danger-bg)', 
                        color: 'var(--dash-danger)', 
                        fontWeight: 600,
                        border: '1px solid var(--dash-danger)22'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--dash-text-secondary)' }}>Course Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--dash-border)', outline: 'none', fontSize: '1rem', backgroundColor: '#fcfdfe' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--dash-text-secondary)' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={6}
                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--dash-border)', outline: 'none', fontSize: '1rem', backgroundColor: '#fcfdfe', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button type="submit" className="dash-btn" style={{ flex: 1.5, padding: '16px', color: '#fff', backgroundColor: 'var(--dash-primary)', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 15px rgba(43, 140, 238, 0.3)', cursor: 'pointer' }}>
                            Update Course
                        </button>
                        <button type="button" onClick={onCancel} className="dash-btn" style={{ flex: 1, padding: '16px', backgroundColor: 'var(--dash-danger-bg)', color: 'var(--dash-danger)', border: '1px solid var(--dash-danger)22', borderRadius: '14px', fontWeight: 600, cursor: 'pointer' }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditCourseView;
