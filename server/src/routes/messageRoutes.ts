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


/* =========================
   GET MESSAGES
========================= */

router.get(
    "/:conversationId/messages",
    authenticate,
    getMessages
);


/* =========================
   SEND MESSAGE
========================= */

router.post(
    "/:conversationId/messages",
    authenticate,
    sendMessage
);


/* =========================
   DELETE FOR ME
========================= */

router.delete(
    "/messages/:messageId",
    authenticate,
    deleteMessageForMeController
);


/* =========================
   UNSEND
========================= */

router.delete(
    "/messages/:messageId/unsend",
    authenticate,
    unsendMessageController
);


export default router;