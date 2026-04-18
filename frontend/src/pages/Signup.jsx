import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";

function Signup() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [year, setYear] = useState(1);

  const validateName = (name) => name.trim().length >= 3;

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateName(formData.name)) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters with upper, lower, number & symbol";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setLoading(true);

    try {
      const res = await axios.post("/api/users/signUp", { ...formData, year });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "An error occurred during signup." });
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
            <h1>Join the Academic Community.</h1>
            <p>
              Create an account to collaborate with peers, access exclusive study guides, 
              and excel in your academic path.
            </p>
          </div>
          
          <div className="auth-side-footer">
            © 2026 Material Archive. All rights reserved.
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="auth-form-panel">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>

          {errors.api && (
            <div className="api-error-alert">
              <span className="material-symbols-outlined">error</span>
              {errors.api}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSignup} noValidate style={{gap: '16px'}}>
            
            <div className="auth-field-group">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <span className="material-symbols-outlined input-icon">person</span>
                <input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.name && <div className="auth-error-msg">{errors.name}</div>}
            </div>

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
              {errors.email && <div className="auth-error-msg">{errors.email}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  <span className="material-symbols-outlined toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </div>
                {errors.password && <div className="auth-error-msg" style={{fontSize: '0.75rem'}}>{errors.password}</div>}
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Confirm</label>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined input-icon">lock_reset</span>
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <span className="material-symbols-outlined toggle-pass" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? "visibility_off" : "visibility"}
                  </span>
                </div>
                {errors.confirmPassword && <div className="auth-error-msg" style={{fontSize: '0.75rem'}}>{errors.confirmPassword}</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="auth-field-group">
                <label className="auth-label">Role</label>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined input-icon">badge</span>
                  <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'var(--auth-input-bg)', border: '1px solid var(--auth-input-border)', borderRadius: '12px', outline: 'none', appearance: 'none' }}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: '12px', color: '#94a3b8', pointerEvents: 'none' }}>expand_more</span>
                </div>
              </div>

              {formData.role === "student" && (
                <div className="auth-field-group">
                  <label className="auth-label">Academic Year</label>
                  <div className="auth-input-wrapper">
                    <span className="material-symbols-outlined input-icon">calendar_month</span>
                    <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'var(--auth-input-bg)', border: '1px solid var(--auth-input-border)', borderRadius: '12px', outline: 'none', appearance: 'none' }}>
                      <option value={1}>Year 1</option>
                      <option value={2}>Year 2</option>
                      <option value={3}>Year 3</option>
                      <option value={4}>Year 4</option>
                    </select>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', right: '12px', color: '#94a3b8', pointerEvents: 'none' }}>expand_more</span>
                  </div>
                </div>
              )}
            </div>

            <button className="auth-btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <span className="material-symbols-outlined">person_add</span>}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Signup;