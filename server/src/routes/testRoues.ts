import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router()

router.get("/protected", authenticate, (req, res) =>{
    res.json({
        message: "You are authenticated!",
        userId: req.user?.id,
    });
})

export default router