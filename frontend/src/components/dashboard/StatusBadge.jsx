function StatusBadge({ status }) {
  const label = status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  const cls = `status-badge status-badge--${status || 'pending'}`;

  return (
    <span className={cls}>
      <span className="status-badge-dot"></span>
      {label}
    </span>
  );
}

export default StatusBadge;
