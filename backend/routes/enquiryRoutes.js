import express from "express";
import {
  getAllEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  exportExcel,
  triggerTallyPush
} from "../controllers/enquiryController.js";

const router = express.Router();

router.get("/", getAllEnquiries);
router.post("/", createEnquiry);
router.put("/:id", updateEnquiry);
router.delete("/:id", deleteEnquiry);

router.get("/export", exportExcel);
router.post("/tally", triggerTallyPush);

export default router;