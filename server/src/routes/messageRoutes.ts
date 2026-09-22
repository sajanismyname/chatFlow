import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messageController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router()

router.get("/:conversationId/messages", authenticate, getMessages)

router.post("/:conversationId/messages", authenticate, sendMessage)

export default router