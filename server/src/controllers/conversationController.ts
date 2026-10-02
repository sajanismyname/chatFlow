import type { Request, Response } from "express";

import { AppDataSource } from "../config/dataSource.js";
import { In, Not } from "typeorm";

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


/* =========================
   GET CONVERSATIONS
========================= */

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


        /*
         * Get all conversations the current
         * user belongs to.
         */
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


        const conversationIds =
            memberships.map(
                (membership) =>
                    membership.conversation.id
            );


        /*
         * Load nicknames once.
         */
        const nicknames =
            conversationIds.length > 0
                ? await conversationNicknameRepository.find({
                    where: {
                        conversation: {
                            id: In(conversationIds),
                        },
                    },

                    relations: {
                        conversation: true,
                        user: true,
                    },
                })
                : [];


        /*
         * Build conversation response.
         */
        const conversations =
            await Promise.all(
                memberships.map(
                    async (membership) => {

                        const conversation =
                            membership.conversation;


                        /*
                         * Find messages deleted for
                         * the current user.
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
                            deletedMessages.map(
                                (deletion) =>
                                    deletion.message.id
                            );


                        /*
                         * Find the newest message that
                         * is still visible to this user.
                         *
                         * IMPORTANT:
                         *
                         * - delete-for-me is excluded
                         * - unsent is NOT excluded
                         *
                         * Therefore:
                         *
                         * normal latest message
                         *       ↓
                         * delete for me
                         *       ↓
                         * previous visible message
                         *
                         * But:
                         *
                         * normal message
                         *       ↓
                         * unsent
                         *
                         * keeps the unsent message
                         * as the latest preview.
                         */
                        const visibleMessages =
                            await messageRepository.find({
                                where: {
                                    conversation: {
                                        id: conversation.id,
                                    },
                                },

                                relations: {
                                    sender: true,
                                },

                                order: {
                                    createdAt: "DESC",
                                },

                                take: 50,
                            });


                        const lastMessage =
                            visibleMessages.find(
                                (message) =>
                                    !deletedMessageIds.includes(
                                        message.id
                                    )
                            );


                        /*
                         * Add nickname information
                         * to each conversation member.
                         */
                        const members =
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
                            );


                        /*
                         * Build last-message preview.
                         */
                        let lastMessagePreview = null;


                        if (lastMessage) {

                            lastMessagePreview = {
                                id:
                                    lastMessage.id,

                                content:
                                    lastMessage
                                        .deletedForEveryone
                                        ? ""
                                        : lastMessage.content,

                                createdAt:
                                    lastMessage.createdAt,

                                sender:
                                    lastMessage.sender,

                                deletedForEveryone:
                                    Boolean(
                                        lastMessage
                                            .deletedForEveryone
                                    ),

                                /*
                                 * The frontend can use this
                                 * directly for sidebar/search
                                 * preview rendering.
                                 */
                                preview:
                                    lastMessage
                                        .deletedForEveryone
                                        ? "This message was unsent"
                                        : lastMessage.content,
                            };
                        }


                        return {
                            ...conversation,

                            members,

                            lastMessage:
                                lastMessagePreview,
                        };
                    }
                )
            );


        /*
         * Sort conversations by the newest
         * visible message.
         *
         * Conversations without messages stay
         * below conversations with messages.
         *
         * This makes the sidebar behave like
         * Messenger/Instagram.
         */
        conversations.sort(
            (a, b) => {

                const aTime =
                    a.lastMessage
                        ? new Date(
                            a.lastMessage.createdAt
                        ).getTime()
                        : 0;

                const bTime =
                    b.lastMessage
                        ? new Date(
                            b.lastMessage.createdAt
                        ).getTime()
                        : 0;

                return bTime - aTime;
            }
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


/* =========================
   CREATE CONVERSATION
========================= */

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


        /*
         * Find an existing direct conversation
         * between exactly these two users.
         */
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


        /*
         * Fast existing-conversation check.
         */
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


        /*
         * Advisory lock prevents two simultaneous
         * requests from creating duplicate direct
         * conversations.
         */
        const lockMinId =
            Math.min(
                currentUserId,
                targetUserId
            );

        const lockMaxId =
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
                            lockMinId,
                            lockMaxId,
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


/* =========================
   DELETE CONVERSATION
========================= */

export const deleteConversation = async (
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


        const validation =
            deleteConversationSchema.safeParse({
                conversationId:
                    req.params.conversationId,
            });


        if (!validation.success) {

            res.status(400).json({
                message:
                    "Invalid conversation ID",
            });

            return;
        }


        const {
            conversationId,
        } = validation.data;


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
                message:
                    "Conversation not found",
            });

            return;
        }


        res.status(200).json({
            message:
                "Conversation deleted successfully",
        });

    } catch (error) {

        console.error(
            "Error deleting conversation:",
            error
        );

        res.status(500).json({
            message:
                "Failed to delete conversation",
        });
    }
};