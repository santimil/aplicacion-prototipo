import express from "express";
import { createControl, getControl, updateControlCheck, aprovarOrden } from "../controllers/controlController.js";

const router = express.Router();

router.post("/:orderId", createControl);
router.get("/:orderId", getControl);
router.put("/aprobar/:id", aprovarOrden);
router.put("/:id", updateControlCheck);

export default router;