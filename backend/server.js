import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import clientRoutes from "./routes/clientRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import tallyRoutes from "./routes/tallyRoutes.js";
import { startSyncLoop } from "./services/syncEngine.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/clients", clientRoutes);
app.use("/auth", authRoutes);
app.use("/api/tally", tallyRoutes);

startSyncLoop();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});