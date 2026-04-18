import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateEmail(formData.email))
      newErrors.email = "Please enter a valid email address";

    if (!formData.password)
      newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      return setErrors(newErrors);
    }

    setLoading(true);

    try {
      const { data } = await axios.post("/api/users/login", formData);
      localStorage.setItem("token", data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Invalid email or password. Please try again." });
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        {/* Left Panel: Branding & Visual */}
        <div className="auth-side-panel">
          <div className="auth-side-brand">
            <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>school</span>
            <h2>Study With Me</h2>
          </div>
          
          <div className="auth-side-content">
            <h1>Elevate Your Learning Journey.</h1>
            <p>
              Access a comprehensive archive of materials, practice with smart MCQs, 
              and track your academic progress in one unified dashboard.
            </p>
          </div>
          
          <div className="auth-side-footer">
            © 2026 Material Archive. All rights reserved.
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="auth-form-panel">
          <div className="auth-form-content">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Please enter your credentials to continue</p>
            </div>

            {errors.api && (
              <div className="api-error-alert">
                <span className="material-symbols-outlined">error</span>
                {errors.api}
              </div>
            )}

            <form className="auth-form" onSubmit={handleLogin} noValidate>
              
              <div className="auth-field-group">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.email && (
                  <div className="auth-error-msg">
                    <span className="material-symbols-outlined" style={{fontSize: "16px"}}>error</span>
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="material-symbols-outlined toggle-pass"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </div>
                {errors.password && (
                  <div className="auth-error-msg">
                    <span className="material-symbols-outlined" style={{fontSize: "16px"}}>error</span>
                    {errors.password}
                  </div>
                )}
              </div>

              <button className="auth-btn-primary" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </form>

            <div className="auth-switch">
              Don't have an account? <Link to="/signup">Create Account</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;