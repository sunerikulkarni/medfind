import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/pharmacies", label: "Pharmacies" },
  { to: "/admin/users", label: "Users" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar title="Admin" links={links} />
      <main className="dashboard-content">
        <h1>Admin Dashboard</h1>
        {stats && (
          <div className="stats-row">
            <div className="stat-card"><span className="stat-value">{stats.totalUsers}</span><span className="stat-label">Total Users</span></div>
            <div className="stat-card"><span className="stat-value">{stats.totalPharmacies}</span><span className="stat-label">Total Pharmacies</span></div>
            <div className="stat-card"><span className="stat-value">{stats.verifiedPharmacies}</span><span className="stat-label">Verified Pharmacies</span></div>
            <div className="stat-card"><span className="stat-value">{stats.pendingPharmacies}</span><span className="stat-label">Pending Pharmacies</span></div>
            <div className="stat-card"><span className="stat-value">{stats.totalMedicines}</span><span className="stat-label">Total Medicines</span></div>
            <div className="stat-card"><span className="stat-value">{stats.activeRequests}</span><span className="stat-label">Active Requests</span></div>
            <div className="stat-card"><span className="stat-value">{stats.completedRequests}</span><span className="stat-label">Completed Requests</span></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
