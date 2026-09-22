const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET = "test_secret";
process.env.NODE_ENV = "test";

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGO_URI);
  app = require("../server");
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Auth", () => {
  it("registers a new patient with a hashed password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test Patient",
      email: "patient1@test.com",
      phone: "1234567890",
      password: "password123",
      confirmPassword: "password123",
      address: "123 Test St",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();

    const User = require("../models/User");
    const stored = await User.findOne({ email: "patient1@test.com" }).select("+passwordHash");
    expect(stored.passwordHash).not.toBe("password123");
  });

  it("rejects registration with mismatched passwords", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test Patient2",
      email: "patient2@test.com",
      phone: "1234567890",
      password: "password123",
      confirmPassword: "different",
      address: "123 Test St",
    });
    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials and rejects wrong password", async () => {
    const ok = await request(app)
      .post("/api/auth/login")
      .send({ email: "patient1@test.com", password: "password123" });
    expect(ok.status).toBe(200);
    expect(ok.body.role).toBe("patient");

    const bad = await request(app)
      .post("/api/auth/login")
      .send({ email: "patient1@test.com", password: "wrongpassword" });
    expect(bad.status).toBe(401);
  });

  it("blocks access to protected routes without a token", async () => {
    const res = await request(app).get("/api/users/profile");
    expect(res.status).toBe(401);
  });
});

describe("Pharmacy verification and role authorization", () => {
  let pharmacyToken;
  let pharmacyId;

  it("registers a pharmacy as PENDING by default", async () => {
    const res = await request(app).post("/api/pharmacies/register").send({
      pharmacyName: "Test Pharmacy",
      ownerName: "Owner",
      email: "pharmacy1@test.com",
      phone: "9998887777",
      password: "password123",
      licenseNumber: "LIC-1",
      address: "456 Test Ave",
      lat: 12.97,
      lng: 77.59,
    });
    expect(res.status).toBe(201);
    expect(res.body.user.verificationStatus).toBe("PENDING");
    pharmacyToken = res.body.token;
    pharmacyId = res.body.user._id;
  });

  it("prevents a patient from accessing admin routes", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "patient1@test.com", password: "password123" });
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(res.status).toBe(403);
  });

  it("allows the pharmacy to add a medicine to inventory", async () => {
    const res = await request(app)
      .post("/api/medicines")
      .set("Authorization", `Bearer ${pharmacyToken}`)
      .send({
        name: "Paracetamol",
        category: "Pain Relief",
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 200).toISOString(),
        quantity: 50,
        price: 20,
      });
    expect(res.status).toBe(201);
    expect(res.body.medicine.name).toBe("Paracetamol");
  });

  it("finds the medicine via search", async () => {
    const res = await request(app).get("/api/search/medicines").query({ q: "paracetamol" });
    expect(res.status).toBe(200);
    expect(res.body.results.length).toBeGreaterThan(0);
  });
});

describe("Medicine request workflow", () => {
  it("prevents requesting more quantity than available", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "patient1@test.com", password: "password123" });
    const search = await request(app).get("/api/search/medicines").query({ q: "paracetamol" });
    const result = search.body.results[0];

    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({
        pharmacyId: result.pharmacyId,
        medicineId: result.medicineId,
        quantityRequested: 9999,
      });
    expect(res.status).toBe(400);
  });
});
