import { google } from "googleapis";
import { getGoogleClient } from "./googleAuthService.js";

export const SHEET_NAME = "Clients";

// ── ALL clients table columns in order ──
export const FIELD_ORDER = [
  "id",
  "companyName",
  "bdMemberName",
  "dateClientAcquired",
  "address",
  "city",
  "pinCode",
  "locationArea",
  "state",
  "country",
  "yearOfEstablishment",
  "industry",
  "subIndustry",
  "tags",
  "companyConstitution",
  "numberOfEmployees",
  "gstNo",
  "website",
  "contactPersonName",
  "designation",
  "phoneNumber",
  "emailId",
  "contactPersonStatus",
  "placementFees",
  "additionalPlacementFees",
  "creditPeriod",
  "replacementPeriod",
  "companyCategory",
  "companyStatus",
  "approvalStatus",
  "remarks",
  "dateOfRevivalCall",
  "nameOfExecutive",
  "statusOfCall",
  "eMeet",
  "updated",
  "dateOfDataUpdate",
  "dataUpdatedBy",
  "teamLeader",
  "franchiseeName",
  "dateOfClientAllocation",
  "reallocationStatus",
  "billingStatus",
  "bill_no",
  "bill_amount",
  "bill_date",
  "tally_pushed",
  "created_at",
  "updated_at",
];

// Human-readable headers matching FIELD_ORDER
const HEADERS = [
  "ID",
  "Company Name",
  "BD Member Name",
  "Date Client Acquired",
  "Address",
  "City",
  "Pin Code",
  "Location/Area",
  "State",
  "Country",
  "Year Of Establishment",
  "Industry",
  "Sub Industry",
  "Tags",
  "Company Constitution",
  "Number Of Employees",
  "GST No",
  "Website",
  "Contact Person Name",
  "Designation",
  "Phone Number",
  "Email ID",
  "Contact Person Status",
  "Placement Fees",
  "Additional Placement Fees",
  "Credit Period",
  "Replacement Period",
  "Company Category",
  "Company Status",
  "Approval Status",
  "Remarks",
  "Date Of Revival Call",
  "Name Of Executive",
  "Status Of Call",
  "E-Meet",
  "Updated",
  "Date Of Data Update",
  "Data Updated By",
  "Team Leader",
  "Franchisee Name",
  "Date Of Client Allocation",
  "Reallocation Status",
  "Billing Status",
  "Bill No",
  "Bill Amount",
  "Bill Date",
  "Tally Pushed",
  "Created At",
  "Updated At",
];

const COL_COUNT = FIELD_ORDER.length;

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

const LAST_COL = colLetter(COL_COUNT - 1);

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

    const clearRowCount = Math.max(0, 9999 - sheetValues.length);

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: targetSheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: [
          ...(sheetValues.length > 0 ? [{
            range: `${tabName}!A2:${LAST_COL}${sheetValues.length + 1}`,
            values: sheetValues,
          }] : []),
          ...(clearRowCount > 0 ? [{
            range: `${tabName}!A${sheetValues.length + 2}:${LAST_COL}10000`, // ✅ FIXED: clears ALL rows up to 10000
            values: Array(clearRowCount).fill(FIELD_ORDER.map(() => "")),
          }] : []),
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