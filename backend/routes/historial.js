import express from "express";
import { getHistorial } from "../controllers/historialController.js";

const router = express.Router();

router.get("/:id", getHistorial);

export default router;