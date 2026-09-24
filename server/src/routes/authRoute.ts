import { Router } from "express";
import { 
    getUser,
    getCurrentUser,
    googleLogin,
    googleCallback,
    refreshAccessToken,
    logout,
    login,
    register,
    updateProfile,
    forgotPassword,
    resetPassword
    } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router =Router()

router.get("/users",authenticate, getUser)
router.get("/google", googleLogin)
router.get("/google/callback", googleCallback)
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.post("/login", login);
router.post("/register", register);
router.get("/me",authenticate, getCurrentUser)
router.patch("/profile",authenticate, updateProfile)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router