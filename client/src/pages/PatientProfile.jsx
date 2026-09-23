import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/find-medicine", label: "Search Medicine" },
  { to: "/pharmacies", label: "Pharmacies" },
  { to: "/saved-pharmacies", label: "Saved Pharmacies" },
  { to: "/requests", label: "Request History" },
  { to: "/profile", label: "Profile" },
];

const PatientProfile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const { data } = await api.put("/users/profile", {
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        ...(form.password ? { password: form.password } : {}),
      });
      setUser(data.user);
      localStorage.setItem("medfind_user", JSON.stringify(data.user));
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar title="Patient" links={links} />
      <main className="dashboard-content">
        <h1>Profile</h1>
        <form className="inline-form" onSubmit={submit}>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <label>Full name<input value={form.fullName} onChange={update("fullName")} /></label>
            <label>Phone<input value={form.phone} onChange={update("phone")} /></label>
            <label>Address<input value={form.address} onChange={update("address")} /></label>
            <label>New password (optional)<input type="password" value={form.password} onChange={update("password")} /></label>
          </div>
          <button className="btn btn-primary" type="submit">Save Changes</button>
        </form>
      </main>
    </div>
  );
};

export default PatientProfile;
