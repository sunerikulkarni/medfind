import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterUser = () => {
  const { registerPatient } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude })),
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
    setSubmitting(true);
    try {
      await registerPatient(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create a patient account</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Full name<input required value={form.fullName} onChange={update("fullName")} /></label>
        <label>Email<input type="email" required value={form.email} onChange={update("email")} /></label>
        <label>Phone number<input required value={form.phone} onChange={update("phone")} /></label>
        <label>Password<input type="password" required minLength={6} value={form.password} onChange={update("password")} /></label>
        <label>Confirm password<input type="password" required value={form.confirmPassword} onChange={update("confirmPassword")} /></label>
        <label>Address<input required value={form.address} onChange={update("address")} /></label>
        <button type="button" className="btn btn-outline small" onClick={useMyLocation}>
          Use my current location
        </button>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterUser;
