import db from "../config/db.js";
import { scheduleSyncAfterChange } from "../services/syncEngine.js";
import { pushToTally } from "../services/tallyService.js";

/* GET ALL */
export const getAllEnquiries = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM enquiries ORDER BY id ASC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* CREATE */
export const createEnquiry = async (req, res) => {
  try {
    const {
      company_name,
      bd_member,
      team_leader,
      hr_executive,
      email,
      mobile,
      position_name,
      placement_fees,
      status,
      remarks
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO enquiries 
      (company_name, bd_member, team_leader, hr_executive, email, mobile, position_name, placement_fees, status, remarks)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        company_name,
        bd_member,
        team_leader,
        hr_executive,
        email,
        mobile,
        position_name,
        placement_fees,
        status || "In Progress",
        remarks
      ]
    );

    scheduleSyncAfterChange();

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* UPDATE */
export const updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      company_name,
      bd_member,
      team_leader,
      hr_executive,
      email,
      mobile,
      position_name,
      placement_fees,
      status,
      remarks
    } = req.body;

    await db.query(
      `UPDATE enquiries SET 
      company_name=?, bd_member=?, team_leader=?, hr_executive=?, email=?, mobile=?, position_name=?, placement_fees=?, status=?, remarks=?
      WHERE id=?`,
      [
        company_name,
        bd_member,
        team_leader,
        hr_executive,
        email,
        mobile,
        position_name,
        placement_fees,
        status,
        remarks,
        id
      ]
    );

    scheduleSyncAfterChange();

    res.json({ success: true, message: "Updated" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* DELETE */
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM enquiries WHERE id=?", [id]);

    scheduleSyncAfterChange();

    res.json({ success: true, message: "Deleted" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* EXPORT (IMPORTANT — KEEP THIS) */
export const exportExcel = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM enquiries ORDER BY id ASC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* TALLY */
export const triggerTallyPush = async (req, res) => {
  try {
    const { id } = req.body;

    const [rows] = await db.query("SELECT * FROM enquiries WHERE id=?", [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const result = await pushToTally(rows[0]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};