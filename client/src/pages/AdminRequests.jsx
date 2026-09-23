import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/pharmacies", label: "Pharmacies" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/requests", label: "Requests / Reports" },
];

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    api.get("/admin/requests").then(({ data }) => setRequests(data.requests));
  }, []);

  const visible = statusFilter ? requests.filter((r) => r.status === statusFilter) : requests;

  const counts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const urgentCount = requests.filter((r) => r.urgency === "URGENT").length;

  return (
    <div className="dashboard-layout">
      <Sidebar title="Admin" links={links} />
      <main className="dashboard-content">
        <h1>Requests / Reports</h1>

        <div className="stats-row">
          <div className="stat-card"><span className="stat-value">{requests.length}</span><span className="stat-label">Total Requests</span></div>
          <div className="stat-card"><span className="stat-value">{counts.PENDING || 0}</span><span className="stat-label">Pending</span></div>
          <div className="stat-card"><span className="stat-value">{counts.CONFIRMED || 0}</span><span className="stat-label">Confirmed</span></div>
          <div className="stat-card"><span className="stat-value">{counts.COMPLETED || 0}</span><span className="stat-label">Completed</span></div>
          <div className="stat-card"><span className="stat-value">{counts.REJECTED || 0}</span><span className="stat-label">Rejected</span></div>
          <div className="stat-card"><span className="stat-value">{counts.CANCELLED || 0}</span><span className="stat-label">Cancelled</span></div>
          <div className="stat-card"><span className="stat-value">{urgentCount}</span><span className="stat-label">Urgent Requests</span></div>
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="">All statuses</option>
          {["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <table className="data-table">
          <thead>
            <tr><th>Medicine</th><th>Patient</th><th>Pharmacy</th><th>Qty</th><th>Urgency</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r._id}>
                <td data-label="Medicine">{r.medicine?.name}</td>
                <td data-label="Patient">{r.user?.fullName}</td>
                <td data-label="Pharmacy">{r.pharmacy?.pharmacyName}</td>
                <td data-label="Qty">{r.quantityRequested}</td>
                <td data-label="Urgency">{r.urgency}</td>
                <td data-label="Status"><StatusBadge status={r.status} /></td>
                <td data-label="Date">{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {visible.length === 0 && <tr><td colSpan={7} className="muted">No requests in this category.</td></tr>}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default AdminRequests;
