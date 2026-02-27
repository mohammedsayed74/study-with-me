import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
      const { data } = await axios.post("/api/auth/login", formData);
      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
        setErrors({ api: err.response?.data?.message || "Login failed" });
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
            <Link to="/signup">Sign Up</Link>
          </div>

          <h2>Welcome</h2>
          {errors.api && <p className="error">{errors.api}</p>}

          <form onSubmit={handleLogin} noValidate>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <div className="password-box">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <span className="show-pass" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}


            <button type="submit" disabled={loading}>
              {loading ? "Logging..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;