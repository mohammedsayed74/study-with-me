import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./materials.css";

const UserProfile = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [nickName, setNickName] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await axios.get("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const fetchedUser = response.data.user;
        const userEmail = fetchedUser.email;
        setEmail(userEmail);

        // Load local features if exist, else from fetched profile
        const localName = localStorage.getItem(`profileName_${userEmail}`);
        setName(localName || fetchedUser.name || "");

        const localNickName = localStorage.getItem(
          `profileNickName_${userEmail}`,
        );
        setNickName(localNickName || "");

        const localGender = localStorage.getItem(`profileGender_${userEmail}`);
        setGender(localGender || "");

        const localDesc = localStorage.getItem(`profileDesc_${userEmail}`);
        setDescription(localDesc || "");

        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch profile data.",
        );
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token, navigate]);

  const handleSave = (key, value) => {
    localStorage.setItem(`profile${key}_${email}`, value);
  };

  if (loading) {
    return (
      <div
        className="materials-page flex-center-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div className="materials-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="materials-page flex-center-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div className="materials-error">{error}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "#fff",
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* Top Gradient Header */}
      <div
        style={{
          height: "140px",
          width: "100%",
          background: "linear-gradient(to right, #C6DDF0, #EEDFEA, #FEF7E2)",
          position: "relative",
        }}
      >
        <button
          onClick={() => navigate("/home")}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            padding: "0.6rem 1.5rem",
            backgroundColor: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "2rem",
          backgroundColor: "#fff",
        }}
      >
        {/* User Info Header (Buttons Added) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.4rem",
                color: "#222",
                fontWeight: "700",
              }}
            >
              {name || "Your Name"}
            </h2>
            <p
              style={{
                margin: "5px 0 0 0",
                color: "#888",
                fontSize: "0.95rem",
              }}
            >
              {email}
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => navigate("/reset-password")}
              style={{
                padding: "0.6rem 1.5rem",
                backgroundColor: "#fff",
                color: "#3B82F6",
                border: "1px solid #3B82F6",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Reset Password
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                padding: "0.6rem 2rem",
                backgroundColor: isEditing ? "#10B981" : "#3B82F6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: isEditing
                  ? "0 2px 4px rgba(16, 185, 129, 0.3)"
                  : "0 2px 4px rgba(59, 130, 246, 0.3)",
                transition: "all 0.2s",
              }}
            >
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>
        </div>

        {/* Form Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            rowGap: "1.5rem",
            marginBottom: "3.5rem",
          }}
        >
          {/* Full Name */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.6rem",
                color: "#444",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your First Name"
              value={name}
              readOnly={!isEditing}
              onChange={(e) => {
                setName(e.target.value);
                handleSave("Name", e.target.value);
              }}
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "8px",
                border: isEditing
                  ? "1px solid #C6DDF0"
                  : "1px solid transparent",
                backgroundColor: isEditing ? "#fff" : "#FAFAFA",
                color: "#333",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
            />
          </div>

          {/* Nick Name */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.6rem",
                color: "#444",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              Nick Name
            </label>
            <input
              type="text"
              placeholder="Your Nick Name"
              value={nickName}
              readOnly={!isEditing}
              onChange={(e) => {
                setNickName(e.target.value);
                handleSave("NickName", e.target.value);
              }}
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "8px",
                border: isEditing
                  ? "1px solid #C6DDF0"
                  : "1px solid transparent",
                backgroundColor: isEditing ? "#fff" : "#FAFAFA",
                color: "#333",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
            />
          </div>

          {/* Gender */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.6rem",
                color: "#444",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              Gender
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={gender}
                disabled={!isEditing}
                onChange={(e) => {
                  setGender(e.target.value);
                  handleSave("Gender", e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: "0.9rem 1rem",
                  borderRadius: "8px",
                  border: isEditing
                    ? "1px solid #C6DDF0"
                    : "1px solid transparent",
                  backgroundColor: isEditing ? "#fff" : "#FAFAFA",
                  color: gender ? "#333" : "#aaa",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                  appearance: "none",
                  cursor: isEditing ? "pointer" : "default",
                  transition: "all 0.2s",
                }}
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: isEditing ? "#666" : "#aaa",
                  fontSize: "1.2rem",
                  transition: "all 0.2s",
                }}
              >
                expand_more
              </span>
            </div>
          </div>

          {/* My Description */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.6rem",
                color: "#444",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              My Description
            </label>
            <textarea
              placeholder="Write a bio or description about yourself..."
              value={description}
              readOnly={!isEditing}
              onChange={(e) => {
                setDescription(e.target.value);
                handleSave("Desc", e.target.value);
              }}
              rows={4}
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "8px",
                border: isEditing
                  ? "1px solid #C6DDF0"
                  : "1px solid transparent",
                backgroundColor: isEditing ? "#fff" : "#FAFAFA",
                color: "#333",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            />
          </div>
        </div>

        {/* Email Address Section */}
        <div>
          <h3
            style={{
              fontSize: "1.1rem",
              color: "#222",
              marginBottom: "1.5rem",
              fontWeight: "700",
            }}
          >
            My email Address
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "#EBF3FF",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: "1rem",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#3B82F6", fontSize: "1.3rem" }}
              >
                mail
              </span>
            </div>
            <div>
              <div
                style={{
                  color: "#222",
                  fontWeight: "500",
                  fontSize: "0.95rem",
                }}
              >
                {email}
              </div>
              <div
                style={{
                  color: "#888",
                  fontSize: "0.85rem",
                  marginTop: "0.2rem",
                }}
              >
                1 month ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
