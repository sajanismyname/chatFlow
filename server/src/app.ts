import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoute.js"
import testRoutes from "./routes/testRoutes.js"
import conversationRoutes from "./routes/conversationRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import path from "path"
import { fileURLToPath } from "url"

const app=express()


app.use(express.json({ limit: "15mb" }))

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")))
app.use(cookieParser())
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);


app.use("/api/auth", authRoutes)
app.use("/api/test", testRoutes)
app.use("/api/conversations", conversationRoutes)
app.use("/api/users", userRoutes)
app.use("/api/conversations", messageRoutes)
app.use("/api/uploads", uploadRoutes)

export default app;