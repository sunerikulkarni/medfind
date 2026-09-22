import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/pharmacies", label: "Pharmacies" },
  { to: "/admin/users", label: "Users" },
];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/admin/users").then(({ data }) => setUsers(data.users));
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar title="Admin" links={links} />
      <main className="dashboard-content">
        <h1>Users</h1>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td data-label="Name">{u.fullName}</td>
                <td data-label="Email">{u.email}</td>
                <td data-label="Phone">{u.phone}</td>
                <td data-label="Address">{u.address}</td>
                <td data-label="Joined">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={5} className="muted">No users yet.</td></tr>}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default AdminUsers;
