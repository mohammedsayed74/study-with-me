import { useState } from "react";
import axios from "axios";

function AddCourseView({ onSuccess, onCancel }) {
    const [title, setTitle] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [department, setDepartment] = useState('Computer Science');
    const [year, setYear] = useState(1);

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

            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="course-view-container" style={{ width: '100%' }}>
            <div className="dash-card" style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid var(--dash-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 32px 0', fontSize: '1.6rem', fontWeight: 800, color: 'var(--dash-text)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: 'var(--dash-primary-light)', color: 'var(--dash-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "30px" }}>add_circle</span>
                    </div>
                    Create New Course
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--dash-text-secondary)' }}>Course Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="E.g. Software Engineering"
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--dash-border)', outline: 'none', fontSize: '1rem', backgroundColor: '#fcfdfe' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--dash-text-secondary)' }}>Course Code</label>
                            <input
                                type="text"
                                value={courseCode}
                                onChange={(e) => setCourseCode(e.target.value)}
                                required
                                placeholder="E.g. CS303"
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--dash-border)', outline: 'none', fontSize: '1rem', backgroundColor: '#fcfdfe' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--dash-text-secondary)' }}>Department</label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                required
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--dash-border)', outline: 'none', fontSize: '1rem', backgroundColor: '#fcfdfe', cursor: 'pointer' }}
                            >
                                <option value="Computer Science">Computer Science</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Statistics">Statistics</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--dash-text-secondary)' }}>Academic Year</label>
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                required
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--dash-border)', outline: 'none', fontSize: '1rem', backgroundColor: '#fcfdfe', cursor: 'pointer' }}
                            >
                                <option value={1}>Year 1</option>
                                <option value={2}>Year 2</option>
                                <option value={3}>Year 3</option>
                                <option value={4}>Year 4</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--dash-text-secondary)' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Describe the course content..."
                            rows={5}
                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--dash-border)', outline: 'none', fontSize: '1rem', backgroundColor: '#fcfdfe', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button type="submit" className="dash-btn" style={{ flex: 1.5, padding: '16px', color: '#fff', backgroundColor: 'var(--dash-primary)', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 15px rgba(43, 140, 238, 0.3)', cursor: 'pointer' }}>
                            Create Course
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

export default AddCourseView;
