import { useState, useEffect } from "react";
import axios from "axios";
import DashboardCard from "./DashboardCard";
import StatusBadge from "./StatusBadge";

const AVATAR_COLORS = [
  "#2b8cee", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#06b6d4", "#6366f1", "#14b8a6", "#f97316",
];

function StudentDashboard({ token }) {
  const [ratings, setRatings] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingContrib, setLoadingContrib] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchRatings();
    fetchUploads();
    fetchTopRated();
    fetchContributors();
  }, []);

  const fetchRatings = async () => {
    try {
      const res = await axios.get("/api/dashboard/student/my-ratings", { headers });
      setRatings(res.data.data || []);
    } catch (err) {
      console.error("Failed to load ratings", err);
    } finally {
      setLoadingRatings(false);
    }
  };

  const fetchUploads = async () => {
    try {
      const res = await axios.get("/api/dashboard/student/my-uploads", { headers });
      setUploads(res.data.data || []);
    } catch (err) {
      console.error("Failed to load uploads", err);
    } finally {
      setLoadingUploads(false);
    }
  };

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

  const renderStars = (score) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`material-symbols-outlined ${i > score ? "star-empty" : ""}`}
        >
          star
        </span>
      );
    }
    return <span className="dash-stars">{stars}</span>;
  };

  const renderStarsWithAvg = (avg) => {
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

  const totalUploads = uploads.length;
  const approvedCount = uploads.filter((u) => u.status === "approved").length;
  const pendingCount = uploads.filter((u) => u.status === "pending").length;
  const rejectedCount = uploads.filter((u) => u.status === "rejected").length;

  return (
    <>
      {/* ── Stat Cards ── */}
      <div className="dash-stats-row">
        <div className="dash-stat-card">
          <div className="dash-stat-icon blue">
            <span className="material-symbols-outlined">upload_file</span>
          </div>
          <div className="dash-stat-info">
            <h3>{totalUploads}</h3>
            <div className="dash-stat-label">Total Uploads</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon green">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div className="dash-stat-info">
            <h3>{approvedCount}</h3>
            <div className="dash-stat-label">Approved</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon amber">
            <span className="material-symbols-outlined">schedule</span>
          </div>
          <div className="dash-stat-info">
            <h3>{pendingCount}</h3>
            <div className="dash-stat-label">Pending</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon purple">
            <span className="material-symbols-outlined">star</span>
          </div>
          <div className="dash-stat-info">
            <h3>{ratings.length}</h3>
            <div className="dash-stat-label">Ratings Given</div>
          </div>
        </div>
      </div>

      {/* My Latest Ratings */}
      <DashboardCard
        icon="rate_review"
        title="My Latest Ratings"
        count={ratings.length}
        loading={loadingRatings}
      >
        {ratings.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-icon">
              <span className="material-symbols-outlined">star_border</span>
            </div>
            <h4>No ratings yet</h4>
            <p>Your ratings on uploaded materials will appear here.</p>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Subject</th>
                  <th>My Rating</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r) => (
                  <tr key={r._id}>
                    <td className="dash-table-title">{r.title}</td>
                    <td>{r.courseCode}</td>
                    <td>{renderStars(r.score)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(r.ratedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      {/* Latest 3 Uploads */}
      <DashboardCard
        icon="cloud_upload"
        title="My Latest Uploads"
        count={uploads.slice(0, 3).length}
        loading={loadingUploads}
      >
        {uploads.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-icon">
              <span className="material-symbols-outlined">cloud_off</span>
            </div>
            <h4>No uploads yet</h4>
            <p>Start contributing by uploading study materials.</p>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {uploads.slice(0, 3).map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="dash-table-title">{u.title}</div>
                      <div className="dash-table-sub">PDF</div>
                    </td>
                    <td>{u.courseCode}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(u.createdAt)}</td>
                    <td>
                      <StatusBadge status={u.status} />
                      {u.status === "rejected" && u.rejectionReason && (
                        <div className="rejection-feedback">
                          <div className="rejection-feedback-reason">
                            {u.rejectionReason.replace("_", " ")}
                          </div>
                          {u.rejectionNote && (
                            <div className="rejection-feedback-note">{u.rejectionNote}</div>
                          )}
                        </div>
                      )}
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
          count={topRated.length}
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
                  {topRated.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <div className="dash-table-title">{m.title}</div>
                        <div className="dash-table-sub">{m.courseCode}</div>
                      </td>
                      <td>{renderStarsWithAvg(m.averageRating)}</td>
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
          count={contributors.length}
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
                  {contributors.map((c, i) => (
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
    </>
  );
}

export default StudentDashboard;
