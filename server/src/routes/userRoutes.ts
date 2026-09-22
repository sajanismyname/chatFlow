import { Router } from "express";

import { searchUser } from "../controllers/userControllers.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router()

router.get(
    "/search",
    authenticate,
    searchUser
)

export default router