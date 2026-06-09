import express from "express";
import {
  tallyStatus,
  pushEnquiryToTally,
  pushAllToTally,
  getTallyPushed,
  previewXML,
  syncFromTally,
  triggerReverseSync,  // new
} from "../controllers/tallyController.js";

const router = express.Router();

router.get("/status",           tallyStatus);
router.get("/push/:id",         pushEnquiryToTally);
router.post("/push/:id",        pushEnquiryToTally);
router.post("/push-all",        pushAllToTally);
router.get("/pushed",           getTallyPushed);
router.get("/preview/:id",      previewXML);
router.get("/sync-from-tally",  syncFromTally);
router.post("/force-sync",      triggerReverseSync); // manual trigger

export default router;