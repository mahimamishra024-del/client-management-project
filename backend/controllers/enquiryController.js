import db from "../config/db.js";
import { scheduleSyncAfterChange } from "../services/syncEngine.js";
import { pushToTally } from "../services/tallyService.js";

export const getAllEnquiries = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM enquiries ORDER BY id ASC");
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getSheetUrl = async (req, res) => {
  try {
    const currentSheetId = global.currentActiveSheetId;
    if (!currentSheetId) return res.status(200).json({ success: true, url: `https://drive.google.com/drive/my-drive` });
    return res.status(200).json({ success: true, url: `https://docs.google.com/spreadsheets/d/${currentSheetId}/edit` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createEnquiry = async (req, res) => {
  const { companyName, enquiryStatus, remarks, bill_no, bill_amount,
    bdMemberName, teamLeaderName, franchiseeName, hrExecutiveName, designation,
    gstNo, addressLine1, emailId, mobileNo, website, placementFees, positionName,
    from, to, creditPeriod, replacementPeriod,
    newTeamLeader, nameOfFranchisee, candidateName, additionalContacts } = req.body;

  const normalizeDate = (d) => {
    if (!d) return null;
    const s = String(d);
    if (s.includes("T")) return s.split("T")[0];
    return s || null;
  };
  const bill_date = normalizeDate(req.body.bill_date);
  const dateOfAllocation = normalizeDate(req.body.dateOfAllocation);
  const dateOfReallocation = normalizeDate(req.body.dateOfReallocation);

  try {
    const [result] = await db.query(
      `INSERT INTO enquiries (companyName, enquiryStatus, remarks, bill_no, bill_date, bill_amount,
        bdMemberName, teamLeaderName, franchiseeName, hrExecutiveName, designation,
        gstNo, addressLine1, emailId, mobileNo, website, placementFees, positionName,
        \`from\`, \`to\`, creditPeriod, replacementPeriod, dateOfAllocation, dateOfReallocation,
        newTeamLeader, nameOfFranchisee, candidateName, additionalContacts)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [companyName, enquiryStatus || "inprogress", remarks || "", bill_no || null,
       bill_date || null, bill_amount || null, bdMemberName || null, teamLeaderName || null,
       franchiseeName || null, hrExecutiveName || null, designation || null, gstNo || null,
       addressLine1 || null, emailId || null, mobileNo || null, website || null,
       placementFees || null, positionName || null, from || null, to || null,
       creditPeriod || null, replacementPeriod || null, dateOfAllocation || null,
       dateOfReallocation || null, newTeamLeader || null, nameOfFranchisee || null,
       candidateName || null, additionalContacts || null]
    );
    scheduleSyncAfterChange();
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ createEnquiry error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateEnquiry = async (req, res) => {
  const { id } = req.params;
  const { companyName, enquiryStatus, remarks, bill_no, bill_amount,
    bdMemberName, teamLeaderName, franchiseeName, hrExecutiveName, designation,
    gstNo, addressLine1, emailId, mobileNo, website, placementFees, positionName,
    from, to, creditPeriod, replacementPeriod,
    newTeamLeader, nameOfFranchisee, candidateName, additionalContacts } = req.body;

  // Normalize date fields — strip timezone to avoid MySQL DATE column errors
  const normalizeDate = (d) => {
    if (!d) return null;
    const s = String(d);
    if (s.includes("T")) return s.split("T")[0];
    return s || null;
  };
  const bill_date = normalizeDate(req.body.bill_date);
  const dateOfAllocation = normalizeDate(req.body.dateOfAllocation);
  const dateOfReallocation = normalizeDate(req.body.dateOfReallocation);

  try {
    await db.query(
      `UPDATE enquiries SET
        companyName=?, enquiryStatus=?, remarks=?, bill_no=?, bill_date=?, bill_amount=?,
        bdMemberName=?, teamLeaderName=?, franchiseeName=?, hrExecutiveName=?, designation=?,
        gstNo=?, addressLine1=?, emailId=?, mobileNo=?, website=?, placementFees=?, positionName=?,
        \`from\`=?, \`to\`=?, creditPeriod=?, replacementPeriod=?, dateOfAllocation=?, dateOfReallocation=?,
        newTeamLeader=?, nameOfFranchisee=?, candidateName=?, additionalContacts=?
       WHERE id=?`,
      [companyName, enquiryStatus, remarks, bill_no || null, bill_date || null, bill_amount || null,
       bdMemberName || null, teamLeaderName || null, franchiseeName || null, hrExecutiveName || null,
       designation || null, gstNo || null, addressLine1 || null, emailId || null, mobileNo || null,
       website || null, placementFees || null, positionName || null, from || null, to || null,
       creditPeriod || null, replacementPeriod || null, dateOfAllocation || null,
       dateOfReallocation || null, newTeamLeader || null, nameOfFranchisee || null,
       candidateName || null, additionalContacts || null, id]
    );
    scheduleSyncAfterChange();
    res.status(200).json({ success: true, message: "Enquiry updated." });
  } catch (err) {
    console.error("❌ updateEnquiry error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteEnquiry = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM enquiries WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Record not found." });
    scheduleSyncAfterChange();
    res.status(200).json({ success: true, message: "Enquiry deleted." });
  } catch (err) {
    console.error("❌ deleteEnquiry error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const exportExcel = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM enquiries ORDER BY id ASC");
    if (rows && rows.length > 0) return res.status(200).json({ success: true, data: rows });
    res.status(400).json({ success: false, message: "No data available." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const triggerTallyPush = async (req, res) => {
  const { id } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM enquiries WHERE id = ?", [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: "Record not found." });
    const record = rows[0];
    const tallyResult = await pushToTally(record);
    if (tallyResult.success) {
      await db.query("UPDATE enquiries SET tally_pushed = 1 WHERE id = ?", [id]);
      scheduleSyncAfterChange();
      return res.status(200).json({ success: true, message: "Pushed to Tally." });
    }
    res.status(400).json({ success: false, error: tallyResult.error || "Failed to push to Tally." });
  } catch (err) {
    console.error("❌ triggerTallyPush error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};