import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoute.js"
import testRoutes from "./routes/testRoues.js"

const app=express()


app.use(express.json())
app.use(cookieParser())
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);


app.use("/api/auth", authRoutes)
app.use("/api/test", testRoutes)

export default app;