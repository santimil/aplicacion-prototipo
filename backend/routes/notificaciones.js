import express from "express";
import { checkOrderDeadlines, getNotifications, markAsRead } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);
router.put("/:id/read", markAsRead);


export default router;