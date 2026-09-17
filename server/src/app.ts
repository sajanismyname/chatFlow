import express from "express"
import cors from "cors"

const app=express()

import authRoutes from "./routes/authRoute.js"

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)

export default app;