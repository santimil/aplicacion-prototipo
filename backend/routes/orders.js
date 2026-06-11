import express from "express";
import { getOrders, createOrder, updateOrder, deleteOrder, 
    marcarEnCamino, entregarOrder, marcarReclama } from "../controllers/ordersController.js";

const router = express.Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.put("/camino/:id", marcarEnCamino);
router.put("/entregar/:id", entregarOrder);
router.put("/reclamo/:id", marcarReclama);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;