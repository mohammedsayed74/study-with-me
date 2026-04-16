import { useState, useEffect } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./materials.css";
import "./home.css";
import StarRating from "../components/StarRating";

function CourseMaterials() {
  const { courseCode } = useParams();
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("approved"); 
  
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchSort, setSearchSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchTrigger, setFetchTrigger] = useState(0);


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
      
      const searchParams = new URLSearchParams({
        courseCode: courseCode,
        page: currentPage,
        limit: 10
      });
      if (searchKeyword) searchParams.append("keyword", searchKeyword);
      if (searchSort) searchParams.append("sort", searchSort);

      const approvedRes = await axios.get(`/api/materials/search?${searchParams.toString()}`, { headers });
      setMaterials(approvedRes.data.data || []);
      setTotalPages(approvedRes.data.totalPages || 1);

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
  }, [courseCode, token, isTeacher, currentPage, fetchTrigger]);

  const executeSearch = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      setFetchTrigger(prev => prev + 1);
    }
  };

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
          <h3>{isPendingView ? "All caught up!" : "No materials yet."}</h3>
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
              {!isPendingView && <StarRating material={material} />}
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

      <button className="back-btn" onClick={() => navigate("/home")}>
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
        Back
      </button>

      <div className="materials-header">

        <h1>{courseCode} Materials</h1>
        <p> course resources</p>
        <Link
  to={`/course/${courseCode}/question-bank`}
  className="material-btn btn-primary"
  style={{
    display: "inline-flex",
    marginTop: "1rem",
    padding: "0.6rem 1.5rem",
    width: "auto"
  }}
>
  Question Bank
</Link>
        <br/>

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

      {(!isTeacher || activeTab === "approved") && (
        <div className="home-search-container" style={{ marginTop: '2rem' }}>
          <input 
            type="text" 
            placeholder="Search material title..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
          />
          <select value={searchSort} onChange={(e) => {
            setSearchSort(e.target.value);
            executeSearch();
          }}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="mostRated">Most Rated</option>
            <option value="highestRated">Highest Rated</option>
          </select>
          <button className="search-btn" onClick={executeSearch}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>search</span>
            Search
          </button>
          {(searchKeyword || searchSort !== "newest") && (
            <button className="clear-search-btn" onClick={() => { 
                setSearchKeyword(""); 
                setSearchSort("newest"); 
                if (currentPage !== 1) {
                    setCurrentPage(1);
                } else {
                    setFetchTrigger(prev => prev + 1);
                }
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              Clear
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="materials-loading">
          <div className="spinner"></div>
          <p>Loading course content...</p>
        </div>
      ) : (
        <>
          {(!isTeacher || activeTab === "approved") && (
             <>
               {renderMaterialsGrid(materials, false)}
               <div className="pagination">
                 <button 
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   disabled={currentPage === 1}
                   className="pagination-btn"
                 >
                   Previous
                 </button>
                 <span className="pagination-info">
                   Page {currentPage} of {totalPages}
                 </span>
                 <button 
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   disabled={currentPage >= totalPages}
                   className="pagination-btn"
                 >
                   Next
                 </button>
               </div>
             </>
          )}
          {(isTeacher && activeTab === "pending") && renderMaterialsGrid(
            pendingMaterials.filter(m => !searchKeyword || m.title.toLowerCase().includes(searchKeyword.toLowerCase())),
            true
          )}
        </>
      )}
    </div>
  );
}

export default CourseMaterials;
