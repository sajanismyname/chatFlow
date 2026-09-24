import type { Request, Response } from "express";
import { ILike } from "typeorm";
import { AppDataSource } from "../config/dataSource.js";
import { User } from "../entities/User.js";

const userRepository = AppDataSource.getRepository(User);

export const searchUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const currentUserId = req.user?.id;
        const query = req.query.q;

        if (!currentUserId) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        if (
            typeof query !== "string" ||
            !query.trim()
        ) {
            res.status(400).json({
                message: "Search query is required",
            });
            return;
        }

        const users = await userRepository.find({
            select: {
                id: true,
                name: true,
                avatar: true,
            },

            where: {
                name: ILike(`%${query.trim()}%`),
            },

            take: 20,
        });

        const filteredUsers = users.filter(
            (user) => user.id !== currentUserId
        );

        res.status(200).json({
            users: filteredUsers,
        });

    } catch (error) {

        console.error(
            "Failed to search users:",
            error
        );

        res.status(500).json({
            message: "Failed to search users",
        });
    }
}