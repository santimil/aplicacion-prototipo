import express from "express";
import multer from "multer";
import { handleFile } from "../controllers/fileController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// 👇 nuevo endpoint
router.post("/", upload.single("file"), handleFile);

export default router;