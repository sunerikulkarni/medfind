import React from "react";

const COLORS = {
  PENDING: "#b45309",
  CONFIRMED: "#1d4ed8",
  REJECTED: "#b91c1c",
  CANCELLED: "#6b7280",
  COMPLETED: "#15803d",
  APPROVED: "#15803d",
  SUSPENDED: "#b91c1c",
};

const BG = {
  PENDING: "#fef3c7",
  CONFIRMED: "#dbeafe",
  REJECTED: "#fee2e2",
  CANCELLED: "#f3f4f6",
  COMPLETED: "#dcfce7",
  APPROVED: "#dcfce7",
  SUSPENDED: "#fee2e2",
};

const StatusBadge = ({ status }) => (
  <span
    className="status-badge"
    style={{ color: COLORS[status] || "#374151", background: BG[status] || "#f3f4f6" }}
  >
    {status}
  </span>
);

export default StatusBadge;
