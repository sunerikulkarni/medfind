import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const links = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/find-medicine", label: "Search Medicine" },
  { to: "/pharmacies", label: "Pharmacies" },
  { to: "/saved-pharmacies", label: "Saved Pharmacies" },
  { to: "/requests", label: "Request History" },
  { to: "/profile", label: "Profile" },
];

const SavedPharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/users/profile")
      .then(({ data }) => setPharmacies(data.user.savedPharmacies || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const unsave = async (id) => {
    await api.put(`/users/saved-pharmacies/${id}`);
    load();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar title="Patient" links={links} />
      <main className="dashboard-content">
        <h1>Saved Pharmacies</h1>
        {loading && <div className="loading-state">Loading...</div>}
        {!loading && pharmacies.length === 0 && (
          <div className="empty-state">
            <p>You haven't saved any pharmacies yet.</p>
            <Link className="btn btn-primary" to="/pharmacies">Browse Pharmacies</Link>
          </div>
        )}
        <div className="results-grid">
          {pharmacies.map((p) => (
            <div className="result-card" key={p._id}>
              <h3>{p.pharmacyName}</h3>
              {p.verificationStatus === "APPROVED" && <span className="badge-verified">Verified</span>}
              <p className="muted">{p.address}</p>
              <p className="muted">{p.phone}</p>
              <div className="result-actions">
                <Link className="btn btn-outline small" to={`/pharmacies/${p._id}`}>View Pharmacy</Link>
                <button className="btn btn-outline small danger" onClick={() => unsave(p._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SavedPharmacies;
