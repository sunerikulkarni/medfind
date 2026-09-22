import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

const links = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/find-medicine", label: "Search Medicine" },
  { to: "/requests", label: "Request History" },
  { to: "/profile", label: "Profile" },
];

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/requests")
      .then(({ data }) => setRequests(data.requests))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this request?")) return;
    try {
      await api.delete(`/requests/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel request.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar title="Patient" links={links} />
      <main className="dashboard-content">
        <h1>Request History</h1>
        {loading && <div className="loading-state">Loading...</div>}
        <table className="data-table">
          <thead>
            <tr>
              <th>Medicine</th><th>Pharmacy</th><th>Quantity</th><th>Urgency</th>
              <th>Status</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td data-label="Medicine">{r.medicine?.name}</td>
                <td data-label="Pharmacy">{r.pharmacy?.pharmacyName}</td>
                <td data-label="Quantity">{r.quantityRequested}</td>
                <td data-label="Urgency">{r.urgency}</td>
                <td data-label="Status"><StatusBadge status={r.status} /></td>
                <td data-label="Date">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td data-label="Actions">
                  {["PENDING", "CONFIRMED"].includes(r.status) && (
                    <button className="btn btn-outline small" onClick={() => cancel(r._id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && requests.length === 0 && (
              <tr><td colSpan={7} className="muted">No requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default RequestHistory;
