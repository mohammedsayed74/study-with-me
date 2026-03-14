import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./materials.css";

const ResetPassword = () => {
    const navigate = useNavigate();
    
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    const token = localStorage.getItem("token");

    if (!token) {
        navigate("/login");
        return null;
    }

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const validatePass = (pass) => {
        // Length check (8 chars)
        if (pass.length < 8) return "Password must be at least 8 characters long";
        // No spaces
        if (pass.includes(" ")) return "Password cannot contain spaces";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: "", message: "" });

        const { currentPassword, newPassword, confirmPassword } = passwords;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return setFeedback({ type: "error", message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return setFeedback({ type: "error", message: "New passwords do not match" });
        }

        const validationError = validatePass(newPassword);
        if (validationError) {
            return setFeedback({ type: "error", message: validationError });
        }

        setLoading(true);
        try {
            const response = await axios.patch("/api/users/reset-password", 
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setFeedback({ type: "success", message: response.data.message });
            setLoading(false);
            
            // Redirect after success
            setTimeout(() => {
                navigate("/profile");
            }, 2000);
        } catch (err) {
            setFeedback({
                type: "error",
                message: err.response?.data?.message || "Something went wrong"
            });
            setLoading(false);
        }
    };

    return (
        <div className="materials-page flex-center-wrapper">
            <div className="materials-blob-1"></div>
            <div className="materials-blob-2"></div>

            <div className="upload-container material-card" style={{ maxWidth: "500px", width: "100%" }}>
                <h2 className="upload-header" style={{ justifyContent: "center", marginBottom: "2rem" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>lock_reset</span>
                    Reset Password
                </h2>

                {feedback.message && (
                    <div className={`upload-feedback ${feedback.type}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                            {feedback.type === "success" ? "check_circle" : "error"}
                        </span>
                        {feedback.message}
                    </div>
                )}

                <form className="upload-form" onSubmit={handleSubmit}>
                    <div className="upload-form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            placeholder="Enter current password"
                            value={passwords.currentPassword}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="upload-form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="At least 8 characters"
                            value={passwords.newPassword}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="upload-form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Repeat new password"
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                        <button
                            type="button"
                            className="material-btn btn-secondary"
                            onClick={() => navigate("/profile")}
                            disabled={loading}
                            style={{ flex: 1 }}
                        >
                            Back to Profile
                        </button>

                        <button
                            type="submit"
                            className="material-btn btn-primary"
                            disabled={loading}
                            style={{ flex: 2 }}
                        >
                            {loading ? (
                                <div className="spinner-small" style={{ margin: "0 auto" }}></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">security</span>
                                    Save Password
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
