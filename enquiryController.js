import db from "../config/db.js";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

// --- GOOGLE SHEETS API UTILITY INSTANCE SETUP ---
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SA_PATH || "./service-account.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function getSheetsInstance() {
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

// Single Row Update Trigger for Event Driven Live Sync
async function syncSingleRowToSheet(tabName, rowIndex, rowData) {
  try {
    const sheets = await getSheetsInstance();
    const values = [Object.values(rowData)];
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID,
      range: `${tabName}!A${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  } catch (err) {
    console.error(`Live Sync failed for ${tabName}:`, err.message);
  }
}
// --- END GOOGLE SHEETS SETUP ---

export const getAllEnquiries = async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT 
        e.*
      FROM enquiries e
      ORDER BY e.id DESC;
    `);
    res.json({
      data,
    });
  } catch (err) {
    console.error("Error fetching enquiries:", err);
    res.status(500).json({ error: "Failed to fetch enquiries", details: err.message });
  }
};

export const getEnquiryById = async (req, res) => {
  const id = req.params.id;
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID format" });

  try {
    const [rows] = await db.query(
      `
      SELECT 
        e.*
      FROM enquiries e
      WHERE e.id = ?
    `,
      [id],
    );

    if (rows.length === 0) return res.status(404).json({ error: "Enquiry not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching enquiry by ID:", err);
    res.status(500).json({ error: "Failed to fetch enquiry", details: err.message });
  }
};

export const createEnquiry = async (req, res) => {
  const enquiryData = req.body;
  const required = ["companyName", "emailId", "mobileNo"];
  const missing = required.filter((f) => !enquiryData[f]);

  if (missing.length) return res.status(400).json({ error: "Missing fields", missing });

  const allowedFields = [
    "companyName",
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
    "enquiryStatus",
    "remarks",
    "dateOfAllocation",
    "dateOfReallocation",
    "newTeamLeader",
    "nameOfFranchisee",
    "bill_no",
    "bill_date",
    "bill_amount",
    "candidateName",
    "additionalContacts",
  ];

  const filteredData = {};
  allowedFields.forEach((field) => {
    if (enquiryData[field] !== undefined && enquiryData[field] !== null && enquiryData[field] !== "") {
      filteredData[field] = enquiryData[field];
    }
  });

  if (filteredData.placementFees !== undefined) {
    filteredData.placementFees = filteredData.placementFees ? Number.parseFloat(filteredData.placementFees) : null
  }
  if (filteredData.creditPeriod !== undefined) {
    filteredData.creditPeriod = filteredData.creditPeriod ? Number.parseInt(filteredData.creditPeriod) : null
  }
  if (filteredData.replacementPeriod !== undefined) {
    filteredData.replacementPeriod = filteredData.replacementPeriod ? Number.parseInt(filteredData.replacementPeriod) : null
  }
  if (filteredData.from !== undefined) {
    filteredData.from = filteredData.from ? Number.parseInt(filteredData.from) : null
  }
  if (filteredData.to !== undefined) {
    filteredData.to = filteredData.to ? Number.parseInt(filteredData.to) : null
  }
  if (filteredData.bill_amount !== undefined) {
    filteredData.bill_amount = filteredData.bill_amount ? Number.parseFloat(filteredData.bill_amount) : null
  }

  if (filteredData.dateOfAllocation !== undefined) {
    filteredData.dateOfAllocation = filteredData.dateOfAllocation || null
  }
  if (filteredData.dateOfReallocation !== undefined) {
    filteredData.dateOfReallocation = filteredData.dateOfReallocation || null
  }
  if (filteredData.bill_date !== undefined) {
    filteredData.bill_date = filteredData.bill_date || null
  }

  if (!filteredData.enquiryStatus) {
    filteredData.enquiryStatus = "inprogress"
  }

  const now = new Date();
  filteredData.created_at = now;
  filteredData.updated_at = now;

  try {
    const [result] = await db.query("INSERT INTO enquiries SET ?", [filteredData]);
    
    // --- INTEGRATED HOOK: Dynamic Live Sync on Creation ---
    const [freshRows] = await db.query("SELECT COUNT(*) as total FROM enquiries");
    const nextRowIndex = freshRows[0].total + 1; // Accounting for table header space overhead
    
    // Auto sync layout to Enquiry Data Tab
    await syncSingleRowToSheet("Enquiry Data", nextRowIndex, {
      timestamp: now.toISOString(),
      company_name: filteredData.companyName || "",
      name_of_franchisee: filteredData.franchiseeName || "",
      name_of_candidate: filteredData.candidateName || "",
      name_of_hr_executive: filteredData.hrExecutiveName || "",
      designation: filteredData.designation || "",
      enquiry_status: filteredData.enquiryStatus,
      remarks: filteredData.remarks || "",
      mobile_no: filteredData.mobileNo || "",
      bill_no: filteredData.bill_no || "-",
      bill_date: filteredData.bill_date || null,
      bill_amount: filteredData.bill_amount || 0,
      action: "INSERT"
    });

    res.status(201).json({ id: result.insertId, ...filteredData });
  } catch (err) {
    console.error("Database error during creation:", err);
    res.status(500).json({ error: "Failed to create enquiry", details: err.message });
  }
};

export const updateEnquiry = async (req, res) => {
  const id = req.params.id;
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID format" });

  const updateData = req.body;

  const validEnquiryStatuses = [
    "inprogress",
    "closed",
    "credit_note",
    "offered_and_accepted",
    "offered_and_rejected",
    "revised",
    "position_hold",
    "internally_closed",
    "invoiced",
    "reallocation",
    "cancelled" 
  ];

  if (updateData.enquiryStatus) {
    updateData.enquiryStatus = updateData.enquiryStatus.replace(/\s+/g, "_").toLowerCase();
    if (!validEnquiryStatuses.includes(updateData.enquiryStatus)) {
      return res.status(400).json({ error: "Invalid enquiryStatus value" });
    }
  }

  const allowedFields = [
    "companyName",
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
    "enquiryStatus",
    "remarks",
    "dateOfAllocation",
    "dateOfReallocation",
    "newTeamLeader",
    "nameOfFranchisee",
    "bill_no",
    "bill_date",
    "bill_amount",
    "candidateName",
    "additionalContacts",
  ];

  const filteredData = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  if (filteredData.placementFees !== undefined) {
    filteredData.placementFees = filteredData.placementFees ? Number.parseFloat(filteredData.placementFees) : null
  }
  if (filteredData.creditPeriod !== undefined) {
    filteredData.creditPeriod = filteredData.creditPeriod ? Number.parseInt(filteredData.creditPeriod) : null
  }
  if (filteredData.replacementPeriod !== undefined) {
    filteredData.replacementPeriod = filteredData.replacementPeriod ? Number.parseInt(filteredData.replacementPeriod) : null
  }
  if (filteredData.from !== undefined) {
    filteredData.from = filteredData.from ? Number.parseInt(filteredData.from) : null
  }
  if (filteredData.to !== undefined) {
    filteredData.to = filteredData.to ? Number.parseInt(filteredData.to) : null
  }

  const rightNow = new Date();
  filteredData.updated_at = rightNow;

  try {
    const [result] = await db.query("UPDATE enquiries SET ? WHERE id = ?", [filteredData, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    // Fetch refreshed row information
    const [rows] = await db.query("SELECT * FROM enquiries WHERE id = ?", [id]);
    const updatedRecord = rows[0];

    // --- INTEGRATED HOOK: Dynamic Live Sync on Dropdown/Field Update ---
    // Finding approximate placement line inside Spreadsheet structure array
    const rowIndexOffset = Number(id) + 1;

    // 1. Sync modifications straight onto main Enquiry Data Sheet
    await syncSingleRowToSheet("Enquiry Data", rowIndexOffset, {
      timestamp: updatedRecord.created_at,
      company_name: updatedRecord.companyName || "",
      name_of_franchisee: updatedRecord.franchiseeName || "",
      name_of_candidate: updatedRecord.candidateName || "",
      name_of_hr_executive: updatedRecord.hrExecutiveName || "",
      designation: updatedRecord.designation || "",
      enquiry_status: updatedRecord.enquiryStatus,
      remarks: updatedRecord.remarks || "",
      mobile_no: updatedRecord.mobileNo || "",
      bill_no: updatedRecord.bill_no || "-",
      bill_date: updatedRecord.bill_date || null,
      bill_amount: updatedRecord.bill_amount || 0,
      action: "UPDATE"
    });

    // 2. Automated Pipeline Trigger: If Status matches 'Closed', auto-populate Invoice Tab!
    if (updatedRecord.enquiryStatus === "closed") {
      const [invoiceCountRows] = await db.query("SELECT COUNT(*) as total FROM enquiries WHERE enquiryStatus = 'closed'");
      const nextInvoiceRowIndex = invoiceCountRows[0].total + 1;

      await syncSingleRowToSheet("Invoice Data", nextInvoiceRowIndex, {
        timestamp: rightNow.toISOString(),
        franchise_name: updatedRecord.franchiseeName || "",
        company_name: updatedRecord.companyName || "",
        company_city: "Mumbai", // Local placeholder parameters
        gst_no: updatedRecord.gstNo || "",
        service_amount: updatedRecord.bill_amount || 0,
        name_of_candidate: updatedRecord.candidateName || "",
        total_gst: (updatedRecord.bill_amount || 0) * 0.18, // Auto calculation parameters
        total_bill_amt: (updatedRecord.bill_amount || 0) * 1.18,
        amount_received: 0,
        bill_number: updatedRecord.bill_no || "-",
        bill_date: updatedRecord.bill_date || null,
        due_date: null,
        info: updatedRecord.remarks || "",
        tally_updated: "No", // Retained framework specs for Tally Sync column schema
        tl_verified: "No",
        action: "INSERT"
      });
    }

    res.json(updatedRecord);
  } catch (err) {
    console.error("Database error during update:", err);
    res.status(500).json({ error: "Failed to update enquiry", details: err.message });
  }
};

export const deleteEnquiry = async (req, res) => {
  const id = req.params.id;
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const deletedByName = req.query.deletedByName || req.body.deletedByName || null;
  const deletedById   = req.query.deletedById   || req.body.deletedById   || null;

  try {
    const [rows] = await db.query("SELECT * FROM enquiries WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }
    const enquiry = rows[0];

    await db.query(
      `INSERT INTO deleted_enquiries (
        original_id, companyName, bdMemberName, teamLeaderName, franchiseeName,
        hrExecutiveName, designation, gstNo, addressLine1, emailId, mobileNo,
        website, placementFees, positionName, \`from\`, \`to\`, creditPeriod,
        replacementPeriod, enquiryStatus, remarks, dateOfAllocation, dateOfReallocation,
        newTeamLeader, nameOfFranchisee, bill_no, bill_date, bill_amount,
        candidateName, additionalContacts, original_created_at, original_updated_at,
        deleted_at, deleted_by_name, deleted_by_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        enquiry.id, enquiry.companyName, enquiry.bdMemberName, enquiry.teamLeaderName,
        enquiry.franchiseeName, enquiry.hrExecutiveName, enquiry.designation, enquiry.gstNo,
        enquiry.addressLine1, enquiry.emailId, enquiry.mobileNo, enquiry.website,
        enquiry.placementFees, enquiry.positionName, enquiry.from, enquiry.to,
        enquiry.creditPeriod, enquiry.replacementPeriod, enquiry.enquiryStatus, enquiry.remarks,
        enquiry.dateOfAllocation, enquiry.dateOfReallocation, enquiry.newTeamLeader,
        enquiry.nameOfFranchisee, enquiry.bill_no, enquiry.bill_date, enquiry.bill_amount,
        enquiry.candidateName, enquiry.additionalContacts,
        enquiry.created_at, enquiry.updated_at,
        deletedByName, deletedById,
      ]
    );

    const [result] = await db.query("DELETE FROM enquiries WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    res.status(200).json({ message: "Enquiry deleted successfully" });
  } catch (err) {
    console.error("Database error during deletion:", err);
    res.status(500).json({ error: "Failed to delete enquiry", details: err.message });
  }
};

export const addCandidate = async (req, res) => {
  const candidateData = req.body;
  const requiredFields = [
    "name",
    "mobileNo",
    "email",
    "ctc",
    "expectedCtc",
    "currentLocation",
    "preferredLocation",
    "noticePeriod",
    "totalExperience",
    "relevantExperience", 
    "education",
    "enquiry_id",
  ];
  const missing = requiredFields.filter((f) => !candidateData[f]);

  if (missing.length) return res.status(400).json({ error: "Missing fields", missing });

  try {
    const [result] = await db.query("INSERT INTO candidateForm SET ?", [candidateData]);

    await db.query(
      `
      UPDATE enquiries
      SET candidateName = ?
      WHERE id = ?
    `,
      [candidateData.name, candidateData.enquiry_id]
    );

    res.status(201).json({ id: result.insertId, ...candidateData });
  } catch (err) {
    console.error("Database error during candidate creation:", err);
    res.status(500).json({ error: "Failed to create candidate", details: err.message });
  }
};

// --- CORE BULK EXPORT INTELLIGENT METHOD (Triggers side-by-side with Legacy CSV Exporter) ---
export const exportToGoogleSheets = async (req, res) => {
  try {
    const sheets = await getSheetsInstance();

    // 1. Path A Operational Extraction: Pull all rows for Enquiry Data Tab
    const [enquiryRows] = await db.query("SELECT * FROM enquiries ORDER BY id DESC");
    
    const enquiryHeaders = ["TIMESTAMP", "COMPANY NAME", "NAME OF FRANCHISEE", "NAME OF CANDIDATE", "NAME OF HR EXECUTIVE", "DESIGNATION", "ENQUIRY STATUS", "REMARKS", "MOBILE NO.", "BILL NO", "BILL DATE", "BILL AMOUNT", "ACTION"];
    const enquiryPayloadValues = enquiryRows.map(row => [
      row.created_at ? new Date(row.created_at).toISOString() : "N/A",
      row.companyName || "",
      row.franchiseeName || "",
      row.candidateName || "",
      row.hrExecutiveName || "",
      row.designation || "",
      row.enquiryStatus || "",
      row.remarks || "",
      row.mobileNo || "",
      row.bill_no || "-",
      row.bill_date || "",
      row.bill_amount || 0,
      "INSERT"
    ]);

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID,
      range: "Enquiry Data!A1",
      valueInputOption: "RAW",
      requestBody: { values: [enquiryHeaders, ...enquiryPayloadValues] },
    });

    // 2. Path B Financial Extraction: Filter out entries matching Closed requirements only!
    const [invoiceRows] = await db.query("SELECT * FROM enquiries WHERE enquiryStatus = 'closed' ORDER BY id DESC");
    
    const invoiceHeaders = ["TIMESTAMP", "FRANCHISE NAME", "COMPANY NAME", "COMPANY CITY", "GST NO.", "SERVICE AMOUNT", "NAME OF CANDIDATE", "TOTAL GST", "TOTAL BILL AMT", "AMOUNT RECEIVED", "BILL NUMBER", "BILL DATE", "DUE DATE", "INFO", "TALLY UPDATED", "TL VERIFIED", "ACTION"];
    const invoicePayloadValues = invoiceRows.map(row => {
      const baseAmt = Number(row.bill_amount) || 0;
      const calculatedGst = baseAmt * 0.18;
      return [
        row.updated_at ? new Date(row.updated_at).toISOString() : "N/A",
        row.franchiseeName || "",
        row.companyName || "",
        "Mumbai", 
        row.gstNo || "",
        baseAmt,
        row.candidateName || "",
        calculatedGst,
        baseAmt + calculatedGst,
        0, // Amount Received standard placeholder
        row.bill_no || "-",
        row.bill_date || "",
        "", // Due date empty placeholder block
        row.remarks || "",
        "No", // Tally integration hook spec retained intact
        "No",
        "INSERT"
      ];
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID,
      range: "Invoice Data!A1",
      valueInputOption: "RAW",
      requestBody: { values: [invoiceHeaders, ...invoicePayloadValues] },
    });

    // Resolve redirection link callback parameter matrix back to React component UI
    res.json({
      success: true,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${process.env.SHEET_ID}`
    });

  } catch (err) {
    console.error("Google Sheets Bulk Push Error:", err.message);
    res.status(500).json({ error: "Failed to export data matrix to cloud spreadsheet", details: err.message });
  }
};