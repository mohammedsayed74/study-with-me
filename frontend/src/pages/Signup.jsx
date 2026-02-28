import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./auth.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student"
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
      [e.target.name]: e.target.value
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateName(formData.name)) newErrors.name = "Name must be at least 3 characters";

    if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";

    if (!validatePassword(formData.password)) newErrors.password =
      "Password must contain uppercase, lowercase, number & special character";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setLoading(true);

    try {
      const res = await axios.post("/api/auth/signUp", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Error signing up" });
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">

        <div className="study-image">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
            alt="study"
          />
        </div>

        <div className="auth-card">
          <div className="top-link">
            <Link to="/">Login</Link>
          </div>

          <h2>Create Account</h2>
          {errors.api && <p className="error">{errors.api}</p>}

          <form onSubmit={handleSignup}>
            <input
              name="name"
              placeholder="Name"
              onChange={handleChange}
            />
            {errors.name && <p className="error">{errors.name}</p>}

            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <div className="password-box">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={handleChange}
              />
              <span className="show-pass" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}

            <div className="password-box">
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                onChange={handleChange}
              />
              <span className="show-pass" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? "Hide" : "Show"}
              </span>
            </div>
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

            <select name="role" onChange={handleChange}>
              <option value="student">Student</option>
              <option value="doctor">TA</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;