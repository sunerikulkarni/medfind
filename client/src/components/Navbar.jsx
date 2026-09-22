import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    api
      .get("/notifications")
      .then(({ data }) => mounted && setUnread(data.unreadCount))
      .catch(() => {});
    return () => (mounted = false);
  }, [user]);

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

        <button className="menu-toggle" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/find-medicine" onClick={() => setMenuOpen(false)}>Find Medicine</Link>
          <Link to="/pharmacies" onClick={() => setMenuOpen(false)}>Pharmacies</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>

          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="nav-cta-secondary">
                Dashboard {unread > 0 && <span className="unread-dot">{unread}</span>}
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
      </div>
    </header>
  );
};

export default Navbar;
