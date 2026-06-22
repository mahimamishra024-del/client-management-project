import express from "express";
import {
  tallyStatus,
  pushClientToTally,
  pushAllToTally,
  getTallyPushed,
  previewXML,
  syncFromTally,
  triggerReverseSync,
} from "../controllers/tallyController.js";

const router = express.Router();

router.get("/status",           tallyStatus);
router.get("/push/:id",         pushClientToTally);
router.post("/push/:id",        pushClientToTally);
router.post("/push-all",        pushAllToTally);
router.get("/pushed",           getTallyPushed);
router.get("/preview/:id",      previewXML);
router.get("/sync-from-tally",  syncFromTally);
router.post("/force-sync",      triggerReverseSync);

export default router;