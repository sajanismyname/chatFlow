import { Router } from "express";
import { 
    getUser,
    googleLogin,
    googleCallback,
    refreshAccessToken,
    logout,
    login,
    register
    } from "../controllers/authController.js";

const router =Router()

router.get("/users", getUser)
router.get("/google", googleLogin)
router.get("/google/callback", googleCallback)
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.post("/login", login);
router.post("/register", register);

export default router