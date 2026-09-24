import type { Request, Response } from "express";
import { AppDataSource } from "../config/dataSource.js";
import { Conversation } from "../entities/Conversation.js";
import { ConversationMember } from "../entities/ConversationMember.js";
import { User } from "../entities/User.js";

const userRepository = AppDataSource.getRepository(User);

export const getConversations = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const memberships = await AppDataSource.getRepository(ConversationMember).find({
            where: { user: { id: userId } },
            relations: {
                conversation: {
                    members: { user: true },
                },
            },
        });

        const conversations = memberships.map((membership) => membership.conversation);
        res.status(200).json({ conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Failed to fetch conversations" });
    }
};

export const createConversation = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const currentUserIdRaw = req.user?.id;
        const targetUserIdRaw = req.body.userId;

        if (!currentUserIdRaw) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!targetUserIdRaw) {
            res.status(400).json({ message: "Target user ID is required" });
            return;
        }

        const currentUserId = Number(currentUserIdRaw);
        const targetUserId = Number(targetUserIdRaw);

        if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }

        if (currentUserId === targetUserId) {
            res.status(400).json({ message: "You cannot create a conversation with yourself" });
            return;
        }

        const targetUser = await userRepository.findOne({ where: { id: targetUserId } });
        if (!targetUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        /**
         * Helper query to scan for an existing direct conversation 
         * containing exactly these two members.
         */
        const findExistingDirectConversation = async (manager: any) => {
            return await manager
                .createQueryBuilder(Conversation, "conversation")
                .innerJoinAndSelect("conversation.members", "member")
                .innerJoinAndSelect("member.user", "user")
                .where("conversation.type = :type", { type: "direct" })
                .andWhere((qb: any) => {
                    const subQuery = qb
                        .subQuery()
                        .select("m.conversation_id")
                        .from(ConversationMember, "m")
                        .where("m.user_id IN (:...userIds)", {
                            userIds: [currentUserId, targetUserId],
                        })
                        .groupBy("m.conversation_id")
                        .having("COUNT(DISTINCT m.user_id) = 2");

                    return "conversation.id IN " + subQuery.getQuery();
                })
                .getOne();
        };

        // 1. Quick initial pre-check lookup outside the lock
        const quickCheck = await findExistingDirectConversation(AppDataSource.manager);
        if (quickCheck) {
            res.status(200).json({ conversation: quickCheck });
            return;
        }

        // 2. Generate a deterministic 64-bit combination for Postgres Advisory Lock
        // pg_advisory_xact_lock accepts two 32-bit integers.
        const logMinId = Math.min(currentUserId, targetUserId);
        const logMaxId = Math.max(currentUserId, targetUserId);

        /*
         * 3. Run Transaction Block with Advisory Lock
         */
        const targetConversation = await AppDataSource.transaction(async (manager) => {
            // Obtain a transaction-scoped advisory lock for this exact pair of users.
            // If another request comes in for the same pair, it blocks until this transaction finishes.
            await manager.query(
                "SELECT pg_advisory_xact_lock($1, $2)", 
                [logMinId, logMaxId]
            );

            // Double check inside the locked state to see if the other thread just created it
            const deepCheck = await findExistingDirectConversation(manager);
            if (deepCheck) {
                return deepCheck;
            }

            // Create new conversation
            const newConversation = manager.create(Conversation, { type: "direct" });
            const savedConversation = await manager.save(newConversation);

            // Establish memberships
            const currentMember = manager.create(ConversationMember, {
                user: { id: currentUserId },
                conversation: savedConversation,
            });
            const targetMember = manager.create(ConversationMember, {
                user: { id: targetUserId },
                conversation: savedConversation,
            });

            await manager.save(ConversationMember, [currentMember, targetMember]);
            
            // Re-fetch with full relations loaded to return to client
            return await findExistingDirectConversation(manager) || savedConversation;
        });

        res.status(201).json({ conversation: targetConversation });
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ message: "Failed to create conversation" });
    }
};