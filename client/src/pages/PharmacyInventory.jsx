import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const links = [
  { to: "/pharmacy", label: "Dashboard", end: true },
  { to: "/pharmacy/inventory", label: "Inventory" },
  { to: "/pharmacy/requests", label: "Medicine Requests" },
  { to: "/pharmacy/profile", label: "Pharmacy Profile" },
];

const emptyForm = {
  name: "", genericName: "", category: "", strength: "", form: "tablet",
  manufacturer: "", batchNumber: "", expiryDate: "", quantity: 0,
  lowStockThreshold: 5, price: 0,
};

const PharmacyInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.get("/medicines").then(({ data }) => setMedicines(data.medicines));
  useEffect(() => { load(); }, []);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.type === "number" ? Number(e.target.value) : e.target.value });

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/medicines/${editingId}`, form);
      } else {
        await api.post("/medicines", form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save medicine.");
    }
  };

  const editMedicine = (m) => {
    setEditingId(m._id);
    setForm({
      name: m.name, genericName: m.genericName || "", category: m.category,
      strength: m.strength || "", form: m.form, manufacturer: m.manufacturer || "",
      batchNumber: m.batchNumber || "", expiryDate: m.expiryDate?.slice(0, 10),
      quantity: m.quantity, lowStockThreshold: m.lowStockThreshold, price: m.price,
    });
  };

  const toggleUnavailable = async (m) => {
    await api.put(`/medicines/${m._id}`, { manuallyUnavailable: !m.manuallyUnavailable });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;
    await api.delete(`/medicines/${id}`);
    load();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar title="Pharmacy" links={links} />
      <main className="dashboard-content">
        <h1>Inventory</h1>

        <form className="inline-form" onSubmit={submit}>
          <h3>{editingId ? "Edit Medicine" : "Add Medicine"}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <label>Name<input required value={form.name} onChange={update("name")} /></label>
            <label>Generic name<input value={form.genericName} onChange={update("genericName")} /></label>
            <label>Category<input required value={form.category} onChange={update("category")} /></label>
            <label>Strength<input value={form.strength} onChange={update("strength")} /></label>
            <label>Form
              <select value={form.form} onChange={update("form")}>
                {["tablet","capsule","syrup","injection","ointment","drops","other"].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>
            <label>Manufacturer<input value={form.manufacturer} onChange={update("manufacturer")} /></label>
            <label>Batch number<input value={form.batchNumber} onChange={update("batchNumber")} /></label>
            <label>Expiry date<input required type="date" value={form.expiryDate} onChange={update("expiryDate")} /></label>
            <label>Quantity<input required type="number" min={0} value={form.quantity} onChange={update("quantity")} /></label>
            <label>Low stock threshold<input type="number" min={0} value={form.lowStockThreshold} onChange={update("lowStockThreshold")} /></label>
            <label>Price (₹)<input required type="number" min={0} step="0.01" value={form.price} onChange={update("price")} /></label>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">{editingId ? "Save Changes" : "Add Medicine"}</button>
            {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel Edit</button>}
          </div>
        </form>

        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Category</th><th>Qty</th><th>Price</th><th>Expiry</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {medicines.map((m) => {
              const expired = new Date(m.expiryDate) < new Date();
              const lowStock = m.quantity > 0 && m.quantity <= m.lowStockThreshold;
              return (
                <tr key={m._id}>
                  <td data-label="Name">{m.name}</td>
                  <td data-label="Category">{m.category}</td>
                  <td data-label="Qty">{m.quantity}</td>
                  <td data-label="Price">₹{m.price}</td>
                  <td data-label="Expiry">{new Date(m.expiryDate).toLocaleDateString()}{expired && " (expired)"}</td>
                  <td data-label="Status">
  {m.manuallyUnavailable
    ? "Marked unavailable"
    : expired
    ? "Expired"
    : m.quantity === 0
    ? "Out of stock"
    : lowStock
    ? "Low stock"
    : "Available"}
</td>
                  <td data-label="Actions" className="actions-cell">
                    <button className="btn btn-outline small" onClick={() => editMedicine(m)}>Edit</button>
                    <button className="btn btn-outline small" onClick={() => toggleUnavailable(m)}>
                      {m.manuallyUnavailable ? "Mark Available" : "Mark Unavailable"}
                    </button>
                    <button className="btn btn-outline small danger" onClick={() => remove(m._id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {medicines.length === 0 && <tr><td colSpan={7} className="muted">No medicines added yet.</td></tr>}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default PharmacyInventory;
