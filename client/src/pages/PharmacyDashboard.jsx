import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/pharmacy", label: "Dashboard", end: true },
  { to: "/pharmacy/inventory", label: "Inventory" },
  { to: "/pharmacy/requests", label: "Medicine Requests" },
  { to: "/pharmacy/profile", label: "Pharmacy Profile" },
];

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/pharmacies/me/dashboard").then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar title="Pharmacy" links={links} />
      <main className="dashboard-content">
        <h1>{user?.pharmacyName}</h1>
        {stats?.verificationStatus !== "APPROVED" && (
          <div className="alert alert-warning">
            Your pharmacy is currently <StatusBadge status={stats?.verificationStatus} />. It will
            become visible to patients once an admin approves it.
          </div>
        )}
        {stats && (
          <div className="stats-row">
            <div className="stat-card"><span className="stat-value">{stats.totalMedicines}</span><span className="stat-label">Total Medicines</span></div>
            <div className="stat-card"><span className="stat-value">{stats.availableMedicines}</span><span className="stat-label">Available</span></div>
            <div className="stat-card"><span className="stat-value">{stats.lowStock}</span><span className="stat-label">Low Stock</span></div>
            <div className="stat-card"><span className="stat-value">{stats.pendingRequests}</span><span className="stat-label">Pending Requests</span></div>
            <div className="stat-card"><span className="stat-value">{stats.completedRequests}</span><span className="stat-label">Completed Requests</span></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PharmacyDashboard;
