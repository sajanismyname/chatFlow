import express from "express"
import cors from "cors"

const app=express()

import authRoutes from "./routes/authRoute.js"
import testRoutes from "./routes/testRoues.js"

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/test", testRoutes)

export default app;