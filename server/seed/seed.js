/**
 * Development seed script — DEMO DATA ONLY.
 * The pharmacies, medicines, and stock levels created here are fictional
 * sample data for local development and demonstration. They do not
 * represent real inventory or real pharmacies.
 *
 * Run with: npm run seed  (from the server/ directory)
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Pharmacy = require("../models/Pharmacy");
const Medicine = require("../models/Medicine");
const MedicineRequest = require("../models/MedicineRequest");
const Notification = require("../models/Notification");

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const run = async () => {
  await connectDB();
  console.log("Clearing existing demo collections...");
  await Promise.all([
    User.deleteMany({}),
    Pharmacy.deleteMany({}),
    Medicine.deleteMany({}),
    MedicineRequest.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 10);
  const admin = await User.create({
    fullName: process.env.ADMIN_NAME || "Platform Admin",
    email: (process.env.ADMIN_EMAIL || "admin@medfind.local").toLowerCase(),
    phone: "0000000000",
    passwordHash: adminPasswordHash,
    address: "MedFind HQ",
    role: "admin",
  });
  console.log(`Admin created: ${admin.email}`);

  const patientPasswordHash = await bcrypt.hash("Patient123!", 10);
  const patient = await User.create({
    fullName: "Asha Rao",
    email: "asha.demo@medfind.local",
    phone: "9876500001",
    passwordHash: patientPasswordHash,
    address: "MG Road, Bengaluru",
    location: { lat: 12.9716, lng: 77.5946 },
    role: "patient",
  });
  console.log(`Demo patient created: ${patient.email} / Patient123!`);

  const pharmacyPasswordHash = await bcrypt.hash("Pharmacy123!", 10);

  const approvedPharmacy = await Pharmacy.create({
    pharmacyName: "Wellness Care Pharmacy",
    ownerName: "Ravi Kumar",
    email: "wellness.demo@medfind.local",
    phone: "9876500002",
    passwordHash: pharmacyPasswordHash,
    licenseNumber: "LIC-DEMO-001",
    address: "Indiranagar, Bengaluru",
    location: { lat: 12.9784, lng: 77.6408 },
    operatingHours: { open: "08:00", close: "22:00" },
    verificationStatus: "APPROVED",
  });

  const secondApprovedPharmacy = await Pharmacy.create({
    pharmacyName: "CityCare Chemists",
    ownerName: "Meera Nair",
    email: "citycare.demo@medfind.local",
    phone: "9876500003",
    passwordHash: pharmacyPasswordHash,
    licenseNumber: "LIC-DEMO-002",
    address: "Koramangala, Bengaluru",
    location: { lat: 12.9352, lng: 77.6146 },
    operatingHours: { open: "09:00", close: "21:00" },
    verificationStatus: "APPROVED",
  });

  const pendingPharmacy = await Pharmacy.create({
    pharmacyName: "New Horizon Pharmacy",
    ownerName: "Sandeep Joshi",
    email: "newhorizon.demo@medfind.local",
    phone: "9876500004",
    passwordHash: pharmacyPasswordHash,
    licenseNumber: "LIC-DEMO-003",
    address: "Whitefield, Bengaluru",
    location: { lat: 12.9698, lng: 77.75 },
    verificationStatus: "PENDING",
  });

  console.log("Demo pharmacies created (password for all: Pharmacy123!):");
  console.log(` - ${approvedPharmacy.email} (approved)`);
  console.log(` - ${secondApprovedPharmacy.email} (approved)`);
  console.log(` - ${pendingPharmacy.email} (pending verification)`);

  const medicines = await Medicine.insertMany([
    {
      pharmacy: approvedPharmacy._id,
      name: "Paracetamol",
      genericName: "Acetaminophen",
      category: "Pain Relief",
      strength: "500mg",
      form: "tablet",
      manufacturer: "Generix Labs",
      batchNumber: "B1001",
      expiryDate: daysFromNow(300),
      quantity: 120,
      lowStockThreshold: 20,
      price: 25,
    },
    {
      pharmacy: approvedPharmacy._id,
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      category: "Antibiotic",
      strength: "250mg",
      form: "capsule",
      manufacturer: "MedPharm",
      batchNumber: "B1002",
      expiryDate: daysFromNow(180),
      quantity: 4,
      lowStockThreshold: 10,
      price: 90,
    },
    {
      pharmacy: approvedPharmacy._id,
      name: "Cetirizine",
      genericName: "Cetirizine Hydrochloride",
      category: "Allergy",
      strength: "10mg",
      form: "tablet",
      manufacturer: "Generix Labs",
      batchNumber: "B1003",
      expiryDate: daysFromNow(400),
      quantity: 0,
      lowStockThreshold: 15,
      price: 18,
    },
    {
      pharmacy: secondApprovedPharmacy._id,
      name: "Paracetamol",
      genericName: "Acetaminophen",
      category: "Pain Relief",
      strength: "650mg",
      form: "tablet",
      manufacturer: "CityCare Generics",
      batchNumber: "C2001",
      expiryDate: daysFromNow(250),
      quantity: 60,
      lowStockThreshold: 20,
      price: 30,
    },
    {
      pharmacy: secondApprovedPharmacy._id,
      name: "Insulin Glargine",
      genericName: "Insulin Glargine",
      category: "Diabetes",
      strength: "100IU/ml",
      form: "injection",
      manufacturer: "BioPharm",
      batchNumber: "C2002",
      expiryDate: daysFromNow(90),
      quantity: 12,
      lowStockThreshold: 5,
      price: 650,
    },
  ]);
  console.log(`Demo medicines created: ${medicines.length}`);

  const sampleRequest = await MedicineRequest.create({
    user: patient._id,
    pharmacy: approvedPharmacy._id,
    medicine: medicines[0]._id,
    quantityRequested: 2,
    note: "Sample seeded request for demonstration.",
    urgency: "NORMAL",
    status: "PENDING",
  });

  await Notification.create({
    recipientType: "Pharmacy",
    recipient: approvedPharmacy._id,
    title: "New medicine request",
    message: `${patient.fullName} requested 2 unit(s) of Paracetamol.`,
    relatedRequest: sampleRequest._id,
  });

  console.log("Seed complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
