import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL_MS = 30000;
const DROPDOWN_LIMIT = 6;

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const BellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wrapperRef = useRef(null);

  const fetchNotifications = useCallback((showLoading) => {
    if (showLoading) setLoading(true);
    api
      .get("/notifications")
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setError("");
      })
      .catch(() => {
        if (showLoading) setError("Couldn't load notifications.");
      })
      .finally(() => {
        if (showLoading) setLoading(false);
      });
  }, []);

  // Initial load + quiet background poll so the badge stays current
  // even while the panel is closed.
  useEffect(() => {
    if (!user) return;
    fetchNotifications(false);
    const interval = setInterval(() => fetchNotifications(false), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications(true);
  };

  const markOneRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch {
      // Revert on failure so the UI doesn't lie about state.
      fetchNotifications(false);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    const prevNotifications = notifications;
    const prevUnread = unreadCount;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.put("/notifications/read-all");
    } catch {
      setNotifications(prevNotifications);
      setUnreadCount(prevUnread);
    }
  };

  if (!user) return null;

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="notification-bell"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={toggleOpen}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notification-badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-panel" role="menu" aria-label="Notifications">
          <div className="notification-panel-header">
            <span>Notifications</span>
          </div>

          <div className="notification-list-wrap">
            {loading && <div className="notification-empty">Loading...</div>}
            {!loading && error && <div className="notification-empty">{error}</div>}
            {!loading && !error && notifications.length === 0 && (
              <div className="notification-empty">No notifications yet.</div>
            )}
            {!loading && !error && notifications.length > 0 && (
              <ul className="notification-list">
                {notifications.slice(0, DROPDOWN_LIMIT).map((n) => (
                  <li key={n._id} className={`notification-item ${n.isRead ? "" : "unread"}`}>
                    <button
                      type="button"
                      className="notification-item-btn"
                      role="menuitem"
                      onClick={() => !n.isRead && markOneRead(n._id)}
                    >
                      <span className="notification-dot" aria-hidden="true" />
                      <span className="notification-item-body">
                        <span className="notification-item-title">{n.title}</span>
                        <span className="notification-item-message">{n.message}</span>
                        <span className="notification-item-date">{formatDate(n.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="notification-panel-footer">
            <button
              type="button"
              className="notification-link-btn"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
            <Link to="/notifications" className="notification-link-btn" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
