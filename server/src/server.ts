import "reflect-metadata";
import "dotenv/config";

import { createServer } from "http";
import app from "./app.js";
import { AppDataSource } from "./config/dataSource.js";
import { initializeSocketServer } from "./socket/socketServer.js";

const httpServer = createServer(app);

const io = initializeSocketServer(httpServer);

const PORT=process.env.PORT || 5000;

AppDataSource.initialize()
    .then(async () => {
        console.log("TypeORM connected successfully");

        try {
            await AppDataSource.query(
                'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isDeleted" boolean NOT NULL DEFAULT false;'
            );
        } catch (err) {
            console.warn("Could not ensure isDeleted column:", err);
        }

        httpServer.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
});