import { useState, useEffect } from "react";
import axios from "axios";
import DashboardCard from "./DashboardCard";
import StatusBadge from "./StatusBadge";

function StudentDashboard({ token }) {
  const [ratings, setRatings] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [loadingUploads, setLoadingUploads] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchRatings();
    fetchUploads();
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

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

      {/* ── Two-column grid ── */}
      <div className="dash-grid-2">
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

        {/* My Latest Uploads */}
        <DashboardCard
          icon="cloud_upload"
          title="My Latest Uploads"
          count={uploads.length}
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
                  {uploads.map((u) => (
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
      </div>

      {/* Activity History — placeholder */}
      <DashboardCard icon="history" title="Activity History" loading={false}>
        <div className="dash-empty">
          <div className="dash-empty-icon">
            <span className="material-symbols-outlined">update</span>
          </div>
          <h4>Activity tracking coming soon</h4>
          <p>
            Your file edits, deletions, and updates will be logged here in a
            future update.
          </p>
        </div>
      </DashboardCard>
    </>
  );
}

export default StudentDashboard;
