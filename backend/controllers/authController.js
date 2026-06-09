import fs from "fs";
import path from "path";
import db from "../config/db.js";
import {
  getAuthUrl,
  getTokensFromCode,
  saveTokens,
  isGoogleConnected,
} from "../services/googleAuthService.js";
import { createGoogleSheet, syncDatabaseToSheet } from "../services/googleSheetService.js";
import { startSyncLoop } from "../services/syncEngine.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const TOKEN_PATH = path.join(process.cwd(), "config", "token.json");

export const googleAuth = (req, res) => {
  try {
    const url = getAuthUrl();
    console.log("🔗 Redirecting to Google OAuth:", url);
    res.redirect(url);
  } catch (err) {
    console.error("❌ OAuth Initiation Error:", err.message);
    res.redirect(`${FRONTEND_URL}?google=error`);
  }
};

export const googleCallback = async (req, res) => {
  const { code, error } = req.query;

  if (!code) {
    console.error("❌ No code in callback:", error);
    return res.redirect(`${FRONTEND_URL}?google=error`);
  }

  try {
    const tokens = await getTokensFromCode(code);
    await saveTokens(tokens);
    console.log("✅ Google tokens saved.");

    const todayStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    const dynamicSheetId = await createGoogleSheet(`Saarthi360 Live Sync — ${todayStr}`);
    global.currentActiveSheetId = dynamicSheetId;
    await db.query(
      "INSERT INTO settings (`key`, value) VALUES ('spreadsheetId', ?) ON DUPLICATE KEY UPDATE value = ?",
      [dynamicSheetId, dynamicSheetId]
    );

    const [rows] = await db.query("SELECT * FROM enquiries ORDER BY id ASC");
    await syncDatabaseToSheet(rows, dynamicSheetId);

    // ── FIX: was 2000ms — caused 11k+ quota hits. Now 30s. ──
    startSyncLoop(60000);

    console.log(`🎯 OAuth complete. Sheet ID: ${dynamicSheetId}`);

    // ── FIX: redirect back to frontend with ?google=connected
    // Previously redirected straight to the sheet, breaking the dashboard state.
    return res.redirect(`${FRONTEND_URL}?google=connected&sheetId=${dynamicSheetId}`);

  } catch (err) {
    console.error("❌ Google callback error:", err.message);
    res.redirect(`${FRONTEND_URL}?google=error`);
  }
};

export const googleStatus = async (req, res) => {
  try {
    const connected = await isGoogleConnected();
    res.json({ connected, currentSheetId: global.currentActiveSheetId || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const googleDisconnect = async (req, res) => {
  try {
    await db.query("DELETE FROM settings WHERE `key` = 'google_tokens'");
    await db.query("DELETE FROM settings WHERE `key` = 'spreadsheetId'");
    global.currentActiveSheetId = null;

    // ── FIX: delete token.json so isGoogleConnected() returns false properly ──
    // Previously token.json was left on disk, so status still showed connected=true.
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
      console.log("🗑️ token.json deleted on disconnect.");
    }

    res.json({ message: "Google account disconnected successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};