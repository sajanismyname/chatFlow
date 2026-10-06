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
    getRegistrationFee,
    initiateRegistrationPayment,
    verifyRegistrationPayment,
    updateProfile,
    getUserProfile,
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
router.get("/register/fee", getRegistrationFee);
router.post("/register/initiate", initiateRegistrationPayment);
router.post("/payment/initiate", authenticate, initiateRegistrationPayment);
router.post("/register/verify", verifyRegistrationPayment);
router.post("/payment/verify", verifyRegistrationPayment);
router.post("/register", register);
router.get("/profile",authenticate, getCurrentUser)
router.patch("/myProfile",authenticate, updateProfile)
router.patch("/profile",authenticate, updateProfile)
router.get("/:id/profile",authenticate, getUserProfile)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router