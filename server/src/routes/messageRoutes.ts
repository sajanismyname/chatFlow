import { Router } from "express";

import {
    deleteMessageForMeController,
    getMessages,
    sendMessage,
    unsendMessageController,
} from "../controllers/messageController.js";

import {
    authenticate,
} from "../middleware/authMiddleware.js";


const router = Router();

router.get(
    "/:conversationId/messages",
    authenticate,
    getMessages
);

router.post(
    "/:conversationId/messages",
    authenticate,
    sendMessage
);

router.delete(
    "messages/:messageId",
    authenticate,
    deleteMessageForMeController
)

router.delete(
    "messages/:messageId/unsend",
    authenticate,
    unsendMessageController
)

export default router;