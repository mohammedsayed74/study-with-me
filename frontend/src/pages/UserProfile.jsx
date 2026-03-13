import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const UserProfile = () => {

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: ""
  });

  const [gpa, setGpa] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {

      const decoded = jwtDecode(token);

      const email = decoded.email;

      setUserData({
        name: decoded.name,
        email: email,
        role: decoded.role
      });

      const savedGpa = localStorage.getItem(`gpa_${email}`);
      const savedYear = localStorage.getItem(`academicYear_${email}`);
      const savedImage = localStorage.getItem(`profileImage_${email}`);

      if (savedGpa) setGpa(savedGpa);
      if (savedYear) setAcademicYear(savedYear);
      if (savedImage) setProfileImage(savedImage);

    }

  }, []);

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (file) {

      const reader = new FileReader();

      reader.onloadend = () => {

        setProfileImage(reader.result);

        localStorage.setItem(
          `profileImage_${userData.email}`,
          reader.result
        );

      };

      reader.readAsDataURL(file);

    }

  };

  const handleSave = () => {

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    localStorage.setItem(`gpa_${userData.email}`, gpa);
    localStorage.setItem(`academicYear_${userData.email}`, academicYear);

    alert("Changes Saved");

  };

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        <h2 style={styles.title}>User Profile</h2>

        <div style={styles.imageSection}>

          <div style={styles.imagePreview}>

            {profileImage ? (
              <img src={profileImage} alt="Profile" style={styles.img} />
            ) : (
              <div style={styles.placeholder}>Photo</div>
            )}

          </div>

          <input
            type="file"
            id="upload-photo"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />

          <label htmlFor="upload-photo" style={styles.uploadBtn}>
            Change Photo
          </label>

        </div>

        <div style={styles.infoContainer}>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={userData.name}
              readOnly
              style={styles.readOnlyInput}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={userData.email}
              readOnly
              style={styles.readOnlyInput}
            />
          </div>

          {userData.role === "student" && (
            <>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select Year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>GPA</label>
                <input
                  type="text"
                  placeholder="Enter GPA"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  style={styles.input}
                />
              </div>

            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button style={styles.saveBtn} onClick={handleSave}>
            Save Changes
          </button>

        </div>

      </div>

    </div>

  );

};

const styles = {

  container: {
    backgroundColor: "#CCEEFF",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px"
  },

  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    width: "960px",
    maxWidth: "90%"
  },

  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "30px",
    textAlign: "center"
  },

  imageSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "30px"
  },

  imagePreview: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    border: "3px solid #0088cc",
    marginBottom: "15px"
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  placeholder: {
    color: "#aaa"
  },

  uploadBtn: {
    color: "#0088cc",
    cursor: "pointer",
    fontWeight: "600"
  },

  infoContainer: {
    textAlign: "left"
  },

  inputGroup: {
    marginBottom: "18px"
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    color: "#555"
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px"
  },

  readOnlyInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #eee",
    backgroundColor: "#f9f9f9",
    color: "#888"
  },

  saveBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0088cc",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px"
  }

};

export default UserProfile;