import React from "react";
import { Link } from "react-router-dom";

const Landing = () => (
  <div className="landing">
    <section className="hero">
      <div className="hero-copy">
        <h1>Find the medicine you need, near you.</h1>
        <p className="subtitle">
          MedFind connects you with verified nearby pharmacies so you can check real-time
          medicine availability before you travel, and submit a reservation request in a few taps.
        </p>
        <div className="hero-actions">
          <Link to="/find-medicine" className="btn btn-primary">Find Medicine</Link>
          <Link to="/register-pharmacy" className="btn btn-outline">Register as Pharmacy</Link>
        </div>
        <div className="hero-trust">
          <span className="hero-trust-item">Every pharmacy is admin-verified</span>
          <span className="hero-trust-item">Live stock, not a static directory</span>
          <span className="hero-trust-item">Search without creating an account</span>
        </div>
      </div>

      <div className="hero-visual">
  <div className="mock-card" aria-hidden="true">
    <div className="mock-card-label">Example result</div>

    <div className="mock-card-search">Paracetamol 500mg</div>

    <div className="mock-result">
      <div className="mock-result-top">
        <span className="mock-result-name">Verified Pharmacy</span>
        <span className="mock-result-dist">0.8 km</span>
      </div>
      <span className="mock-result-meta">Nearby · Open now</span>
      <span className="mock-pill ok">In stock</span>
    </div>

    <div className="mock-result">
      <div className="mock-result-top">
        <span className="mock-result-name">Nearby Pharmacy</span>
        <span className="mock-result-dist">2.1 km</span>
      </div>
      <span className="mock-result-meta">Nearby · Open now</span>
      <span className="mock-pill low">Low stock</span>
    </div>
  </div>
</div>
    </section>

    <section className="features">
      <div className="feature-card">
        <h3>Search nearby availability</h3>
        <p>Search by medicine name and see which nearby pharmacies currently have it in stock.</p>
      </div>
      <div className="feature-card">
        <h3>Verified pharmacies</h3>
        <p>Every pharmacy is reviewed and approved by our admin team before it appears in search.</p>
      </div>
      <div className="feature-card">
        <h3>Inventory management</h3>
        <p>Pharmacies keep their stock, pricing, and expiry data current with a dedicated dashboard.</p>
      </div>
      <div className="feature-card">
        <h3>Reservation requests</h3>
        <p>Request a medicine from a pharmacy and track confirmation, rejection, or completion in real time.</p>
      </div>
    </section>

    <section className="how-it-works">
      <h2>How it works</h2>
      <ol>
        <li>Search for the medicine you need</li>
        <li>Find nearby pharmacies that carry it</li>
        <li>Check live availability and quantity</li>
        <li>Submit a reservation request</li>
        <li>The pharmacy confirms and you're notified</li>
      </ol>
    </section>

    <section className="safety-note">
      <p>
        MedFind is an information and availability platform. It does not diagnose conditions,
        prescribe medication, or recommend substitutes. For medical guidance, please contact a
        pharmacist or healthcare professional.
      </p>
    </section>
  </div>
);

export default Landing;
