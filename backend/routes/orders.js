import express from "express";
import { getOrders, createOrder, updateOrder, deleteOrder, entregarOrder } from "../controllers/ordersController.js";

const router = express.Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.put("/entregar/:id", entregarOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;