import { useState } from "react";

const REASONS = [
  { value: "duplicate", label: "Duplicate — This file already exists" },
  { value: "incomplete", label: "Incomplete — Missing content or pages" },
  { value: "not_appropriate", label: "Not Appropriate — Irrelevant or incorrect" },
  { value: "other", label: "Other" },
];

function RejectModal({ material, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    await onConfirm(material._id, reason, note);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dash-modal-header">
          <h3>Reject Material</h3>
          <button className="dash-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
          </button>
        </div>

        <div className="dash-modal-body">
          <p style={{ margin: "0 0 4px", fontSize: "0.84rem", color: "#64748b" }}>
            Rejecting: <strong style={{ color: "#1a1d26" }}>{material?.title}</strong>
          </p>

          <label style={{ marginTop: "16px" }}>Rejection Reason</label>
          <div className="dash-radio-group">
            {REASONS.map((r) => (
              <label
                key={r.value}
                className={`dash-radio-item ${reason === r.value ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="rejectionReason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                />
                {r.label}
              </label>
            ))}
          </div>

          <label>Additional Notes (optional)</label>
          <textarea
            className="dash-modal-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Provide additional feedback for the student..."
          />
        </div>

        <div className="dash-modal-footer">
          <button className="dash-modal-btn dash-modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="dash-modal-btn dash-modal-btn-confirm"
            onClick={handleSubmit}
            disabled={!reason || submitting}
          >
            {submitting ? "Rejecting..." : "Reject Material"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectModal;
