import React, { useEffect, useState } from "react";
import api from "../services/api";

const formatDateTime = (value) => {
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/notifications")
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => setError("Couldn't load notifications."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markOneRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch {
      load();
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    const prev = notifications;
    setNotifications((cur) => cur.map((n) => ({ ...n, isRead: true })));
    try {
      await api.put("/notifications/read-all");
    } catch {
      setNotifications(prev);
    }
  };

  return (
    <div className="page notifications-page">
      <div className="notifications-page-header">
        <h1>Notifications</h1>
        <button
          type="button"
          className="btn btn-outline small"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      {loading && <div className="loading-state">Loading...</div>}
      {!loading && error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && notifications.length === 0 && (
        <div className="empty-state">
          <p>No notifications yet.</p>
          <p className="muted">Updates about your requests and account will show up here.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <ul className="notifications-full-list">
          {notifications.map((n) => (
            <li key={n._id} className={`notifications-full-item ${n.isRead ? "" : "unread"}`}>
              <span className="notification-dot" aria-hidden="true" />
              <div className="notifications-full-body">
                <div className="notifications-full-top">
                  <span className="notification-item-title">{n.title}</span>
                  <span className="notification-item-date">{formatDateTime(n.createdAt)}</span>
                </div>
                <p className="notification-item-message">{n.message}</p>
              </div>
              {!n.isRead && (
                <button
                  type="button"
                  className="btn btn-outline small"
                  onClick={() => markOneRead(n._id)}
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
