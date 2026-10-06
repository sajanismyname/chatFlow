import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { uploadMiddleware, uploadFile } from "../controllers/uploadController.js";

const router = Router();

router.post("/", authenticate, uploadMiddleware, uploadFile);

export default router;
