import { google } from "googleapis";
import { getGoogleClient } from "./googleAuthService.js";

export const SHEET_NAME = "Enquiries";

// ── ALL DB columns in order ──
export const FIELD_ORDER = [
  "id",
  "companyName",
  "enquiryStatus",
  "remarks",
  "bill_no",
  "bill_date",
  "bill_amount",
  "bdMemberName",
  "teamLeaderName",
  "franchiseeName",
  "hrExecutiveName",
  "designation",
  "gstNo",
  "addressLine1",
  "emailId",
  "mobileNo",
  "website",
  "placementFees",
  "positionName",
  "from",
  "to",
  "creditPeriod",
  "replacementPeriod",
  "dateOfAllocation",
  "dateOfReallocation",
  "newTeamLeader",
  "nameOfFranchisee",
  "candidateName",
  "additionalContacts",
  "tally_pushed",
  "created_at",
  "updated_at",
];

// Human-readable headers matching FIELD_ORDER
const HEADERS = [
  "ID",
  "Company Name",
  "Enquiry Status",
  "Remarks",
  "Bill No",
  "Bill Date",
  "Bill Amount",
  "BD Member Name",
  "Team Leader Name",
  "Franchisee Name",
  "HR Executive Name",
  "Designation",
  "GST No",
  "Address",
  "Email ID",
  "Mobile No",
  "Website",
  "Placement Fees",
  "Position Name",
  "Salary From",
  "Salary To",
  "Credit Period",
  "Replacement Period",
  "Date of Allocation",
  "Date of Reallocation",
  "New Team Leader",
  "Name of Franchisee",
  "Candidate Name",
  "Additional Contacts",
  "Tally Pushed",
  "Created At",
  "Updated At",
];

const COL_COUNT = FIELD_ORDER.length; // 32 columns

// Convert column index (0-based) to A1 letter e.g. 0=A, 25=Z, 26=AA
const colLetter = (n) => {
  let s = "";
  n += 1;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

const LAST_COL = colLetter(COL_COUNT - 1); // e.g. "AF"

const formatValue = (field, value) => {
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value.toISOString().split("T")[0];
  if (typeof value === "string" && value.includes("T") && value.includes("Z")) {
    return new Date(value).toISOString().split("T")[0];
  }
  return String(value).trim();
};

export const createGoogleSheet = async (title = "Saarthi360 Synced Sheet") => {
  try {
    console.log(`🔨 Creating Google Sheet: "${title}"...`);
    const authClient = await getGoogleClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: { properties: { title } },
      fields: "spreadsheetId,spreadsheetUrl",
    });
    const newSheetId = spreadsheet.data.spreadsheetId;
    console.log(`✨ Sheet created: ${newSheetId}`);

    try {
      const drive = google.drive({ version: "v3", auth: authClient });
      await drive.permissions.create({
        fileId: newSheetId,
        requestBody: { type: "anyone", role: "writer" },
      });
    } catch (e) {
      console.warn("⚠️ Permission set failed (non-fatal):", e.message);
    }

    // Rename tab + write headers
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: newSheetId,
      requestBody: {
        requests: [{
          updateSheetProperties: {
            properties: { sheetId: 0, title: SHEET_NAME },
            fields: "title",
          },
        }],
      },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: newSheetId,
      range: `${SHEET_NAME}!A1:${LAST_COL}1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [HEADERS] },
    });

    return newSheetId;
  } catch (err) {
    console.error("❌ Sheet creation failed:", err.message);
    throw err;
  }
};

const getFirstSheetName = async (sheets, spreadsheetId) => {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    return meta.data.sheets[0].properties.title;
  } catch {
    return "Sheet1";
  }
};

export const syncDatabaseToSheet = async (dbRows, dynamicSheetId) => {
  try {
    const targetSheetId = dynamicSheetId || global.currentActiveSheetId;
    if (!targetSheetId) {
      console.warn("⚠️ syncDatabaseToSheet called with no sheet ID — skipping.");
      return false;
    }

    const authClient = await getGoogleClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const tabName = await getFirstSheetName(sheets, targetSheetId);

    const sheetValues = dbRows.map((row) =>
      FIELD_ORDER.map((field) => formatValue(field, row[field]))
    );

    // Single batchUpdate — data rows + 500 blank rows to clear ghost data
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: targetSheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: [
          ...(sheetValues.length > 0 ? [{
            range: `${tabName}!A2:${LAST_COL}${sheetValues.length + 1}`,
            values: sheetValues,
          }] : []),
          {
            range: `${tabName}!A${sheetValues.length + 2}:${LAST_COL}${sheetValues.length + 502}`,
            values: Array(500).fill(FIELD_ORDER.map(() => "")),
          },
        ],
      },
    });

    console.log(`\x1b[32m✨ Sheet synced — ${dbRows.length} rows written to tab "${tabName}".\x1b[0m`);
    return true;
  } catch (err) {
    console.error("❌ Sheet sync failed:", err.message);
    return false;
  }
};