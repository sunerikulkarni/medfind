import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const FindMedicine = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | requesting | granted | denied | manual
  const [manualAddress, setManualAddress] = useState("");
  const [filters, setFilters] = useState({ verifiedOnly: false, availableOnly: false });
  const [sort, setSort] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestModal, setRequestModal] = useState(null); // result being requested

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { q: query, category };
      if (location) {
        params.lat = location.lat;
        params.lng = location.lng;
      }
      if (filters.verifiedOnly) params.verifiedOnly = "true";
      if (filters.availableOnly) params.availableOnly = "true";
      if (sort) params.sort = sort;

      const { data } = await api.get("/search/medicines", { params });
      setResults(data.results);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, category, location, filters, sort]);

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, filters, sort]);

  const handleSubmitSearch = (e) => {
    e.preventDefault();
    runSearch();
  };

  const submitRequest = async ({ quantity, note, urgency }) => {
    if (!user || role !== "patient") {
      navigate("/login");
      return;
    }
    try {
      await api.post("/requests", {
        pharmacyId: requestModal.pharmacyId,
        medicineId: requestModal.medicineId,
        quantityRequested: quantity,
        note,
        urgency,
      });
      setRequestModal(null);
      navigate("/requests");
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit request.");
    }
  };

  return (
    <div className="page find-medicine">
      <h1>Find Medicine</h1>

      <form className="search-bar" onSubmit={handleSubmitSearch}>
        <input
          type="text"
          placeholder="Search medicine name, e.g. Paracetamol"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      <div className="location-bar">
        {locationStatus === "granted" && location && (
          <span className="location-ok">Using your current location for distance sorting.</span>
        )}
        {locationStatus === "denied" && (
          <div className="manual-location">
            <span>Location access unavailable — you can still search, but distances won't show.</span>
          </div>
        )}
        {locationStatus === "requesting" && <span>Requesting location permission...</span>}
        <button type="button" className="btn btn-outline small" onClick={requestLocation}>
          Refresh location
        </button>
      </div>

      <div className="filters-bar">
        <label>
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
          />
          Verified pharmacies only
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
          />
          Available now
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort: Best match</option>
          <option value="distance">Sort: Distance</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="loading-state">Searching...</div>}

      {!loading && results.length === 0 && (
        <div className="empty-state">
          <p>No matching stock was found.</p>
          <p className="muted">Try a different medicine name, or contact a pharmacist or healthcare professional.</p>
        </div>
      )}

      <div className="results-grid">
        {results.map((r) => (
          <div className="result-card" key={`${r.medicineId}-${r.pharmacyId}`}>
            <div className="result-header">
              <h3>{r.name}</h3>
              {r.pharmacyVerified && <span className="badge-verified">Verified</span>}
            </div>
            <p className="muted">{r.strength} · {r.category}</p>
            <p className="pharmacy-line">
              <Link to={`/pharmacies/${r.pharmacyId}`}>{r.pharmacyName}</Link>
              {r.distanceKm !== null && <span> · {r.distanceKm} km</span>}
            </p>
            <p className="muted">{r.pharmacyAddress}</p>
            <p className="muted">{r.pharmacyPhone}</p>
            <div className="result-meta">
              <StatusBadge status={r.isOpenNow ? "COMPLETED" : "CANCELLED"} />
              <span className="muted">{r.isOpenNow ? "Open now" : "Closed"}</span>
              {r.isAvailable ? (
                <span className="stock-ok">In stock (~{r.quantityAvailable})</span>
              ) : (
                <span className="stock-out">Unavailable</span>
              )}
              {r.isLowStock && <span className="stock-low">Low stock</span>}
            </div>
            <div className="result-actions">
              <button
                className="btn btn-primary small"
                disabled={!r.isAvailable}
                onClick={() => setRequestModal(r)}
              >
                Request Medicine
              </button>
              <Link className="btn btn-outline small" to={`/pharmacies/${r.pharmacyId}`}>
                View Pharmacy
              </Link>
            </div>
          </div>
        ))}
      </div>

      {requestModal && (
        <RequestModal
          result={requestModal}
          onClose={() => setRequestModal(null)}
          onSubmit={submitRequest}
        />
      )}
    </div>
  );
};

const RequestModal = ({ result, onClose, onSubmit }) => {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Request {result.name}</h3>
        <p className="muted">from {result.pharmacyName}</p>
        <label>
          Quantity
          <input
            type="number"
            min={1}
            max={result.quantityAvailable}
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
        {urgency === "URGENT" && (
          <p className="alert alert-warning">
            Availability information may change. Contact the pharmacy before travelling.
          </p>
        )}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => onSubmit({ quantity, note, urgency })}
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindMedicine;
