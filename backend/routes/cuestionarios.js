import express from "express";
import { updateCuestionario } from "../controllers/cuestionarioController.js";

const router = express.Router();

router.put("/:ordenId", updateCuestionario);

export default router;