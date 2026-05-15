import express from "express";
import multer from "multer";
import { handleOCR } from "../controllers/ocrController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), handleOCR);

export default router;