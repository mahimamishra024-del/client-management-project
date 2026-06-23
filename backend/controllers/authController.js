import fs from "fs";
import path from "path";
import db from "../config/db.js";
import { google } from "googleapis";
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

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const userEmail = data.email;
    console.log("📧 Google login attempted by:", userEmail);

    // ALWAYS clear any previous connection first — every new sign-in attempt starts fresh
    await db.query("DELETE FROM settings WHERE `key` = 'spreadsheetId'");
    global.currentActiveSheetId = null;
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
      console.log("🗑️ Previous token cleared before processing new sign-in attempt.");
    }

    const [allowed] = await db.query(
      "SELECT id FROM allowed_emails WHERE LOWER(email) = LOWER(?)",
      [userEmail.trim()]
    );

    if (!allowed.length) {
      console.warn(`🚫 Access denied for: ${userEmail}`);
      return res.redirect(`${FRONTEND_URL}?google=denied&email=${encodeURIComponent(userEmail)}`);
    }

    await saveTokens(tokens);
    console.log("✅ Google tokens saved for:", userEmail);

    const todayStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    const dynamicSheetId = await createGoogleSheet(`Saarthi360 Live Sync — ${todayStr}`);
    global.currentActiveSheetId = dynamicSheetId;

    await db.query(
      "INSERT INTO settings (`key`, value) VALUES ('spreadsheetId', ?) ON DUPLICATE KEY UPDATE value = ?",
      [dynamicSheetId, dynamicSheetId]
    );

    const [rows] = await db.query("SELECT * FROM clients ORDER BY id ASC");
    await syncDatabaseToSheet(rows, dynamicSheetId);
    startSyncLoop(60000);

    console.log(`🎯 OAuth complete. Sheet ID: ${dynamicSheetId}`);
    return res.redirect(`${FRONTEND_URL}?google=connected&sheetId=${dynamicSheetId}`);

  } catch (err) {
    console.error("❌ Google callback error:", err.message);
    res.redirect(`${FRONTEND_URL}?google=error`);
  }
};

export const googleStatus = async (req, res) => {
  try {
    if (!fs.existsSync(TOKEN_PATH)) {
      return res.json({ connected: false, currentSheetId: null });
    }

    const connected = await isGoogleConnected();
    if (!connected) {
      return res.json({ connected: false, currentSheetId: null });
    }

    const [rows] = await db.query("SELECT value FROM settings WHERE `key` = 'spreadsheetId'");
    const sheetId = rows.length ? rows[0].value : null;

    if (!sheetId) {
      return res.json({ connected: false, currentSheetId: null });
    }

    global.currentActiveSheetId = sheetId;
    return res.json({ connected: true, currentSheetId: sheetId });

  } catch (err) {
    console.error("❌ googleStatus error:", err.message);
    return res.json({ connected: false, currentSheetId: null });
  }
};

export const checkEmailAccess = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ allowed: false, message: "Email is required" });

  try {
    const [rows] = await db.query(
      "SELECT id FROM allowed_emails WHERE LOWER(email) = LOWER(?)",
      [email.trim()]
    );
    if (rows.length > 0) {
      res.json({ allowed: true });
    } else {
      res.json({ allowed: false, message: "You don't have access to connect Google Sheets." });
    }
  } catch (err) {
    res.status(500).json({ allowed: false, message: err.message });
  }
};

export const googleDisconnect = async (req, res) => {
  try {
    await db.query("DELETE FROM settings WHERE `key` = 'google_tokens'");
    await db.query("DELETE FROM settings WHERE `key` = 'spreadsheetId'");
    global.currentActiveSheetId = null;

    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
      console.log("🗑️ token.json deleted on disconnect.");
    }

    res.json({ message: "Google account disconnected successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};