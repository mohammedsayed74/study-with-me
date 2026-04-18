import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import StarRating from "../StarRating";

function MaterialsView({ courseCode, onBack, onUpload, onQuestionBank }) {
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

  const isTeacher = user?.role === "teacher";

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
        <div className="materials-empty" style={{ 
          padding: '60px 20px', 
          textAlign: 'center', 
          background: '#fff', 
          borderRadius: '24px', 
          border: '1px dashed var(--dash-border)',
          marginTop: '20px'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--dash-bg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px',
            color: 'var(--dash-text-muted)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
              {isPendingView ? "task" : "folder_open"}
            </span>
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700 }}>{isPendingView ? "All caught up!" : "No materials yet."}</h3>
          <p style={{ margin: 0, color: 'var(--dash-text-muted)' }}>
            {isPendingView
              ? "Hooray! No pending materials to review at the moment."
              : `There are currently no approved materials for ${courseCode}.`
            }
          </p>
        </div>
      );
    }

    return (
      <div className="materials-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px',
        marginTop: '24px'
      }}>
        {data.map((material) => (
          <div key={material._id} className="material-card" style={{ 
            backgroundColor: '#fff', 
            padding: '24px', 
            borderRadius: '20px', 
            border: '1px solid var(--dash-border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: 'var(--dash-danger-bg)', 
                color: 'var(--dash-danger)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>picture_as_pdf</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--dash-text)' }}>{material.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--dash-text-muted)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                  {material.uploadedBy?.name || "Unknown"}
                </div>
              </div>
            </div>

            {!isPendingView && (
              <div style={{ marginBottom: '20px' }}>
                <StarRating material={material} />
              </div>
            )}

            <div className="material-actions" style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              <a
                href={material.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dash-btn dash-btn-view"
                style={{ flex: 1, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                View
              </a>

              {isTeacher && isPendingView && (
                <>
                  <button
                    onClick={() => handleApprove(material._id)}
                    className="dash-btn dash-btn-approve"
                    style={{ backgroundColor: 'var(--dash-success)', color: '#fff', padding: '10px' }}
                    title="Approve"
                  >
                    <span className="material-symbols-outlined">check</span>
                  </button>
                  <button
                    onClick={() => handleDeleteOrReject(material._id, true)}
                    className="dash-btn"
                    style={{ backgroundColor: 'var(--dash-danger)', color: '#fff', padding: '10px' }}
                    title="Reject"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              )}

              {isTeacher && !isPendingView && (
                <button
                  onClick={() => handleDeleteOrReject(material._id, false)}
                  className="dash-btn"
                  style={{ backgroundColor: 'var(--dash-danger)', color: '#fff', padding: '10px', flex: '0 0 44px' }}
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
    <div className="materials-view" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="dash-btn dash-btn-view" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px' }}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Courses
          </button>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>{courseCode} Materials</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onQuestionBank} className="dash-btn dash-btn-view" style={{ padding: '10px 22px', fontWeight: 600, borderRadius: '12px', border: '1px solid var(--dash-primary)', color: 'var(--dash-primary)' }}>
            Question Bank
          </button>
          <button onClick={onUpload} className="dash-btn dash-btn-approve" style={{ padding: '10px 22px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', backgroundColor: 'var(--dash-primary)', boxShadow: '0 4px 12px rgba(43, 140, 238, 0.2)' }}>
            <span className="material-symbols-outlined">add_circle</span>
            Upload Material
          </button>
        </div>
      </div>

      {error && <div className="materials-error" style={{ marginBottom: '24px' }}>{error}</div>}

      {isTeacher && (
        <div className="materials-tabs" style={{ 
          display: 'inline-flex', 
          backgroundColor: '#fff', 
          padding: '6px', 
          borderRadius: '14px', 
          border: '1px solid var(--dash-border)',
          marginBottom: '32px'
        }}>
          <button
            className={`tab-btn ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => setActiveTab("approved")}
            style={{ 
              padding: '10px 24px', 
              borderRadius: '10px', 
              border: 'none', 
              backgroundColor: activeTab === "approved" ? 'var(--dash-primary)' : 'transparent',
              color: activeTab === "approved" ? '#fff' : 'var(--dash-text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Approved ({materials.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
            style={{ 
              padding: '10px 24px', 
              borderRadius: '10px', 
              border: 'none', 
              backgroundColor: activeTab === "pending" ? 'var(--dash-primary)' : 'transparent',
              color: activeTab === "pending" ? '#fff' : 'var(--dash-text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Pending ({pendingMaterials.length})
          </button>
        </div>
      )}

      {(!isTeacher || activeTab === "approved") && (
        <div className="home-search-container" style={{ 
          marginBottom: '32px', 
          backgroundColor: '#fff', 
          padding: '20px', 
          borderRadius: '20px', 
          border: '1px solid var(--dash-border)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)', fontSize: '20px' }}>search</span>
              <input
                type="text"
                placeholder="Search material title..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid var(--dash-border)', outline: 'none', fontSize: '0.95rem' }}
              />
            </div>
            <select 
              value={searchSort} 
              onChange={(e) => { setSearchSort(e.target.value); executeSearch(); }}
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--dash-border)', backgroundColor: '#fff', color: 'var(--dash-text)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="mostRated">Most Rated</option>
              <option value="highestRated">Highest Rated</option>
            </select>
            <button className="dash-btn dash-btn-approve" onClick={executeSearch} style={{ padding: '10px 24px', color: '#fff', backgroundColor: 'var(--dash-primary)' }}>
              Search
            </button>
            {(searchKeyword || searchSort !== "newest") && (
              <button className="clear-search-btn" onClick={() => {
                setSearchKeyword("");
                setSearchSort("newest");
                if (currentPage !== 1) setCurrentPage(1);
                else setFetchTrigger(prev => prev + 1);
              }} style={{ backgroundColor: 'var(--dash-danger-bg)', color: 'var(--dash-danger)', border: 'none' }}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="materials-loading" style={{ padding: '100px 0' }}>
          <div className="spinner"></div>
          <p>Loading course content...</p>
        </div>
      ) : (
        <>
          {(!isTeacher || activeTab === "approved") && (
            <>
              {renderMaterialsGrid(materials, false)}
              <div className="pagination" style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="dash-btn dash-btn-view"
                  style={{ padding: '8px 20px', borderRadius: '10px' }}
                >
                  Previous
                </button>
                <span className="pagination-info" style={{ fontWeight: 600, color: 'var(--dash-text-secondary)' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="dash-btn dash-btn-view"
                  style={{ padding: '8px 20px', borderRadius: '10px' }}
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

export default MaterialsView;
