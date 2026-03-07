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
    return <Navigate to="/home" replace />;
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
      newErrors.email = "Invalid email format";

    if (!formData.password)
      newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      return setErrors(newErrors);
    }

    setLoading(true);

    try {
      const { data } = await axios.post("/api/users/login", formData);
      localStorage.setItem("token", data.token);
      navigate("/home", { replace: true });
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Login failed" });
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-blob-1"></div>
      <div className="auth-blob-2"></div>

      <div className="auth-brand">
        <div className="auth-brand-icon">
          <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
            school
          </span>
        </div>
        <h2>Study With Me</h2>
      </div>

      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Welcome Back</h1>
          <p>Please enter your details to sign in.</p>
        </div>

        {errors.api && <p className="auth-error">{errors.api}</p>}

        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <div className="auth-input-group">
            <span className="material-symbols-outlined input-icon">mail</span>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {errors.email && <p className="auth-error">{errors.email}</p>}

          <div className="auth-input-group">
            <span className="material-symbols-outlined input-icon">lock</span>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              className="material-symbols-outlined input-icon-right"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </div>
          {errors.password && <p className="auth-error">{errors.password}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              login
            </span>
          </button>
        </form>
      </div>

      <div className="auth-footer">
        Don't have an account?{" "}
        <Link to="/signup" className="footer-link">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default Login;