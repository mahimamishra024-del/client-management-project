import express from "express";
import {
  getAllEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getSheetUrl,
  exportExcel,
} from "../controllers/enquiryController.js";

const router = express.Router();

router.get("/sheet-url",    getSheetUrl);
router.get("/export/excel", exportExcel);
router.get("/",             getAllEnquiries);
router.post("/",            createEnquiry);
router.put("/:id",          updateEnquiry);
router.delete("/:id",       deleteEnquiry);

export default router;