import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import db from "./config/db.js";

import enquiryRoutes from "./routes/enquiryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import tallyRoutes from "./routes/tallyRoutes.js";

import { isGoogleConnected } from "./services/googleAuthService.js";
import { syncDatabaseToSheet } from "./services/googleSheetService.js";
import { startSyncLoop } from "./services/syncEngine.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/enquiries", enquiryRoutes);
app.use("/auth",          authRoutes);
app.use("/api/tally",     tallyRoutes);

app.get("/health", (req, res) => res.json({ status: "running" }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID ? "✅ loaded" : "❌ missing");

  try {
    const connected = await isGoogleConnected();

    if (connected) {
      console.log("Google connected — restoring sheet ID from DB...");

      // Restore sheetId from DB so global survives server restarts
      const [rows] = await db.query("SELECT value FROM settings WHERE `key` = 'spreadsheetId'").catch(() => [[]]);
      if (rows && rows.length > 0 && rows[0].value) {
        global.currentActiveSheetId = rows[0].value;
        console.log(`✅ Sheet ID restored: ${global.currentActiveSheetId}`);

        // Sync existing data to the restored sheet
        const [enquiries] = await db.query("SELECT * FROM enquiries ORDER BY id ASC");
        await syncDatabaseToSheet(enquiries, global.currentActiveSheetId);
        console.log(`Startup sync done — ${enquiries.length} rows`);
      } else {
        console.log("⚠️ No saved sheet ID found — user needs to reconnect Google.");
      }

      // Start loop only if connected — 60s is quota-safe
      startSyncLoop(60000);
    } else {
      console.log("Google not connected — click Connect Google on frontend.");
      // Do NOT start sync loop — nothing to sync to
    }
  } catch (err) {
    console.error("Startup error (non-fatal):", err.message);
    // Do NOT start sync loop on error either
  }
});