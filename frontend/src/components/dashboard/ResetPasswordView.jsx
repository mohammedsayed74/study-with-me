import { useState } from "react";
import axios from "axios";

const ResetPasswordView = ({ onSuccess, onCancel }) => {
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    const toggleVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const validatePass = (pass) => {
        if (pass.length < 8) return "Password must be at least 8 characters long";
        if (pass.includes(" ")) return "Password cannot contain spaces";
        if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one symbol (e.g., @, #)";
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
            
            setTimeout(() => {
                if (onSuccess) onSuccess();
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
        <div className="reset-password-view" style={{ width: '100%' }}>
            <div className="dash-card" style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid var(--dash-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '20px', 
                        backgroundColor: 'var(--dash-primary-light)', 
                        color: 'var(--dash-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>lock_reset</span>
                    </div>
                    <h2 style={{ margin: 0, fontSize: "1.8rem", color: "var(--dash-text)", fontWeight: "800" }}>Reset Password</h2>
                    <p style={{ margin: "8px 0 0 0", color: "var(--dash-text-muted)", fontSize: "0.95rem" }}>Update your security credentials below</p>
                </div>

                {feedback.message && (
                    <div style={{
                        padding: "16px",
                        marginBottom: "24px",
                        borderRadius: "12px",
                        backgroundColor: feedback.type === "success" ? "var(--dash-success-bg)" : "var(--dash-danger-bg)",
                        color: feedback.type === "success" ? "var(--dash-success)" : "var(--dash-danger)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontWeight: "600",
                        border: `1px solid ${feedback.type === 'success' ? 'var(--dash-success)' : 'var(--dash-danger)'}22`
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                            {feedback.type === "success" ? "check_circle" : "error"}
                        </span>
                        {feedback.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    <div className="form-group">
                        <label style={{ display: "block", marginBottom: "8px", color: "var(--dash-text-secondary)", fontWeight: "700", fontSize: "0.9rem" }}>Current Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                name="currentPassword"
                                placeholder="Enter current password"
                                value={passwords.currentPassword}
                                onChange={handleChange}
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "14px 45px 14px 16px",
                                    borderRadius: "14px",
                                    border: "1px solid var(--dash-border)",
                                    backgroundColor: "#fcfdfe",
                                    color: "var(--dash-text)",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    transition: "all 0.2s"
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility("current")}
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "var(--dash-text-muted)",
                                    cursor: "pointer",
                                    display: "flex"
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                                    {showPasswords.current ? "visibility" : "visibility_off"}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: "block", marginBottom: "8px", color: "var(--dash-text-secondary)", fontWeight: "700", fontSize: "0.9rem" }}>New Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                name="newPassword"
                                placeholder="At least 8 characters"
                                value={passwords.newPassword}
                                onChange={handleChange}
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "14px 45px 14px 16px",
                                    borderRadius: "14px",
                                    border: "1px solid var(--dash-border)",
                                    backgroundColor: "#fcfdfe",
                                    color: "var(--dash-text)",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    transition: "all 0.2s"
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility("new")}
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "var(--dash-text-muted)",
                                    cursor: "pointer",
                                    display: "flex"
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                                    {showPasswords.new ? "visibility" : "visibility_off"}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: "block", marginBottom: "8px", color: "var(--dash-text-secondary)", fontWeight: "700", fontSize: "0.9rem" }}>Confirm New Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Repeat new password"
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "14px 45px 14px 16px",
                                    borderRadius: "14px",
                                    border: "1px solid var(--dash-border)",
                                    backgroundColor: "#fcfdfe",
                                    color: "var(--dash-text)",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    transition: "all 0.2s"
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility("confirm")}
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "var(--dash-text-muted)",
                                    cursor: "pointer",
                                    display: "flex"
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                                    {showPasswords.confirm ? "visibility" : "visibility_off"}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1.5,
                                padding: "14px",
                                backgroundColor: "var(--dash-primary)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "14px",
                                fontSize: "1rem",
                                fontWeight: "700",
                                cursor: loading ? "not-allowed" : "pointer",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "10px",
                                boxShadow: "0 4px 15px rgba(43, 140, 238, 0.3)",
                                transition: "all 0.2s"
                            }}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: "14px",
                                backgroundColor: "var(--dash-danger-bg)",
                                color: "var(--dash-danger)",
                                border: "1px solid var(--dash-danger)22",
                                borderRadius: "14px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordView;
