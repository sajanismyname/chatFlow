import type { Request, Response } from "express";

import { AppDataSource } from "../config/dataSource.js";
import { In } from "typeorm";
import { ConversationNickname } from "../entities/ConversationNickname.js";
import { Conversation } from "../entities/Conversation.js";
import { ConversationMember } from "../entities/ConversationMember.js";
import { User } from "../entities/User.js";
import { Message } from "../entities/Message.js";
import { MessageDeletion } from "../entities/MessageDeletion.js";


import {
    createConversationSchema,
    deleteConversationSchema,
} from "../validators/conversationValidator.js";


const userRepository =
    AppDataSource.getRepository(User);

const messageRepository =
    AppDataSource.getRepository(Message);

const conversationMemberRepository =
    AppDataSource.getRepository(ConversationMember);

const conversationNicknameRepository =
    AppDataSource.getRepository(ConversationNickname);

const messageDeletionRepository =
    AppDataSource.getRepository(MessageDeletion);

export const getConversations = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {

        const userId =
            req.user?.id;


        if (!userId) {

            res.status(401).json({
                message: "Unauthorized",
            });

            return;
        }


        const memberships =
            await AppDataSource
                .getRepository(
                    ConversationMember
                )
                .find({

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


        const conversationIds =
            memberships.map(
                (membership) =>
                    membership.conversation.id
            );


        const nicknames =
            conversationIds.length > 0
                ? await conversationNicknameRepository.find({

                    where: {
                        conversation: {
                            id: In(
                                conversationIds
                            ),
                        },
                    },

                    relations: {
                        conversation: true,
                        user: true,
                    },
                })

                : [];


        const conversations =
            await Promise.all(

                memberships.map(
                    async (membership) => {

                        const conversation =
                            membership.conversation;


                        /*
                         * Find messages that this
                         * user has deleted.
                         */
                        const deletedMessages =
                            await messageDeletionRepository.find({
                                where: {
                                    user: {
                                        id: userId,
                                    },

                                    message: {
                                        conversation: {
                                            id: conversation.id,
                                        },
                                    },
                                },

                                relations: {
                                    message: true,
                                },
                            });


                        const deletedMessageIds =
                            new Set(
                                deletedMessages.map(
                                    (deletion) =>
                                        deletion.message.id
                                )
                            );


                        /*
                         * Get messages newest first.
                         *
                         * We fetch the conversation's
                         * messages and then select the
                         * newest one visible to this user.
                         */
                        const conversationMessages =
                            await messageRepository.find({

                                where: {
                                    conversation: {
                                        id: conversation.id,
                                    },
                                },

                                relations: {
                                    sender: true,
                                    conversation: true,
                                },

                                order: {
                                    createdAt: "DESC",
                                },
                            });


                        const visibleLastMessage =
                            conversationMessages.find(
                                (message) =>
                                    !deletedMessageIds.has(
                                        message.id
                                    )
                            );


                        return {

                            ...conversation,


                            members:
                                conversation.members.map(
                                    (member) => {

                                        const nicknameRecord =
                                            nicknames.find(
                                                (nickname) =>
                                                    nickname
                                                        .conversation
                                                        .id ===
                                                    conversation.id &&
                                                    nickname.user.id ===
                                                    member.user.id
                                            );


                                        return {

                                            ...member,

                                            nickname:
                                                nicknameRecord
                                                    ?.nickname ??
                                                null,
                                        };
                                    }
                                ),


                            lastMessage:
                                visibleLastMessage
                                    ? {
                                        id:
                                            visibleLastMessage.id,

                                        content:
                                            visibleLastMessage.content,

                                        createdAt:
                                            visibleLastMessage.createdAt,

                                        sender:
                                            visibleLastMessage.sender,

                                        deletedAt:
                                            visibleLastMessage.deletedAt,

                                        deletedForEveryone:
                                            visibleLastMessage
                                                .deletedForEveryone,
                                    }

                                    : null,
                        };
                    }
                )
            );


        res.status(200).json({
            conversations,
        });


    } catch (error) {

        console.error(
            "Error fetching conversations:",
            error
        );


        res.status(500).json({
            message:
                "Failed to fetch conversations",
        });
    }
};


export const createConversation = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const currentUserId =
            req.user?.id;

        if (!currentUserId) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        const validation =
            createConversationSchema.safeParse(
                req.body
            );

        if (!validation.success) {
            res.status(400).json({
                message:
                    validation.error.issues[0]
                        ?.message ||
                    "Invalid user ID",
            });
            return;
        }

        const targetUserId =
            validation.data.userId;

        if (
            currentUserId ===
            targetUserId
        ) {
            res.status(400).json({
                message:
                    "You cannot create a conversation with yourself",
            });
            return;
        }

        const targetUser =
            await userRepository.findOne({
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

        const findExistingDirectConversation =
            async (manager: any) => {
                return await manager
                    .createQueryBuilder(
                        Conversation,
                        "conversation"
                    )
                    .innerJoinAndSelect(
                        "conversation.members",
                        "member"
                    )
                    .innerJoinAndSelect(
                        "member.user",
                        "user"
                    )
                    .where(
                        "conversation.type = :type",
                        {
                            type: "direct",
                        }
                    )
                    .andWhere(
                        (qb: any) => {
                            const subQuery =
                                qb.subQuery()
                                    .select(
                                        "m.conversation_id"
                                    )
                                    .from(
                                        ConversationMember,
                                        "m"
                                    )
                                    .where(
                                        "m.user_id IN (:...userIds)",
                                        {
                                            userIds: [
                                                currentUserId,
                                                targetUserId,
                                            ],
                                        }
                                    )
                                    .groupBy(
                                        "m.conversation_id"
                                    )
                                    .having(
                                        "COUNT(DISTINCT m.user_id) = 2"
                                    );

                            return (
                                "conversation.id IN " +
                                subQuery.getQuery()
                            );
                        }
                    )
                    .getOne();
            };

        const quickCheck =
            await findExistingDirectConversation(
                AppDataSource.manager
            );

        if (quickCheck) {
            res.status(200).json({
                conversation:
                    quickCheck,
            });
            return;
        }

        const logMinId =
            Math.min(
                currentUserId,
                targetUserId
            );

        const logMaxId =
            Math.max(
                currentUserId,
                targetUserId
            );

        const targetConversation =
            await AppDataSource.transaction(
                async (manager) => {
                    await manager.query(
                        "SELECT pg_advisory_xact_lock($1, $2)",
                        [
                            logMinId,
                            logMaxId,
                        ]
                    );

                    const deepCheck =
                        await findExistingDirectConversation(
                            manager
                        );

                    if (deepCheck) {
                        return deepCheck;
                    }

                    const newConversation =
                        manager.create(
                            Conversation,
                            {
                                type: "direct",
                            }
                        );

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

                    return (
                        (await findExistingDirectConversation(
                            manager
                        )) ||
                        savedConversation
                    );
                }
            );

        res.status(201).json({
            conversation:
                targetConversation,
        });
    } catch (error) {
        console.error(
            "Error creating conversation:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create conversation",
        });
    }
};

export const deleteConversation = async (
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
            deleteConversationSchema.safeParse({
                conversationId: req.params.conversationId,
            });

        if (!validation.success) {
            res.status(400).json({
                message: "Invalid conversation ID",
            });
            return;
        }

        const { conversationId } = validation.data;

        const result =
            await conversationMemberRepository.delete({
                user: {
                    id: userId,
                },
                conversation: {
                    id: conversationId,
                },
            });

        if (result.affected === 0) {
            res.status(404).json({
                message: "Conversation not found",
            });
            return;
        }

        res.status(200).json({
            message: "Conversation deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting conversation:", error);

        res.status(500).json({
            message: "Failed to delete conversation",
        });
    }
};