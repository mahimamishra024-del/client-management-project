import express from "express";
import {
  googleAuth,
  googleCallback,
  googleStatus,
  googleDisconnect,
  checkEmailAccess,
} from "../controllers/authController.js";

const router = express.Router();

// 👉 http://localhost:5000/auth/google
router.get("/google", googleAuth);

// 👉 http://localhost:5000/auth/google/callback
router.get("/google/callback", googleCallback);

// 👉 http://localhost:5000/auth/google/status
router.get("/google/status", googleStatus);

// 👉 http://localhost:5000/auth/google/disconnect
router.get("/google/disconnect", googleDisconnect);

// 👉 http://localhost:5000/auth/check-access  (POST)
router.post("/check-access", checkEmailAccess);

export default router;