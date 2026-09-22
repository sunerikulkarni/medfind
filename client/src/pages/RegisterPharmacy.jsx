import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPharmacy = () => {
  const { registerPharmacy } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pharmacyName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    address: "",
    lat: "",
    lng: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        })),
      () => {}
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.lat || !form.lng) {
      setError("Latitude and longitude are required. Use the location button or enter them manually.");
      return;
    }
    setSubmitting(true);
    try {
      await registerPharmacy({ ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) });
      navigate("/pharmacy");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <form className="auth-card wide" onSubmit={handleSubmit}>
        <h2>Register your pharmacy</h2>
        <p className="form-note">
          New pharmacies start with PENDING verification status and become visible to patients
          once an admin approves the registration.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          <label>Pharmacy name<input required value={form.pharmacyName} onChange={update("pharmacyName")} /></label>
          <label>Owner name<input required value={form.ownerName} onChange={update("ownerName")} /></label>
          <label>Email<input type="email" required value={form.email} onChange={update("email")} /></label>
          <label>Phone<input required value={form.phone} onChange={update("phone")} /></label>
          <label>Password<input type="password" required minLength={6} value={form.password} onChange={update("password")} /></label>
          <label>Confirm password<input type="password" required value={form.confirmPassword} onChange={update("confirmPassword")} /></label>
          <label>Registration/license number<input required value={form.licenseNumber} onChange={update("licenseNumber")} /></label>
          <label>Address<input required value={form.address} onChange={update("address")} /></label>
          <label>Latitude<input required type="number" step="any" value={form.lat} onChange={update("lat")} /></label>
          <label>Longitude<input required type="number" step="any" value={form.lng} onChange={update("lng")} /></label>
        </div>
        <button type="button" className="btn btn-outline small" onClick={useMyLocation}>
          Use my current location
        </button>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Register Pharmacy"}
        </button>
        <p className="auth-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPharmacy;
