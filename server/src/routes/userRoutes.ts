import { Router } from "express";

import {
    searchUser,
    getNickname,
    setNickname,
    deleteNickname
} from "../controllers/userControllers.js";

import {
        getCurrentUser,
    getUserProfile,
    updateProfile,
} from "../controllers/authController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get(
    "/search",
    authenticate,
    searchUser
);

router.get(
    "/profile",
    authenticate,
    getCurrentUser
);

router.patch(
    "/myProfile",
    authenticate,
    updateProfile
);

router.get(
    "/:id/profile",
    authenticate,
    getUserProfile
);

router.get(
    "/:conversationId/nickname/:userId",
    authenticate,
    getNickname
);

router.put(
    "/:conversationId/nickname/:userId",
    authenticate,
    setNickname
);

router.delete(
    "/:conversationId/nickname/:userId",
    authenticate,
    deleteNickname
);

export default router;