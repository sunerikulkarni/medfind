import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/pharmacy", label: "Dashboard", end: true },
  { to: "/pharmacy/inventory", label: "Inventory" },
  { to: "/pharmacy/requests", label: "Medicine Requests" },
  { to: "/pharmacy/profile", label: "Pharmacy Profile" },
];

const PharmacyProfile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    pharmacyName: user?.pharmacyName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    openTime: user?.operatingHours?.open || "09:00",
    closeTime: user?.operatingHours?.close || "21:00",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const { data } = await api.put(`/pharmacies/${user._id}`, {
        pharmacyName: form.pharmacyName,
        phone: form.phone,
        address: form.address,
        operatingHours: { open: form.openTime, close: form.closeTime },
        ...(form.password ? { password: form.password } : {}),
      });
      setUser(data.pharmacy);
      localStorage.setItem("medfind_user", JSON.stringify(data.pharmacy));
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar title="Pharmacy" links={links} />
      <main className="dashboard-content">
        <h1>Pharmacy Profile</h1>
        <form className="inline-form" onSubmit={submit}>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <label>Pharmacy name<input value={form.pharmacyName} onChange={update("pharmacyName")} /></label>
            <label>Phone<input value={form.phone} onChange={update("phone")} /></label>
            <label>Address<input value={form.address} onChange={update("address")} /></label>
            <label>Opening time<input type="time" value={form.openTime} onChange={update("openTime")} /></label>
            <label>Closing time<input type="time" value={form.closeTime} onChange={update("closeTime")} /></label>
            <label>New password (optional)<input type="password" value={form.password} onChange={update("password")} /></label>
          </div>
          <button className="btn btn-primary" type="submit">Save Changes</button>
        </form>
      </main>
    </div>
  );
};

export default PharmacyProfile;
