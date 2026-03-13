import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./materials.css";

function CourseMaterials() {
  const { courseCode } = useParams();

  const [materials, setMaterials] = useState([]);
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("approved"); // 'approved' or 'pending'

  // Extract user info from token (fallback mechanism if no context is provided)
  const token = localStorage.getItem("token");
  let user = null;
  if (token) {
    try {
      user = jwtDecode(token);
    } catch (e) {
      console.error("Invalid token", e);
    }
  }


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isTeacher = user.role === "teacher";

  const fetchMaterials = async () => {
    setLoading(true);
    setError("");

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const approvedRes = await axios.get(`/api/materials/${courseCode}`, { headers });
      setMaterials(approvedRes.data.data || []);

      if (isTeacher) {
        const pendingRes = await axios.get(`/api/materials/${courseCode}/pending`, { headers });
        setPendingMaterials(pendingRes.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load materials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseCode) {
      fetchMaterials();
    }

  }, [courseCode, token, isTeacher]);

  const handleApprove = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`/api/materials/${id}/approve`, {}, { headers });

      const approvedItem = pendingMaterials.find(m => m._id === id);
      if (approvedItem) {
        setPendingMaterials(prev => prev.filter(m => m._id !== id));
        setMaterials(prev => [...prev, { ...approvedItem, status: "approved" }]);
      }
    } catch (err) {
      alert("Failed to approve material: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteOrReject = async (id, isPending) => {
    if (!window.confirm(`Are you sure you want to ${isPending ? 'reject' : 'delete'} this material?`)) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/materials/${id}`, { headers });

      if (isPending) {
        setPendingMaterials(prev => prev.filter(m => m._id !== id));
      } else {
        setMaterials(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      alert("Failed to delete material: " + (err.response?.data?.message || err.message));
    }
  };

  const renderMaterialsGrid = (data, isPendingView) => {
    if (data.length === 0) {
      return (
        <div className="materials-empty">
          <span className="material-symbols-outlined materials-empty-icon">
            {isPendingView ? "task" : "folder_open"}
          </span>
          <h3>{isPendingView ? "All caught up!" : "No requested materials yet."}</h3>
          <p>
            {isPendingView
              ? "Hooray! No pending materials to review at the moment."
              : `There are currently no approved materials for ${courseCode}.`
            }
          </p>
        </div>
      );
    }

    return (
      <div className="materials-grid">
        {data.map((material) => (
          <div key={material._id} className="material-card">
            <div className="material-card-icon">
              <span className="material-symbols-outlined">picture_as_pdf</span>
            </div>

            <div className="material-card-content">
              <h3 className="material-card-title">{material.title}</h3>
              <div className="material-card-meta">
                <span className="material-symbols-outlined">person</span>
                {material.uploadedBy?.name || "Unknown"}
              </div>
            </div>

            <div className="material-actions">
              <a
                href={material.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="material-btn btn-secondary"
              >
                <span className="material-symbols-outlined">visibility</span>
                View
              </a>

              {isTeacher && isPendingView && (
                <>
                  <button
                    onClick={() => handleApprove(material._id)}
                    className="material-btn btn-success"
                    title="Approve"
                  >
                    <span className="material-symbols-outlined">check</span>
                  </button>
                  <button
                    onClick={() => handleDeleteOrReject(material._id, true)}
                    className="material-btn btn-danger"
                    title="Reject"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              )}

              {isTeacher && !isPendingView && (
                <button
                  onClick={() => handleDeleteOrReject(material._id, false)}
                  className="material-btn btn-danger"
                  style={{ flex: 0.3 }}
                  title="Delete"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="materials-page">
      <div className="materials-blob-1"></div>
      <div className="materials-blob-2"></div>

      <div className="materials-header">
        <h1>{courseCode} Materials</h1>
        <p>Course resources</p>

        <Link to={`/course/${courseCode}/upload`} className="material-btn btn-primary" style={{ display: 'inline-flex', marginTop: '1rem', padding: '0.6rem 1.5rem', width: 'auto' }}>
          <span className="material-symbols-outlined">add</span>
          Upload Material
        </Link>
      </div>

      {error && <div className="materials-error">{error}</div>}

      {isTeacher && (
        <div className="materials-tabs">
          <button
            className={`tab-btn ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved ({materials.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending ({pendingMaterials.length})
          </button>
        </div>
      )}

      {loading ? (
        <div className="materials-loading">
          <div className="spinner"></div>
          <p>Loading course content...</p>
        </div>
      ) : (
        <>
          {(!isTeacher || activeTab === "approved") && renderMaterialsGrid(materials, false)}
          {(isTeacher && activeTab === "pending") && renderMaterialsGrid(pendingMaterials, true)}
        </>
      )}
    </div>
  );
}

export default CourseMaterials;
