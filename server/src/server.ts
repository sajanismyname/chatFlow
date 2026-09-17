import "reflect-metadata";
import "dotenv/config";

import { createServer } from "http";
import app from "./app.js";
import { AppDataSource } from "./config/dataSource.js";

const httpServer = createServer(app);

const PORT=process.env.PORT || 5000;

AppDataSource.initialize()
    .then(() => {
        console.log("TypeORM connected successfully");

        httpServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
});