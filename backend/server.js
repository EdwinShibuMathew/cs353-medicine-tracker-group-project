// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, push, get } = require("firebase/database");

// ---- Firebase config ----
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// ---- Helper functions that talk to Firebase ----
async function addNewMedicine(name, brand, countryOfOrigin, allergens) {
  const db = getDatabase(firebaseApp);
  const medicalDatabaseRef = ref(db, "medicalDatabase");
  const newMedicineRef = push(medicalDatabaseRef);

  await set(newMedicineRef, {
    name,
    brand,
    countryOfOrigin,
    allergens,
  });

  return newMedicineRef.key; // useful for frontend
}

async function getMedicineBrand(medID) {
  const db = getDatabase(firebaseApp);
  const brandRef = ref(db, `medicalDatabase/${medID}/brand`);
  const snapshot = await get(brandRef);

  if (!snapshot.exists()) return null;
  return snapshot.val();
}

// ===== EXPRESS APP =====
const app = express();

// allow JSON request bodies
app.use(express.json());

// (optional while developing from different origin)
app.use(cors());

// ---- API routes ----

// POST /api/medicines  -> add new medicine
app.post("/api/medicines", async (req, res) => {
  try {
    const { name, brand, countryOfOrigin, allergens } = req.body;

    if (!name || !brand) {
      return res.status(400).json({ error: "name and brand are required" });
    }

    const id = await addNewMedicine(
      name,
      brand,
      countryOfOrigin,
      allergens || []
    );
    res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error("Error adding medicine:", err);
    res.status(500).json({ error: "internal server error" });
  }
});

// GET /api/medicines/:id/brand  -> get brand by id
app.get("/api/medicines/:id/brand", async (req, res) => {
  try {
    const brand = await getMedicineBrand(req.params.id);
    if (!brand) return res.status(404).json({ error: "not found" });
    res.json({ brand });
  } catch (err) {
    console.error("Error getting brand:", err);
    res.status(500).json({ error: "internal server error" });
  }
});

// ---- STATIC FRONTEND ----
// Serve everything inside frontend/src (html, css, js, images)
app.use(express.static(path.join(__dirname, "../frontend/src")));

// Default route -> index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/src/index.html"));
});

// ---- START SERVER ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
