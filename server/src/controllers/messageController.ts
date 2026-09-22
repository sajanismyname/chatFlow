import type { Request, Response } from "express";

import { AppDataSource } from "../config/dataSource.js";
import { Message } from "../entities/Message.js";
import { ConversationMember } from "../entities/ConversationMember.js";

const messageRepository =
    AppDataSource.getRepository(Message);

const conversationMemberRepository =
    AppDataSource.getRepository(ConversationMember);


export const getMessages = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.id;

        const conversationId = Number(
            req.params.conversationId
        );

        if (!userId) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        if (!conversationId) {
            res.status(400).json({
                message: "Invalid conversation ID",
            });
            return;
        }

        const membership =
            await conversationMemberRepository.findOne({
                where: {
                    user: {
                        id: userId,
                    },
                    conversation: {
                        id: conversationId,
                    },
                },
            });

        if (!membership) {
            res.status(403).json({
                message:
                    "You are not a member of this conversation",
            });
            return;
        }

        const messages =
            await messageRepository.find({
                where: {
                    conversation: {
                        id: conversationId,
                    },
                },
                relations: {
                    sender: true,
                },
                order: {
                    createdAt: "ASC",
                },
            });

        res.status(200).json({
            messages,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch messages",
        });
    }
};


export const sendMessage = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.id;

        const conversationId = Number(
            req.params.conversationId
        );

        const { content } = req.body;

        if (!userId) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        if (!conversationId) {
            res.status(400).json({
                message: "Invalid conversation ID",
            });
            return;
        }

        if (
            !content ||
            typeof content !== "string" ||
            !content.trim()
        ) {
            res.status(400).json({
                message:
                    "Message content is required",
            });
            return;
        }

        const membership =
            await conversationMemberRepository.findOne({
                where: {
                    user: {
                        id: userId,
                    },
                    conversation: {
                        id: conversationId,
                    },
                },
            });

        if (!membership) {
            res.status(403).json({
                message:
                    "You are not a member of this conversation",
            });
            return;
        }

        const message =
            messageRepository.create({
                content: content.trim(),

                sender: {
                    id: userId,
                },

                conversation: {
                    id: conversationId,
                },
            });

        const savedMessage =
            await messageRepository.save(message);

        const completeMessage =
            await messageRepository.findOne({
                where: {
                    id: savedMessage.id,
                },
                relations: {
                    sender: true,
                },
            });

        res.status(201).json({
            message: completeMessage,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to send message",
        });
    }
};