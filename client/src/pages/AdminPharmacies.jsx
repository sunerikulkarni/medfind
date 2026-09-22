import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/pharmacies", label: "Pharmacies" },
  { to: "/admin/users", label: "Users" },
];

const AdminPharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [filter, setFilter] = useState("PENDING");

  const load = () => api.get("/admin/pharmacies").then(({ data }) => setPharmacies(data.pharmacies));
  useEffect(load, []);

  const approve = async (id) => { await api.put(`/admin/pharmacies/${id}/approve`); load(); };
  const reject = async (id) => {
    const reason = window.prompt("Reason for rejection:") || undefined;
    await api.put(`/admin/pharmacies/${id}/reject`, { reason });
    load();
  };
  const suspend = async (id) => {
    if (!window.confirm("Suspend this pharmacy?")) return;
    await api.put(`/admin/pharmacies/${id}/suspend`);
    load();
  };

  const visible = filter ? pharmacies.filter((p) => p.verificationStatus === filter) : pharmacies;

  return (
    <div className="dashboard-layout">
      <Sidebar title="Admin" links={links} />
      <main className="dashboard-content">
        <h1>Pharmacies</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Owner</th><th>License</th><th>Address</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p._id}>
                <td data-label="Name">{p.pharmacyName}</td>
                <td data-label="Owner">{p.ownerName}</td>
                <td data-label="License">{p.licenseNumber}</td>
                <td data-label="Address">{p.address}</td>
                <td data-label="Status"><StatusBadge status={p.verificationStatus} /></td>
                <td data-label="Actions" className="actions-cell">
                  {p.verificationStatus === "PENDING" && (
                    <>
                      <button className="btn btn-primary small" onClick={() => approve(p._id)}>Approve</button>
                      <button className="btn btn-outline small danger" onClick={() => reject(p._id)}>Reject</button>
                    </>
                  )}
                  {p.verificationStatus === "APPROVED" && (
                    <button className="btn btn-outline small danger" onClick={() => suspend(p._id)}>Suspend</button>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && <tr><td colSpan={6} className="muted">No pharmacies in this category.</td></tr>}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default AdminPharmacies;
