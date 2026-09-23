import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Pharmacies = () => {
  const { user, role } = useAuth();
  const [pharmacies, setPharmacies] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    api
      .get("/pharmacies", { params: verifiedOnly ? { verifiedOnly: "true" } : {} })
      .then(({ data }) => setPharmacies(data.pharmacies));
  }, [verifiedOnly]);

  useEffect(() => {
    if (role !== "patient") return;
    api.get("/users/profile").then(({ data }) => {
      setSavedIds((data.user.savedPharmacies || []).map((p) => p._id || p));
    });
  }, [role]);

  const toggleSave = async (id) => {
    if (!user || role !== "patient") return;
    await api.put(`/users/saved-pharmacies/${id}`);
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="page">
      <h1>Pharmacies</h1>
      <label>
        <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
        Verified pharmacies only
      </label>
      <div className="results-grid">
        {pharmacies.map((p) => (
          <div className="result-card" key={p._id}>
            <h3>{p.pharmacyName}</h3>
            {p.verificationStatus === "APPROVED" && <span className="badge-verified">Verified</span>}
            <p className="muted">{p.address}</p>
            <p className="muted">{p.phone}</p>
            <div className="result-actions">
              <Link className="btn btn-outline small" to={`/pharmacies/${p._id}`}>View Pharmacy</Link>
              {role === "patient" && (
                <button className="btn btn-outline small" onClick={() => toggleSave(p._id)}>
                  {savedIds.includes(p._id) ? "Unsave" : "Save"}
                </button>
              )}
            </div>
          </div>
        ))}
        {pharmacies.length === 0 && <p className="muted">No pharmacies found.</p>}
      </div>
    </div>
  );
};

export default Pharmacies;
