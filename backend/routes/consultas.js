import express from "express";

import { createConsulta, getConsultasByOrden, 
    updateConsulta } from "../controllers/consultasController.js";

const router = express.Router();

router.post("/", createConsulta);

router.get("/:ordenId", getConsultasByOrden);

router.put("/:id", updateConsulta);

export default router;