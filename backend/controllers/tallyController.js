import db from "../config/db.js";
import {
  pushToTally,
  testTallyConnection,
  buildVoucherXML,
  fetchVouchersFromTally,
} from "../services/tallyService.js";
import { runSheetSync, runTallySync } from "../services/syncEngine.js";

export const tallyStatus = async (req, res) => {
  try {
    const result = await testTallyConnection();
    res.json(result);
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
};

export const pushEnquiryToTally = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM enquiries WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const enquiry = rows[0];

    if (!["closed", "invoiced"].includes(enquiry.enquiryStatus)) {
      return res.status(400).json({ error: "Status must be 'closed' or 'invoiced'" });
    }
    if (!enquiry.bill_amount) {
      return res.status(400).json({ error: "Bill amount missing" });
    }
    if (!enquiry.bill_date) {
      return res.status(400).json({ error: "Bill date missing" });
    }

    const result = await pushToTally(enquiry);
    if (result.success) {
      await db.query("UPDATE enquiries SET tally_pushed = 1 WHERE id = ?", [id]);
      await runSheetSync();
      return res.json({ success: true, message: `Enquiry ${id} pushed successfully` });
    }

    res.status(500).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PUSH ALL ─────────────────────────────────────────────────────────────────
// Pushes ALL closed/invoiced rows with bill_amount and bill_date filled
// Reports exactly which succeeded and which failed with reasons
export const pushAllToTally = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM enquiries 
       WHERE (enquiryStatus='closed' OR enquiryStatus='invoiced') 
       AND tally_pushed = 0
       AND bill_amount IS NOT NULL AND bill_amount > 0
       AND bill_date IS NOT NULL`
    );

    if (rows.length === 0) {
      return res.json({ success: true, message: "No eligible un-pushed items", pushed: 0, failed: 0 });
    }

    console.log(`🚀 Pushing ${rows.length} enquiries to Tally...`);

    let pushed = 0;
    let failed = 0;
    const failedList = [];

    for (const row of rows) {
      try {
        const result = await pushToTally(row);
        if (result.success) {
          await db.query("UPDATE enquiries SET tally_pushed = 1 WHERE id = ?", [row.id]);
          console.log(`✅ Pushed: ${row.companyName} (${row.bill_no})`);
          pushed++;
        } else {
          console.warn(`❌ Failed: ${row.companyName} — ${result.error}`);
          failedList.push({ id: row.id, company: row.companyName, reason: result.error });
          failed++;
        }
      } catch (err) {
        console.error(`❌ Error pushing ${row.companyName}:`, err.message);
        failedList.push({ id: row.id, company: row.companyName, reason: err.message });
        failed++;
      }
    }

    await runSheetSync();
    res.json({ success: true, pushed, failed, failedList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTallyPushed = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, bill_no, companyName FROM enquiries WHERE tally_pushed = 1"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const previewXML = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM enquiries WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    const xml = buildVoucherXML(rows[0]);
    res.setHeader("Content-Type", "text/xml");
    res.send(xml);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const syncFromTally = async (req, res) => {
  try {
    const data = await fetchVouchersFromTally();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const triggerReverseSync = async (req, res) => {
  try {
    await runTallySync();
    await runSheetSync();
    res.json({ success: true, message: "Reverse sync triggered." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};