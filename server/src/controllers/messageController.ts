import type { Request, Response } from "express";
import { LessThan } from "typeorm";

import { AppDataSource } from "../config/dataSource.js";
import { Message } from "../entities/Message.js";
import { ConversationMember } from "../entities/ConversationMember.js";
import { createMessage } from "../services/messageServices.js";

import {
    conversationIdSchema,
    sendMessageSchema,
} from "../validators/messageValidator.js";

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

        if (!userId) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        const validation =
            conversationIdSchema.safeParse(
                req.params
            );

        if (!validation.success) {
            res.status(400).json({
                message: "Invalid conversation ID",
            });
            return;
        }

        const { conversationId } =
            validation.data;

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

        const limitParam = Number(
            req.query.limit ?? 30
        );

        const limit = Math.min(
            Math.max(limitParam, 1),
            50
        );

        const beforeParam =
            req.query.before;

        const before =
            beforeParam !== undefined
                ? Number(beforeParam)
                : null;

        if (
            before !== null &&
            (!Number.isInteger(before) ||
                before <= 0)
        ) {
            res.status(400).json({
                message: "Invalid message cursor",
            });
            return;
        }

        const whereCondition: any = {
            conversation: {
                id: conversationId,
            },
        };

        if (before !== null) {
            whereCondition.id =
                LessThan(before);
        }

        const messages =
            await messageRepository.find({
                where: whereCondition,
                relations: {
                    sender: true,
                },
                order: {
                    id: "DESC",
                },
                take: limit + 1,
            });

        const hasMore =
            messages.length > limit;

        const paginatedMessages =
            hasMore
                ? messages.slice(0, limit)
                : messages;

        /*
         * Database returns newest → oldest.
         * Frontend needs oldest → newest.
         */
        paginatedMessages.reverse();

        res.status(200).json({
            messages: paginatedMessages,
            hasMore,
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

        if (!userId) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        const paramsValidation =
            conversationIdSchema.safeParse(
                req.params
            );

        if (!paramsValidation.success) {
            res.status(400).json({
                message: "Invalid conversation ID",
            });
            return;
        }

        const bodyValidation =
            sendMessageSchema.safeParse(
                req.body
            );

        if (!bodyValidation.success) {
            res.status(400).json({
                message:
                    bodyValidation.error.issues[0]
                        ?.message ||
                    "Invalid message",
            });
            return;
        }

        const {
            conversationId,
        } = paramsValidation.data;

        const {
            content,
        } = bodyValidation.data;

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

        const completeMessage =
            await createMessage({
                userId,
                conversationId,
                content,
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