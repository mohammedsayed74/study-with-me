function DashboardCard({ icon, title, count, loading, children }) {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div className="dash-card-header-left">
          <span className="material-symbols-outlined">{icon}</span>
          <h3>{title}</h3>
          {count !== undefined && count !== null && (
            <span className="dash-card-count">{count}</span>
          )}
        </div>
      </div>
      <div className="dash-card-body">
        {loading ? <SkeletonRows /> : children}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="dash-skeleton">
      {[1, 2, 3].map((i) => (
        <div className="dash-skeleton-row" key={i}>
          <div className="skel-block skel-circle"></div>
          <div style={{ flex: 1 }}>
            <div className="skel-block skel-line-lg"></div>
            <div className="skel-block skel-line-sm"></div>
          </div>
          <div className="skel-block skel-badge"></div>
        </div>
      ))}
    </div>
  );
}

export default DashboardCard;
