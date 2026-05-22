import express from "express";
import { createControl, getControl, updateControlCheck, revisarOrden } from "../controllers/controlController.js";

const router = express.Router();

router.post("/:orderId", createControl);
router.get("/:orderId", getControl);
router.put("/revisar/:id", revisarOrden);
router.put("/:id", updateControlCheck);

export default router;