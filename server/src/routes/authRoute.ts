import { Router } from "express";
import { 
    getUser,
    googleLogin,
    googleCallback,
    refreshAccessToken,
    logout,
    } from "../controllers/authController.js";

const router =Router()

router.get("/users", getUser)
router.get("/google", googleLogin)
router.get("/google/callback", googleCallback)
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

export default router