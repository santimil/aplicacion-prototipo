import express from "express";
import multer from "multer";

import {
  uploadPlanos,
  getPlanos,
  deletePlano
} from "../controllers/planosController.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/"
});

router.post(
  "/:cuestionarioId",
  upload.array("files"),
  uploadPlanos
);

router.get(
  "/:cuestionarioId",
  getPlanos
);

router.delete(
  "/:id",
  deletePlano
);

export default router;