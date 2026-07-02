import db from "../config/db.js";
import { syncDatabaseToSheet } from "./googleSheetService.js";
import { fetchVouchersFromTally } from "./tallyService.js";
import { isGoogleConnected } from "./googleAuthService.js";

let isSyncingSheet = false;
let isSyncingTally = false;
let sheetIntervalStarted = false;
let tallyIntervalStarted = false;
let activeSheetInterval = null;
let activeTallyInterval = null;
let debounceTimer = null;
let lastSyncedHash = null;

global.currentActiveSheetId = global.currentActiveSheetId || null;

const hashRows = (rows) => JSON.stringify(
  rows.map(r => {
    const normalize = (v) => {
      if (v instanceof Date) return v.toISOString().split("T")[0];
      if (typeof v === "string" && v.includes("T") && v.endsWith("Z")) return v.split("T")[0];
      return v ?? "";
    };
    return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, normalize(v)]));
  })
);

export const runSheetSync = async () => {
  if (isSyncingSheet) return;
  try {
    const connected = await isGoogleConnected();
    if (!connected || !global.currentActiveSheetId) return;
  } catch { return; }

  isSyncingSheet = true;
  try {
    const [dbRows] = await db.query("SELECT * FROM clients ORDER BY id ASC");
    const currentHash = hashRows(dbRows);
    if (currentHash === lastSyncedHash) {
      console.log("⏭️  Sheet sync skipped — no data change.");
      return;
    }
    await syncDatabaseToSheet(dbRows, global.currentActiveSheetId);
    lastSyncedHash = currentHash;
    console.log("\x1b[32m✨ Sheet synced.\x1b[0m");
  } catch (err) {
    console.error("❌ Sheet sync error:", err.message);
  } finally {
    isSyncingSheet = false;
  }
};

// ── TALLY → DB REVERSE SYNC ──
export const runTallySync = async () => {
  if (isSyncingTally) return;
  isSyncingTally = true;

  try {
    const tallyVouchers = await fetchVouchersFromTally();
    if (!tallyVouchers || tallyVouchers.length === 0) return;

    let anyChanged = false;

    for (const voucher of tallyVouchers) {
      if (!voucher.companyName && !voucher.billNo) continue;

      let match = null;

      if (voucher.companyName) {
        const [rows] = await db.query(
          "SELECT id, bill_amount, remarks FROM clients WHERE LOWER(companyName) = LOWER(?)",
          [voucher.companyName]
        );
        if (rows && rows.length > 0) match = rows;
      }

      if (!match && voucher.billNo) {
        const [rows] = await db.query(
          "SELECT id, bill_amount, remarks FROM clients WHERE bill_no = ?",
          [voucher.billNo]
        );
        if (rows && rows.length > 0) match = rows;
      }

      if (!match || match.length === 0) continue;

      const currentRemarks = match[0].remarks || "";
      const incomingRemarks = voucher.remarks || "";
      const currentAmt = parseFloat(match[0].bill_amount) || 0;
      const incomingAmt = voucher.baseAmount || 0;

      if (currentRemarks !== incomingRemarks || currentAmt !== incomingAmt) {
        await db.query(
          "UPDATE clients SET remarks = ?, bill_amount = ? WHERE id = ?",
          [incomingRemarks, incomingAmt, match[0].id]
        );
        console.log(`\x1b[36m🔄 Tally reverse sync: ${voucher.companyName} -> remarks: "${incomingRemarks}", amount: ${incomingAmt}\x1b[0m`);
        anyChanged = true;
      }
    }

    if (anyChanged) {
      console.log("✅ Tally reverse sync applied changes to clients table.");
    }
  } catch (err) {
    console.warn("⚠️ Tally unreachable (non-fatal):", err.message);
  } finally {
    isSyncingTally = false;
  }
};

export const scheduleSyncAfterChange = () => {
  console.log("📌 Sync scheduled after change. SheetId:", global.currentActiveSheetId);
  lastSyncedHash = null;
  isSyncingSheet = false;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    runSheetSync();
  }, 3000);
};

export const runSync = runSheetSync;

export const startSyncLoop = (intervalMs = 60000) => {
  if (!sheetIntervalStarted) {
    sheetIntervalStarted = true;
    activeSheetInterval = setInterval(async () => {
      if (!global.currentActiveSheetId) return; // ✅ FIXED: Skip if no sheet ID yet
      await runSheetSync();
    }, intervalMs);
    console.log(`✅ Sheet sync loop started at ${intervalMs}ms`);
  }
  if (!tallyIntervalStarted) {
    tallyIntervalStarted = true;
    activeTallyInterval = setInterval(runTallySync, 30 * 1000);
    console.log(`✅ Tally sync loop started at 30s interval`);
  }
  setInterval(async () => {
    if (!global.currentActiveSheetId) return; // ✅ FIXED: Skip if no sheet ID yet
    await syncSheetToDatabase();
  }, 30 * 1000);
  console.log(`✅ Sheet→DB sync loop started at 30s interval`);
};

export const stopSyncLoop = () => {
  if (activeSheetInterval) { clearInterval(activeSheetInterval); activeSheetInterval = null; sheetIntervalStarted = false; }
  if (activeTallyInterval) { clearInterval(activeTallyInterval); activeTallyInterval = null; tallyIntervalStarted = false; }
  console.log("🛑 All sync loops stopped.");
};

// ── SHEET → DB REVERSE SYNC ──
export const syncSheetToDatabase = async () => {
  try {
    const connected = await isGoogleConnected();
    if (!connected || !global.currentActiveSheetId) return;

    const { getGoogleClient } = await import("./googleAuthService.js");
    const { FIELD_ORDER } = await import("./googleSheetService.js");
    const { google } = await import("googleapis");

    const authClient = await getGoogleClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const meta = await sheets.spreadsheets.get({ spreadsheetId: global.currentActiveSheetId });
    const tabName = meta.data.sheets[0].properties.title;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: global.currentActiveSheetId,
      range: `${tabName}!A2:BF10000`, // ✅ FIXED: was AF (col 32), now BF (col 58)
    });

    const sheetRows = response.data.values || [];
    if (sheetRows.length === 0) return;

    console.log(`📥 Sheet→DB sync: ${sheetRows.length} rows fetched from sheet`);

    let updatedCount = 0;

    for (const row of sheetRows) {
      const id = parseInt(row[0]);
      if (!id || isNaN(id)) continue;

      const sheetData = {};
      FIELD_ORDER.forEach((field, i) => { sheetData[field] = row[i] !== undefined ? row[i] : null; });

      const [dbRows] = await db.query("SELECT * FROM clients WHERE id = ?", [id]);
      if (!dbRows || dbRows.length === 0) continue;

      const dbRow = dbRows[0];

      const updatableFields = [
        "companyName", "remarks",
        "bdMemberName", "teamLeader", "franchiseeName", "designation",
        "gstNo", "address", "emailId", "phoneNumber", "website", "placementFees",
        "creditPeriod", "replacementPeriod",
        "dateOfClientAllocation", "reallocationStatus"
      ];

      const normalize = (field, v) => {
        if (v === null || v === undefined || v === "") return "";
        if (v instanceof Date) return v.toISOString().split("T")[0];
        if (typeof v === "string" && v.includes("T") && v.endsWith("Z")) return v.split("T")[0];
        if (["placementFees", "creditPeriod", "replacementPeriod"].includes(field)) {
          const n = parseFloat(v);
          return isNaN(n) ? "" : String(n);
        }
        return String(v).trim();
      };

      let hasChanges = false;
      const updates = {};

      for (const field of updatableFields) {
        const dbVal = normalize(field, dbRow[field]);
        const sheetVal = normalize(field, sheetData[field]);
        if (dbVal !== sheetVal) {
          updates[field] = sheetData[field] || null;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        const setClauses = Object.keys(updates).map(f => `\`${f}\` = ?`).join(", ");
        const values = [...Object.values(updates), id];
        await db.query(`UPDATE clients SET ${setClauses} WHERE id = ?`, values);
        console.log(`\x1b[35m📥 Sheet→DB updated row id=${id}\x1b[0m`);
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      lastSyncedHash = null;
      console.log(`\x1b[35m✅ Sheet→DB sync complete: ${updatedCount} rows updated\x1b[0m`);
    } else {
      console.log("⏭️  Sheet→DB sync skipped — no changes detected");
    }
  } catch (err) {
    console.error("❌ Sheet→DB sync error:", err.message);
  }
};