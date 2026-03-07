import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";

function Signup() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/home" replace />;
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
      newErrors.email = "Invalid email format";
    }

    if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number & special character";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setLoading(true);

    try {
      const res = await axios.post("/api/users/signUp", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/home", { replace: true });
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Error signing up" });
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
          <h1>Create Account</h1>
          <p>Join the community to start studying.</p>
        </div>

        {errors.api && <p className="auth-error">{errors.api}</p>}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="auth-input-group">
            <span className="material-symbols-outlined input-icon">person</span>
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          {errors.name && <p className="auth-error">{errors.name}</p>}

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

          <div className="auth-input-group">
            <span className="material-symbols-outlined input-icon">lock</span>
            <input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <span
              className="material-symbols-outlined input-icon-right"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "visibility_off" : "visibility"}
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="auth-error">{errors.confirmPassword}</p>
          )}

          <div className="auth-input-group">
            <span className="material-symbols-outlined input-icon">menu_book</span>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option disabled hidden value="">
                Select Role
              </option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <span className="material-symbols-outlined input-icon-right-inert">
              expand_more
            </span>
          </div>
          {errors.role && <p className="auth-error">{errors.role}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              person_add
            </span>
          </button>
        </form>
      </div>

      <div className="auth-footer">
        Already have an account?{" "}
        <Link to="/login" className="footer-link">
          Log In
        </Link>
      </div>
    </div>
  );
}

export default Signup;