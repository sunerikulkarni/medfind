import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PharmacyDetails = () => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState("");
  const [requestTarget, setRequestTarget] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get(`/pharmacies/${id}`)
      .then(({ data }) => {
        setPharmacy(data.pharmacy);
        setMedicines(data.medicines);
      })
      .catch((err) => setError(err.response?.data?.message || "Pharmacy not found."));
  }, [id]);

  useEffect(() => {
    if (role !== "patient") return;
    api.get("/users/profile").then(({ data }) => {
      const ids = (data.user.savedPharmacies || []).map((p) => p._id || p);
      setSaved(ids.includes(id));
    });
  }, [id, role]);

  const toggleSave = async () => {
    if (!user || role !== "patient") {
      navigate("/login");
      return;
    }
    await api.put(`/users/saved-pharmacies/${id}`);
    setSaved((s) => !s);
  };

  const submitRequest = async ({ quantity, note, urgency }) => {
    if (!user || role !== "patient") {
      navigate("/login");
      return;
    }
    try {
      await api.post("/requests", {
        pharmacyId: pharmacy._id,
        medicineId: requestTarget._id,
        quantityRequested: quantity,
        note,
        urgency,
      });
      setRequestTarget(null);
      navigate("/requests");
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit request.");
    }
  };

  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!pharmacy) return <div className="page">Loading...</div>;

  return (
    <div className="page pharmacy-details">
      <div className="pharmacy-header">
        <h1>{pharmacy.pharmacyName}</h1>
        {pharmacy.verificationStatus === "APPROVED" ? (
          <span className="badge-verified">Verified Pharmacy</span>
        ) : (
          <span className="badge-pending">Not yet verified</span>
        )}
      </div>
      <p className="muted">{pharmacy.address}</p>
      <p className="muted">
        Hours: {pharmacy.operatingHours?.open} – {pharmacy.operatingHours?.close} ·{" "}
        {pharmacy.isOpenNow ? "Open now" : "Closed now"}
      </p>
      <div className="result-actions">
        <a className="btn btn-outline small" href={`tel:${pharmacy.phone}`}>Call Pharmacy</a>
        {role === "patient" && (
          <button className="btn btn-outline small" onClick={toggleSave}>
            {saved ? "Unsave" : "Save Pharmacy"}
          </button>
        )}
      </div>

      <h2>Available Medicines</h2>
      <div className="results-grid">
        {medicines.length === 0 && <p className="muted">No medicines listed yet.</p>}
        {medicines.map((m) => {
          const available = !m.manuallyUnavailable && new Date(m.expiryDate) > new Date() && m.quantity > 0;
          const lowStock = m.quantity > 0 && m.quantity <= m.lowStockThreshold;
          return (
            <div className="result-card" key={m._id}>
              <h3>{m.name}</h3>
              <p className="muted">{m.strength} · {m.category}</p>
              <p className="muted">Price: ₹{m.price}</p>
              <div className="result-meta">
                {available ? (
                  <span className="stock-ok">In stock (~{m.quantity})</span>
                ) : (
                  <span className="stock-out">Unavailable</span>
                )}
                {lowStock && <span className="stock-low">Low stock</span>}
              </div>
              <button
                className="btn btn-primary small"
                disabled={!available}
                onClick={() => setRequestTarget(m)}
              >
                Request Medicine
              </button>
            </div>
          );
        })}
      </div>

      {requestTarget && (
        <RequestModal
          medicine={requestTarget}
          onClose={() => setRequestTarget(null)}
          onSubmit={submitRequest}
        />
      )}
    </div>
  );
};

const RequestModal = ({ medicine, onClose, onSubmit }) => {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Request {medicine.name}</h3>
        <label>
          Quantity
          <input
            type="number"
            min={1}
            max={medicine.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </label>
        <label>
          Note (optional)
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
        </label>
        <label>
          Urgency
          <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="NORMAL">Normal</option>
            <option value="URGENT">Urgent</option>
          </select>
        </label>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSubmit({ quantity, note, urgency })}>
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetails;
