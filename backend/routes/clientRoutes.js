import express from "express";
import {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
  exportExcel,
} from "../controllers/clientController.js";

const router = express.Router();

router.get("/", getAllClients);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);
router.get("/export/excel", exportExcel);

export default router;