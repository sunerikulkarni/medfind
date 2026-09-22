import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/find-medicine", label: "Search Medicine" },
  { to: "/requests", label: "Request History" },
  { to: "/profile", label: "Profile" },
];

const PatientDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get("/requests").then(({ data }) => setRequests(data.requests)).catch(() => {});
  }, []);

  const active = requests.filter((r) => ["PENDING", "CONFIRMED"].includes(r.status)).length;
  const completed = requests.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="dashboard-layout">
      <Sidebar title="Patient" links={links} />
      <main className="dashboard-content">
        <h1>Welcome, {user?.fullName}</h1>
        <div className="stats-row">
          <div className="stat-card"><span className="stat-value">{active}</span><span className="stat-label">Active Requests</span></div>
          <div className="stat-card"><span className="stat-value">{completed}</span><span className="stat-label">Completed Requests</span></div>
          <div className="stat-card"><span className="stat-value">{requests.length}</span><span className="stat-label">Total Requests</span></div>
        </div>

        <div className="dashboard-actions">
          <Link to="/find-medicine" className="btn btn-primary">Search Medicine</Link>
          <Link to="/pharmacies" className="btn btn-outline">Browse Pharmacies</Link>
        </div>

        <h2>Recent Requests</h2>
        <table className="data-table">
          <thead>
            <tr><th>Medicine</th><th>Pharmacy</th><th>Quantity</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {requests.slice(0, 5).map((r) => (
              <tr key={r._id}>
                <td data-label="Medicine">{r.medicine?.name}</td>
                <td data-label="Pharmacy">{r.pharmacy?.pharmacyName}</td>
                <td data-label="Quantity">{r.quantityRequested}</td>
                <td data-label="Status"><StatusBadge status={r.status} /></td>
                <td data-label="Date">{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={5} className="muted">No requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default PatientDashboard;
