import type { Request, Response } from "express";
import { ILike } from "typeorm";
import { AppDataSource } from "../config/dataSource.js";
import { User } from "../entities/User.js";
import { ConversationNickname } from "../entities/ConversationNickname.js";
import { ConversationMember } from "../entities/ConversationMember.js";

const userRepository = AppDataSource.getRepository(User);
const conversationNicknameRepository = AppDataSource.getRepository(ConversationNickname);
const conversationMemberRepository = AppDataSource.getRepository(ConversationMember);

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

export const getNickname = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const currentUserId = req.user?.id;
        const conversationId = Number(req.params.conversationId);
        const userId = Number(req.params.userId);

        if (!currentUserId) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        if (!conversationId || !userId) {
            res.status(400).json({
                message: "Invalid conversation or user ID",
            });
            return;
        }

        const membership = await conversationMemberRepository.findOne({
            where: {
                conversation: { id: conversationId },
                user: { id: currentUserId },
            },
        });

        if (!membership) {
            res.status(403).json({
                message: "You are not a member of this conversation",
            });
            return;
        }

        const nickname = await conversationNicknameRepository.findOne({
            where: {
                conversation: { id: conversationId },
                user: { id: userId },
            },
        });

        res.status(200).json({
            nickname: nickname?.nickname ?? null,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch nickname",
        });
    }
};

export const setNickname = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const currentUserId = req.user?.id;
        const conversationId = Number(req.params.conversationId);
        const userId = Number(req.params.userId);
        const { nickname } = req.body;

        if (!currentUserId) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        if (!conversationId || !userId) {
            res.status(400).json({
                message: "Invalid conversation or user ID",
            });
            return;
        }

        if (
            typeof nickname !== "string" ||
            !nickname.trim()
        ) {
            res.status(400).json({
                message: "Nickname is required",
            });
            return;
        }

        const membership = await conversationMemberRepository.findOne({
            where: {
                conversation: { id: conversationId },
                user: { id: currentUserId },
            },
        });

        if (!membership) {
            res.status(403).json({
                message: "You are not a member of this conversation",
            });
            return;
        }

        const targetMembership =
            await conversationMemberRepository.findOne({
                where: {
                    conversation: { id: conversationId },
                    user: { id: userId },
                },
            });

        if (!targetMembership) {
            res.status(404).json({
                message: "User is not a member of this conversation",
            });
            return;
        }

        let nicknameRecord = await conversationNicknameRepository.findOne({
            where: {
                conversation: { id: conversationId },
                user: { id: userId },
            },
        });

        if (nicknameRecord) {
            nicknameRecord.nickname = nickname.trim();
        } else {
            nicknameRecord = conversationNicknameRepository.create({
                conversation: { id: conversationId },
                user: { id: userId },
                nickname: nickname.trim(),
            });
        }

        await conversationNicknameRepository.save(nicknameRecord);

        res.status(200).json({
            nickname: nicknameRecord.nickname,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update nickname",
        });
    }
};

export const deleteNickname = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const currentUserId = req.user?.id;
        const conversationId = Number(req.params.conversationId);
        const userId = Number(req.params.userId);

        if (!currentUserId) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        if(!conversationId || !userId){
            res.status(400).json({
                message:"Invalid conversation or user ID",
            })
            return
        }

        const membership = await conversationMemberRepository.findOne({
            where: {
                conversation: { id: conversationId },
                user: { id: currentUserId },
            },
        })

        if(!membership){
            res.status(403).json({
                message:"You are not a member of this conversation",
            })
            return
        }

        const nicknameRecord = await conversationNicknameRepository.findOne({
            where: {
                conversation: { id: conversationId },
                user: { id: userId },
            }
        })

        if(!nicknameRecord){
            res.status(404).json({
                message:"Nickname not found",
            })
            return
        }

        await conversationNicknameRepository.remove(nicknameRecord)

        res.status(200).json({
            message:"Nickname deleted successfully"
        })
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Failed to delete nickname",
            });
        }
}