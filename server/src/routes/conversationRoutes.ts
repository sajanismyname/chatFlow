import { Router } from "express";

import {
    getConversations,
    createConversation,
    deleteConversation
} from "../controllers/conversationController.js";

import {
    authenticate,
} from "../middleware/authMiddleware.js";

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

router.delete(
    "/:conversationId",
    authenticate,
    deleteConversation
);

export default router;