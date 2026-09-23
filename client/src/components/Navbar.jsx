import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardPath =
    role === "admin" ? "/admin" : role === "pharmacy" ? "/pharmacy" : "/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          MedFind
        </Link>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/find-medicine" onClick={() => setMenuOpen(false)}>Find Medicine</Link>
          <Link to="/pharmacies" onClick={() => setMenuOpen(false)}>Pharmacies</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>

          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="nav-cta-secondary">
                Dashboard
              </Link>
              <button className="nav-cta" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="nav-cta" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </nav>

        <div className="navbar-actions">
          <NotificationBell />
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
