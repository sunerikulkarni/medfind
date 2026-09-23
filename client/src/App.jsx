import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import RegisterPharmacy from "./pages/RegisterPharmacy";
import FindMedicine from "./pages/FindMedicine";
import Pharmacies from "./pages/Pharmacies";
import PharmacyDetails from "./pages/PharmacyDetails";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";

import PatientDashboard from "./pages/PatientDashboard";
import RequestHistory from "./pages/RequestHistory";
import PatientProfile from "./pages/PatientProfile";
import SavedPharmacies from "./pages/SavedPharmacies";

import PharmacyDashboard from "./pages/PharmacyDashboard";
import PharmacyInventory from "./pages/PharmacyInventory";
import PharmacyRequests from "./pages/PharmacyRequests";
import PharmacyProfile from "./pages/PharmacyProfile";

import AdminDashboard from "./pages/AdminDashboard";
import AdminPharmacies from "./pages/AdminPharmacies";
import AdminUsers from "./pages/AdminUsers";
import AdminRequests from "./pages/AdminRequests";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/register-pharmacy" element={<RegisterPharmacy />} />
        <Route path="/find-medicine" element={<FindMedicine />} />
        <Route path="/pharmacies" element={<Pharmacies />} />
        <Route path="/pharmacies/:id" element={<PharmacyDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute allow={["patient"]}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute allow={["patient"]}><RequestHistory /></ProtectedRoute>} />
        <Route path="/saved-pharmacies" element={<ProtectedRoute allow={["patient"]}><SavedPharmacies /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allow={["patient"]}><PatientProfile /></ProtectedRoute>} />

        <Route path="/pharmacy" element={<ProtectedRoute allow={["pharmacy"]}><PharmacyDashboard /></ProtectedRoute>} />
        <Route path="/pharmacy/inventory" element={<ProtectedRoute allow={["pharmacy"]}><PharmacyInventory /></ProtectedRoute>} />
        <Route path="/pharmacy/requests" element={<ProtectedRoute allow={["pharmacy"]}><PharmacyRequests /></ProtectedRoute>} />
        <Route path="/pharmacy/profile" element={<ProtectedRoute allow={["pharmacy"]}><PharmacyProfile /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute allow={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/pharmacies" element={<ProtectedRoute allow={["admin"]}><AdminPharmacies /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allow={["admin"]}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute allow={["admin"]}><AdminRequests /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
