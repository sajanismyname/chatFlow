import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { uploadFile } from "../controllers/uploadController.js";

const router = Router();

router.post("/", authenticate, uploadFile);

export default router;
