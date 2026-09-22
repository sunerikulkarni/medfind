import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="page not-found">
    <h1>404</h1>
    <p>Page not found.</p>
    <Link to="/" className="btn btn-primary">Back to Home</Link>
  </div>
);

export default NotFound;
