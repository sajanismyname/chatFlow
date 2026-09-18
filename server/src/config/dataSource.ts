import "dotenv/config"
import "reflect-metadata"
import { DataSource } from "typeorm"

import { User } from "../entities/User.js";
import { Conversation } from "../entities/Conversation.js";
import { ConversationMember } from "../entities/ConversationMember.js";
import { Message } from "../entities/Message.js";
import { RefreshToken } from "../entities/refreshToken.js";

export const AppDataSource = new DataSource({
    type:"postgres",

    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    entities: [
        User,
        Conversation,
        ConversationMember,
        Message,
        RefreshToken
    ],

    migrations: ["src/migrations/*.ts"],
    synchronize: false,

})