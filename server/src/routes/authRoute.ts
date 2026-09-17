import { Router } from "express";
import { 
    getUser,
    googleLogin,
    googleCallback,
    } from "../controllers/authController.js";

const router =Router()

router.get("/users", getUser)
router.get("/google", googleLogin)
router.get("/google/callback", googleCallback)

export default router