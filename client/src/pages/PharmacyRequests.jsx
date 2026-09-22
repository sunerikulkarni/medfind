import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

const links = [
  { to: "/pharmacy", label: "Dashboard", end: true },
  { to: "/pharmacy/inventory", label: "Inventory" },
  { to: "/pharmacy/requests", label: "Medicine Requests" },
  { to: "/pharmacy/profile", label: "Pharmacy Profile" },
];

const PharmacyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("");

  const load = () => {
    const params = filter ? { status: filter } : {};
    api.get("/requests", { params }).then(({ data }) => setRequests(data.requests));
  };
  useEffect(load, [filter]);

  const updateStatus = async (id, status) => {
    let reason;
    if (status === "REJECTED") {
      reason = window.prompt("Reason for rejecting this request (optional):") || undefined;
    }
    try {
      await api.put(`/requests/${id}/status`, { status, reason });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update request.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar title="Pharmacy" links={links} />
      <main className="dashboard-content">
        <h1>Medicine Requests</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="">All statuses</option>
          {["PENDING","CONFIRMED","REJECTED","CANCELLED","COMPLETED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <table className="data-table">
          <thead>
            <tr><th>Patient</th><th>Medicine</th><th>Qty</th><th>Urgency</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td data-label="Patient">{r.user?.fullName}<br /><span className="muted">{r.user?.phone}</span></td>
                <td data-label="Medicine">{r.medicine?.name}</td>
                <td data-label="Qty">{r.quantityRequested}</td>
                <td data-label="Urgency">{r.urgency === "URGENT" ? <strong>URGENT</strong> : "Normal"}</td>
                <td data-label="Status"><StatusBadge status={r.status} /></td>
                <td data-label="Date">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td data-label="Actions" className="actions-cell">
                  {r.status === "PENDING" && (
                    <>
                      <button className="btn btn-primary small" onClick={() => updateStatus(r._id, "CONFIRMED")}>Confirm</button>
                      <button className="btn btn-outline small danger" onClick={() => updateStatus(r._id, "REJECTED")}>Reject</button>
                    </>
                  )}
                  {r.status === "CONFIRMED" && (
                    <button className="btn btn-primary small" onClick={() => updateStatus(r._id, "COMPLETED")}>Mark Completed</button>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && <tr><td colSpan={7} className="muted">No requests.</td></tr>}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default PharmacyRequests;
