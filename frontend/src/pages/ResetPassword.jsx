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
        
        // Uppercase check
        if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter";
        
        // Symbol check (allow all common symbols)
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
        <div style={{ 
            minHeight: "100vh", 
            width: "100vw",
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "#fff", 
            fontFamily: "'Inter', sans-serif",
            boxSizing: "border-box",
            overflowX: "hidden"
        }}>
            {/* Top Gradient Header */}
            <div style={{ 
                height: "140px", 
                width: "100%", 
                background: "linear-gradient(to right, #C6DDF0, #EEDFEA, #FEF7E2)",
                position: "relative" 
            }}>
                <button 
                    onClick={() => navigate("/profile")}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        padding: '0.6rem 1.5rem',
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back
                </button>
            </div>

            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", backgroundColor: "#fff" }}>
                
                {/* Header title */}
                <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.8rem", color: "#222", fontWeight: "700" }}>Reset Password</h2>
                    <p style={{ margin: "5px 0 0 0", color: "#888", fontSize: "0.95rem" }}>Update your security credentials below</p>
                </div>

                {feedback.message && (
                    <div style={{
                        padding: "1rem",
                        marginBottom: "2rem",
                        borderRadius: "8px",
                        backgroundColor: feedback.type === "success" ? "#D1FAE5" : "#FEE2E2",
                        color: feedback.type === "success" ? "#065F46" : "#991B1B",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontWeight: "500"
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                            {feedback.type === "success" ? "check_circle" : "error"}
                        </span>
                        {feedback.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "500px", margin: "0 auto" }}>
                    
                    {/* Current Password */}
                    <div>
                        <label style={{ display: "block", marginBottom: "0.6rem", color: "#444", fontWeight: "600", fontSize: "0.9rem" }}>Current Password</label>
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
                                    padding: "0.9rem 2.5rem 0.9rem 1rem",
                                    borderRadius: "8px",
                                    border: "1px solid #F5F5F5",
                                    backgroundColor: "#FAFAFA",
                                    color: "#333",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    boxSizing: "border-box",
                                    transition: "all 0.2s"
                                }}
                                onFocus={(e) => e.target.style.border = "1px solid #C6DDF0"}
                                onBlur={(e) => e.target.style.border = "1px solid #F5F5F5"}
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility("current")}
                                style={{
                                    position: "absolute",
                                    right: "0.8rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "#aaa",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: 0
                                }}
                                tabIndex="-1"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>
                                    {showPasswords.current ? "visibility" : "visibility_off"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label style={{ display: "block", marginBottom: "0.6rem", color: "#444", fontWeight: "600", fontSize: "0.9rem" }}>New Password</label>
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
                                    padding: "0.9rem 2.5rem 0.9rem 1rem",
                                    borderRadius: "8px",
                                    border: "1px solid #F5F5F5",
                                    backgroundColor: "#FAFAFA",
                                    color: "#333",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    boxSizing: "border-box",
                                    transition: "all 0.2s"
                                }}
                                onFocus={(e) => e.target.style.border = "1px solid #C6DDF0"}
                                onBlur={(e) => e.target.style.border = "1px solid #F5F5F5"}
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility("new")}
                                style={{
                                    position: "absolute",
                                    right: "0.8rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "#aaa",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: 0
                                }}
                                tabIndex="-1"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>
                                    {showPasswords.new ? "visibility" : "visibility_off"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label style={{ display: "block", marginBottom: "0.6rem", color: "#444", fontWeight: "600", fontSize: "0.9rem" }}>Confirm New Password</label>
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
                                    padding: "0.9rem 2.5rem 0.9rem 1rem",
                                    borderRadius: "8px",
                                    border: "1px solid #F5F5F5",
                                    backgroundColor: "#FAFAFA",
                                    color: "#333",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    boxSizing: "border-box",
                                    transition: "all 0.2s"
                                }}
                                onFocus={(e) => e.target.style.border = "1px solid #C6DDF0"}
                                onBlur={(e) => e.target.style.border = "1px solid #F5F5F5"}
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility("confirm")}
                                style={{
                                    position: "absolute",
                                    right: "0.8rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "#aaa",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: 0
                                }}
                                tabIndex="-1"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>
                                    {showPasswords.confirm ? "visibility" : "visibility_off"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: "1rem",
                            padding: "0.9rem",
                            backgroundColor: "#3B82F6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "1rem",
                            fontWeight: "600",
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "0.5rem",
                            boxShadow: "0 4px 6px rgba(59, 130, 246, 0.2)",
                            opacity: loading ? 0.7 : 1,
                            transition: "all 0.2s"
                        }}
                    >
                        {loading ? (
                            <div className="spinner-small" style={{ margin: "0 auto" }}></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>lock_reset</span>
                                Update Password
                            </>
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default ResetPassword;
