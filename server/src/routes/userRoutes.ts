import { Router } from "express";

import {
    searchUser,
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

export default router;