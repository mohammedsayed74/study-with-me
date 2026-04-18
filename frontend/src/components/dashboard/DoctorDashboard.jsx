import { useState, useEffect } from "react";
import axios from "axios";
import DashboardCard from "./DashboardCard";
import RejectModal from "./RejectModal";

const AVATAR_COLORS = [
  "#2b8cee", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#06b6d4", "#6366f1", "#14b8a6", "#f97316",
];

function DoctorDashboard({ token }) {
  const [topRated, setTopRated] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [pending, setPending] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingContrib, setLoadingContrib] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchTopRated();
    fetchContributors();
    fetchPending();
  }, []);

  const fetchTopRated = async () => {
    try {
      const res = await axios.get("/api/dashboard/doctor/top-rated", { headers });
      setTopRated(res.data.data || []);
    } catch (err) {
      console.error("Failed to load top rated", err);
    } finally {
      setLoadingTop(false);
    }
  };

  const fetchContributors = async () => {
    try {
      const res = await axios.get("/api/dashboard/doctor/top-contributors", { headers });
      setContributors(res.data.data || []);
    } catch (err) {
      console.error("Failed to load contributors", err);
    } finally {
      setLoadingContrib(false);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await axios.get("/api/dashboard/doctor/pending", { headers });
      setPending(res.data.data || []);
    } catch (err) {
      console.error("Failed to load pending", err);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`/api/materials/${id}/approve`, {}, { headers });
      setPending((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert("Failed to approve: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id, reason, note) => {
    try {
      await axios.patch(
        `/api/dashboard/doctor/reject/${id}`,
        { rejectionReason: reason, rejectionNote: note },
        { headers }
      );
      setPending((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert("Failed to reject: " + (err.response?.data?.message || err.message));
    }
  };

  const renderStars = (avg) => {
    const stars = [];
    const rounded = Math.round(avg);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`material-symbols-outlined ${i > rounded ? "star-empty" : ""}`}
        >
          star
        </span>
      );
    }
    return (
      <>
        <span className="dash-stars">{stars}</span>
        <span className="dash-rating-value">{avg}</span>
      </>
    );
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRankClass = (i) => {
    if (i === 0) return "rank-1";
    if (i === 1) return "rank-2";
    if (i === 2) return "rank-3";
    return "rank-other";
  };

  const totalPending = pending.length;
  const totalFiles = topRated.length;
  const totalContributors = contributors.length;

  return (
    <>
      {/* ── Stat Cards ── */}
      <div className="dash-stats-row">
        <div className="dash-stat-card">
          <div className="dash-stat-icon amber">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div className="dash-stat-info">
            <h3>{totalPending}</h3>
            <div className="dash-stat-label">Pending Requests</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon green">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div className="dash-stat-info">
            <h3>{totalContributors}</h3>
            <div className="dash-stat-label">Active Contributors</div>
          </div>
        </div>
      </div>

      {/* ── Pending Upload Requests (full width) ── */}
      <DashboardCard
        icon="assignment"
        title="Pending Upload Requests"
        count={totalPending}
        loading={loadingPending}
      >
        {pending.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-icon">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
            <h4>All caught up!</h4>
            <p>No pending upload requests to review at the moment.</p>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>File Title</th>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Upload Date</th>
                  <th>Preview</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div className="dash-table-title">{m.title}</div>
                      <div className="dash-table-sub">PDF</div>
                    </td>
                    <td>{m.uploadedBy?.name || "Unknown"}</td>
                    <td>{m.courseCode}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(m.createdAt)}</td>
                    <td>
                      <a
                        href={m.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dash-btn dash-btn-view"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                        View
                      </a>
                    </td>
                    <td>
                      <div className="dash-actions-cell">
                        <button
                          className="dash-btn dash-btn-approve"
                          onClick={() => handleApprove(m._id)}
                        >
                          <span className="material-symbols-outlined">check</span>
                          Approve
                        </button>
                        <button
                          className="dash-btn dash-btn-reject"
                          onClick={() => setRejectTarget(m)}
                        >
                          <span className="material-symbols-outlined">close</span>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      {/* ── Two-column grid ── */}
      <div className="dash-grid-2">
        {/* Highest Rated Files */}
        <DashboardCard
          icon="workspace_premium"
          title="Highest Rated Files"
          count={topRated.slice(0, 3).length}
          loading={loadingTop}
        >
          {topRated.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <span className="material-symbols-outlined">star_border</span>
              </div>
              <h4>No rated files yet</h4>
              <p>Files will appear here once students start rating.</p>
            </div>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Rating</th>
                    <th>Reviews</th>
                    <th>Uploader</th>
                  </tr>
                </thead>
                <tbody>
                  {topRated.slice(0, 3).map((m) => (
                    <tr key={m._id}>
                      <td>
                        <div className="dash-table-title">{m.title}</div>
                        <div className="dash-table-sub">{m.courseCode}</div>
                      </td>
                      <td>{renderStars(m.averageRating)}</td>
                      <td>
                        <span className="dash-rating-count">{m.totalRatings}</span>
                      </td>
                      <td>{m.uploadedBy?.name || "Unknown"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>

        {/* Most Active Contributors */}
        <DashboardCard
          icon="emoji_events"
          title="Most Active Contributors"
          count={contributors.slice(0, 3).length}
          loading={loadingContrib}
        >
          {contributors.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <span className="material-symbols-outlined">person_off</span>
              </div>
              <h4>No contributors yet</h4>
              <p>Users who upload materials will appear here.</p>
            </div>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Uploads</th>
                    <th>Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {contributors.slice(0, 3).map((c, i) => (
                    <tr key={c._id}>
                      <td>
                        <span className={`contributor-rank ${getRankClass(i)}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td>
                        <div className="contributor-row">
                          <div
                            className="contributor-avatar"
                            style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                          >
                            {c.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="contributor-info">
                            <div className="contributor-name">{c.name}</div>
                            <div className="contributor-role">{c.role}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.totalUploads}</td>
                      <td style={{ fontWeight: 600, color: "#10b981" }}>{c.approvedUploads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* ── Rejection Modal ── */}
      {rejectTarget && (
        <RejectModal
          material={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}
    </>
  );
}

export default DoctorDashboard;
