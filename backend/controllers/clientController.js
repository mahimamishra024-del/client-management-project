import db from "../config/db.js";
import { scheduleSyncAfterChange } from "../services/syncEngine.js";
import { pushToTally } from "../services/tallyService.js";

const autoPushToTallyIfReady = async (clientId) => {
  try {
    const [rows] = await db.query("SELECT * FROM clients WHERE id = ?", [clientId]);
    if (!rows.length) return;
    const client = rows[0];

    const billingReady = ["closed", "invoiced"].includes(client.billingStatus);
    const notYetPushed = !client.tally_pushed || client.tally_pushed === 0;
    const hasRequiredFields = client.bill_amount && client.bill_date;

    console.log(`🔍 Auto-push check for #${clientId}: billingReady=${billingReady}, notYetPushed=${notYetPushed}, hasRequiredFields=${hasRequiredFields}`);

    if (!billingReady || !notYetPushed || !hasRequiredFields) {
      console.log(`⏭️ Auto-push skipped for client #${clientId} — conditions not met`);
      return;
    }

    // ✅ FIXED: Check if same bill_no already pushed — stop retrying duplicate vouchers
    if (client.bill_no) {
      const [alreadyPushed] = await db.query(
        "SELECT id FROM clients WHERE bill_no = ? AND tally_pushed = 1 AND id != ?",
        [client.bill_no, clientId]
      );
      if (alreadyPushed.length > 0) {
        await db.query("UPDATE clients SET tally_pushed = 1 WHERE id = ?", [clientId]);
        console.log(`⏭️ Bill no ${client.bill_no} already pushed — marking id=${clientId} as pushed to stop retrying`);
        return;
      }
    }

    console.log(`🚀 Attempting Tally push for client #${clientId} (${client.companyName})...`);
    const result = await pushToTally(client);
    if (result.success) {
      await db.query("UPDATE clients SET tally_pushed = 1 WHERE id = ?", [clientId]);
      console.log(`✅ Auto-pushed client #${clientId} (${client.companyName}) to Tally`);
    } else {
      // ✅ FIXED: After failed push, mark as pushed to stop infinite retry loop
      await db.query("UPDATE clients SET tally_pushed = 1 WHERE id = ?", [clientId]);
      console.warn(`⚠️ Auto-push failed for client #${clientId}: ${result.error}`);
      console.warn(`⏭️ Marked tally_pushed=1 to prevent infinite retry for client #${clientId}`);
    }
  } catch (err) {
    console.error(`❌ Auto-push error for client #${clientId}:`, err.message);
  }
};

/* GET ALL */
export const getAllClients = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM clients ORDER BY id ASC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* CREATE */
export const createClient = async (req, res) => {
  try {
    const {
      companyName, bdMemberName, dateClientAcquired,
      address, city, pinCode, locationArea, state, country,
      yearOfEstablishment, industry, subIndustry, tags,
      companyConstitution, numberOfEmployees, gstNo, website,
      contactPersonName, designation, phoneNumber, emailId, contactPersonStatus,
      placementFees, additionalPlacementFees, creditPeriod, replacementPeriod,
      companyCategory, companyStatus, approvalStatus, remarks,
      dateOfRevivalCall, nameOfExecutive, statusOfCall, eMeet,
      updated, dateOfDataUpdate, dataUpdatedBy,
      teamLeader, franchiseeName, dateOfClientAllocation, reallocationStatus,
      billingStatus, bill_no, bill_amount, bill_date
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO clients (
        companyName, bdMemberName, dateClientAcquired,
        address, city, pinCode, locationArea, state, country,
        yearOfEstablishment, industry, subIndustry, tags,
        companyConstitution, numberOfEmployees, gstNo, website,
        contactPersonName, designation, phoneNumber, emailId, contactPersonStatus,
        placementFees, additionalPlacementFees, creditPeriod, replacementPeriod,
        companyCategory, companyStatus, approvalStatus, remarks,
        dateOfRevivalCall, nameOfExecutive, statusOfCall, eMeet,
        updated, dateOfDataUpdate, dataUpdatedBy,
        teamLeader, franchiseeName, dateOfClientAllocation, reallocationStatus,
        billingStatus, bill_no, bill_amount, bill_date
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        companyName, bdMemberName, dateClientAcquired || null,
        address, city, pinCode, locationArea, state, country,
        yearOfEstablishment, industry, subIndustry, tags,
        companyConstitution, numberOfEmployees, gstNo, website,
        contactPersonName, designation, phoneNumber, emailId, contactPersonStatus || "Active",
        placementFees || null, additionalPlacementFees || "No", creditPeriod || null, replacementPeriod || null,
        companyCategory, companyStatus, approvalStatus, remarks,
        dateOfRevivalCall || null, nameOfExecutive, statusOfCall, eMeet || "No",
        updated || "No", dateOfDataUpdate || null, dataUpdatedBy,
        teamLeader, franchiseeName, dateOfClientAllocation || null, reallocationStatus || "No",
        billingStatus || "Unbilled", bill_no || null, bill_amount || null, bill_date || null
      ]
    );

    scheduleSyncAfterChange();
    await autoPushToTallyIfReady(result.insertId);
    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* UPDATE */
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      companyName, bdMemberName, dateClientAcquired,
      address, city, pinCode, locationArea, state, country,
      yearOfEstablishment, industry, subIndustry, tags,
      companyConstitution, numberOfEmployees, gstNo, website,
      contactPersonName, designation, phoneNumber, emailId, contactPersonStatus,
      placementFees, additionalPlacementFees, creditPeriod, replacementPeriod,
      companyCategory, companyStatus, approvalStatus, remarks,
      dateOfRevivalCall, nameOfExecutive, statusOfCall, eMeet,
      updated, dateOfDataUpdate, dataUpdatedBy,
      teamLeader, franchiseeName, dateOfClientAllocation, reallocationStatus,
      billingStatus, bill_no, bill_amount, bill_date
    } = req.body;

    await db.query(
      `UPDATE clients SET
        companyName=?, bdMemberName=?, dateClientAcquired=?,
        address=?, city=?, pinCode=?, locationArea=?, state=?, country=?,
        yearOfEstablishment=?, industry=?, subIndustry=?, tags=?,
        companyConstitution=?, numberOfEmployees=?, gstNo=?, website=?,
        contactPersonName=?, designation=?, phoneNumber=?, emailId=?, contactPersonStatus=?,
        placementFees=?, additionalPlacementFees=?, creditPeriod=?, replacementPeriod=?,
        companyCategory=?, companyStatus=?, approvalStatus=?, remarks=?,
        dateOfRevivalCall=?, nameOfExecutive=?, statusOfCall=?, eMeet=?,
        updated=?, dateOfDataUpdate=?, dataUpdatedBy=?,
        teamLeader=?, franchiseeName=?, dateOfClientAllocation=?, reallocationStatus=?,
        billingStatus=?, bill_no=?, bill_amount=?, bill_date=?
      WHERE id=?`,
      [
        companyName, bdMemberName, dateClientAcquired || null,
        address, city, pinCode, locationArea, state, country,
        yearOfEstablishment, industry, subIndustry, tags,
        companyConstitution, numberOfEmployees, gstNo, website,
        contactPersonName, designation, phoneNumber, emailId, contactPersonStatus,
        placementFees || null, additionalPlacementFees, creditPeriod || null, replacementPeriod || null,
        companyCategory, companyStatus, approvalStatus, remarks,
        dateOfRevivalCall || null, nameOfExecutive, statusOfCall, eMeet,
        updated, dateOfDataUpdate || null, dataUpdatedBy,
        teamLeader, franchiseeName, dateOfClientAllocation || null, reallocationStatus,
        billingStatus || "Unbilled", bill_no || null, bill_amount || null, bill_date || null,
        id
      ]
    );

    scheduleSyncAfterChange();
    await autoPushToTallyIfReady(id);
    res.json({ success: true, message: "Updated" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* DELETE */
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM clients WHERE id=?", [id]);
    scheduleSyncAfterChange();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* EXPORT */
export const exportExcel = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM clients ORDER BY id ASC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};