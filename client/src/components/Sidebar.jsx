import React from "react";
import { NavLink } from "react-router-dom";

// links: [{ to, label }]
const Sidebar = ({ links, title }) => (
  <aside className="sidebar">
    <div className="sidebar-title">{title}</div>
    <nav className="sidebar-nav">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
