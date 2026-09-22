import type { Request, Response } from "express";
import { AppDataSource } from "../config/dataSource.js";
import { Conversation } from "../entities/Conversation.js";
import { ConversationMember } from "../entities/ConversationMember.js";
import { User } from "../entities/User.js";

const conversationRepository =
    AppDataSource.getRepository(Conversation);

const conversationMemberRepository =
    AppDataSource.getRepository(ConversationMember);

const userRepository =
    AppDataSource.getRepository(User);


export const getConversations = async (
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

        const memberships =
            await conversationMemberRepository.find({
                where: {
                    user: {
                        id: userId,
                    },
                },
                relations: {
                    conversation: {
                        members: {
                            user: true,
                        },
                    },
                },
            });

        const conversations = memberships.map(
            (membership) => membership.conversation
        );

        res.status(200).json({
            conversations,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch conversations",
        });
    }
};


export const createConversation = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const currentUserId = req.user?.id;
        const { userId: targetUserId } = req.body;

        if (!currentUserId) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        if (!targetUserId) {
            res.status(400).json({
                message: "Target user ID is required",
            });
            return;
        }

        if (currentUserId === targetUserId) {
            res.status(400).json({
                message: "You cannot create a conversation with yourself",
            });
            return;
        }

        const targetUser = await userRepository.findOne({
            where: {
                id: targetUserId,
            },
        });

        if (!targetUser) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }

        /*
         * Check whether a direct conversation already
         * exists between these two users.
         */

        const memberships =
            await conversationMemberRepository.find({
                where: {
                    user: {
                        id: currentUserId,
                    },
                },
                relations: {
                    conversation: {
                        members: {
                            user: true,
                        },
                    },
                },
            });

        const existingConversation =
            memberships.find((membership) => {
                const conversation =
                    membership.conversation;

                if (conversation.type !== "direct") {
                    return false;
                }

                const memberIds =
                    conversation.members.map(
                        (member) => member.user.id
                    );

                return (
                    memberIds.length === 2 &&
                    memberIds.includes(currentUserId) &&
                    memberIds.includes(targetUserId)
                );
            });

        if (existingConversation) {
            res.status(200).json({
                conversation:
                    existingConversation.conversation,
            });
            return;
        }

        /*
         * Create conversation + memberships
         * inside one transaction.
         */

        const conversation =
            await AppDataSource.transaction(
                async (manager) => {
                    const newConversation =
                        manager.create(Conversation, {
                            type: "direct",
                        });

                    const savedConversation =
                        await manager.save(
                            newConversation
                        );

                    const currentMember =
                        manager.create(
                            ConversationMember,
                            {
                                user: {
                                    id: currentUserId,
                                },
                                conversation:
                                    savedConversation,
                            }
                        );

                    const targetMember =
                        manager.create(
                            ConversationMember,
                            {
                                user: {
                                    id: targetUserId,
                                },
                                conversation:
                                    savedConversation,
                            }
                        );

                    await manager.save(
                        ConversationMember,
                        [
                            currentMember,
                            targetMember,
                        ]
                    );

                    return savedConversation;
                }
            );

        res.status(201).json({
            conversation,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create conversation",
        });
    }
};