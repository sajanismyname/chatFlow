import { Router } from "express";
import { getConversations, createConversation } from "../controllers/conversationController.js";
import { authenticate} from "../middleware/authMiddleware.js";

const router = Router();

router.get(
    "/",
    authenticate,
    getConversations
);

router.post(
    "/",
    authenticate,
    createConversation
);

export default router;