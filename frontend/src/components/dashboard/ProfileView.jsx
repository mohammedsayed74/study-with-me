import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ProfileView({ onResetPassword }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [nickName, setNickName] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
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

        const localName = localStorage.getItem(`profileName_${userEmail}`);
        setName(localName || fetchedUser.name || "");

        const localNickName = localStorage.getItem(`profileNickName_${userEmail}`);
        setNickName(localNickName || "");

        const localGender = localStorage.getItem(`profileGender_${userEmail}`);
        setGender(localGender || "");

        const localDesc = localStorage.getItem(`profileDesc_${userEmail}`);
        setDescription(localDesc || "");

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile data.");
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);

  const handleSave = (key, value) => {
    localStorage.setItem(`profile${key}_${email}`, value);
  };

  if (loading) {
    return (
      <div className="dash-empty">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return <div className="materials-error">{error}</div>;
  }

  return (
    <div className="profile-view-container" style={{ width: "100%", margin: "0 auto" }}>
      <div className="dash-card" style={{ 
        padding: "40px", 
        borderRadius: "24px", 
        backgroundColor: "#fff", 
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ 
              width: "64px", 
              height: "64px", 
              borderRadius: "20px", 
              background: "linear-gradient(135deg, var(--dash-primary), var(--dash-purple))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: 700,
              boxShadow: "0 8px 16px rgba(43, 140, 238, 0.2)"
            }}>
              {name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "var(--dash-text)" }}>{name || "Your Name"}</h2>
              <p style={{ margin: "4px 0 0 0", color: "var(--dash-text-muted)", fontSize: "0.95rem" }}>{email}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => onResetPassword ? onResetPassword() : navigate("/reset-password")}
              className="dash-btn"
              style={{ 
                padding: "10px 20px", 
                backgroundColor: "transparent", 
                border: "1px solid var(--dash-border)",
                color: "var(--dash-text-secondary)",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Reset Password
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="dash-btn"
              style={{ 
                padding: "10px 24px", 
                backgroundColor: isEditing ? "var(--dash-success)" : "var(--dash-primary)",
                border: "none",
                color: "#fff",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: isEditing ? "0 4px 12px rgba(16, 185, 129, 0.2)" : "0 4px 12px rgba(43, 140, 238, 0.2)",
                transition: "all 0.2s"
              }}
            >
              {isEditing ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check</span>
                  Save Changes
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                  Edit Profile
                </span>
              )}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", marginBottom: "40px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "0.85rem", color: "var(--dash-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</label>
            <div style={{ position: "relative" }}>
              <span className="material-symbols-outlined" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)", fontSize: "20px" }}>person</span>
              <input
                type="text"
                value={name}
                readOnly={!isEditing}
                onChange={(e) => {
                  setName(e.target.value);
                  handleSave("Name", e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 44px",
                  borderRadius: "14px",
                  border: isEditing ? "2px solid var(--dash-primary)" : "1px solid var(--dash-border)",
                  backgroundColor: isEditing ? "#fff" : "#f8fafc",
                  color: "var(--dash-text)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  outline: "none",
                  transition: "all 0.2s",
                  boxShadow: isEditing ? "0 0 0 4px rgba(43, 140, 238, 0.1)" : "none"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "0.85rem", color: "var(--dash-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nick Name</label>
            <div style={{ position: "relative" }}>
              <span className="material-symbols-outlined" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)", fontSize: "20px" }}>badge</span>
              <input
                type="text"
                value={nickName}
                readOnly={!isEditing}
                onChange={(e) => {
                  setNickName(e.target.value);
                  handleSave("NickName", e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 44px",
                  borderRadius: "14px",
                  border: isEditing ? "2px solid var(--dash-primary)" : "1px solid var(--dash-border)",
                  backgroundColor: isEditing ? "#fff" : "#f8fafc",
                  color: "var(--dash-text)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  outline: "none",
                  transition: "all 0.2s",
                  boxShadow: isEditing ? "0 0 0 4px rgba(43, 140, 238, 0.1)" : "none"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "0.85rem", color: "var(--dash-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gender</label>
            <div style={{ position: "relative" }}>
              <span className="material-symbols-outlined" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)", fontSize: "20px" }}>wc</span>
              <select
                value={gender}
                disabled={!isEditing}
                onChange={(e) => {
                  setGender(e.target.value);
                  handleSave("Gender", e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 44px",
                  borderRadius: "14px",
                  border: isEditing ? "2px solid var(--dash-primary)" : "1px solid var(--dash-border)",
                  backgroundColor: isEditing ? "#fff" : "#f8fafc",
                  color: "var(--dash-text)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  outline: "none",
                  cursor: isEditing ? "pointer" : "default",
                  appearance: "none"
                }}
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <span className="material-symbols-outlined" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)", pointerEvents: "none" }}>expand_more</span>
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "0.85rem", color: "var(--dash-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bio / Description</label>
            <textarea
              value={description}
              readOnly={!isEditing}
              onChange={(e) => {
                setDescription(e.target.value);
                handleSave("Desc", e.target.value);
              }}
              rows={4}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                border: isEditing ? "2px solid var(--dash-primary)" : "1px solid var(--dash-border)",
                backgroundColor: isEditing ? "#fff" : "#f8fafc",
                color: "var(--dash-text)",
                fontSize: "1rem",
                fontWeight: 500,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                transition: "all 0.2s"
              }}
            />
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--dash-border)", paddingTop: "32px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--dash-text)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--dash-primary)" }}>contact_mail</span>
            Contact Information
          </h3>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "20px", 
            padding: "20px", 
            borderRadius: "16px", 
            backgroundColor: "var(--dash-primary-light)",
            border: "1px solid rgba(43, 140, 238, 0.1)"
          }}>
            <div style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "14px", 
              backgroundColor: "#fff", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              color: "var(--dash-primary)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
            }}>
              <span className="material-symbols-outlined">mail</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "var(--dash-text)", fontSize: "1.05rem" }}>{email}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--dash-text-secondary)", marginTop: "2px" }}>Primary Account Email</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;
