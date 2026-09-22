import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Pharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  useEffect(() => {
    api
      .get("/pharmacies", { params: verifiedOnly ? { verifiedOnly: "true" } : {} })
      .then(({ data }) => setPharmacies(data.pharmacies));
  }, [verifiedOnly]);

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
            <Link className="btn btn-outline small" to={`/pharmacies/${p._id}`}>View Pharmacy</Link>
          </div>
        ))}
        {pharmacies.length === 0 && <p className="muted">No pharmacies found.</p>}
      </div>
    </div>
  );
};

export default Pharmacies;
