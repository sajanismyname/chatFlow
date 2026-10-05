import { AppDataSource } from "../config/dataSource.js";
import { Message } from "../entities/Message.js";
import { MessageDeletion } from "../entities/MessageDeletion.js";
import { ConversationMember } from "../entities/ConversationMember.js";

const messageRepository =
    AppDataSource.getRepository(Message);

const messageDeletionRepository =
    AppDataSource.getRepository(MessageDeletion);

const conversationMemberRepository =
    AppDataSource.getRepository(ConversationMember);


/* =========================
   MESSAGE RESPONSE TYPE
========================= */

export interface FormattedMessage {
    id: number;
    conversationId: number;
    content: string;
    sender: Message["sender"];
    readAt: Date | null;
    createdAt: Date;
    deletedAt: Date | null;
    deletedForEveryone: boolean;
}


/* =========================
   MESSAGE RESPONSE
========================= */

const formatMessage = (
    message: Message
): FormattedMessage => {

    if (!message.conversation) {
        throw new Error(
            "Message conversation was not loaded"
        );
    }

    if (!message.sender) {
        throw new Error(
            "Message sender was not loaded"
        );
    }

    return {
        id: message.id,

        conversationId:
            message.conversation.id,

        content: message.content,

        sender: message.sender,

        readAt: message.readAt,

        createdAt: message.createdAt,

        deletedAt: message.deletedAt,

        deletedForEveryone:
            message.deletedForEveryone,
    };
};


/* =========================
   CREATE MESSAGE
========================= */

export const createMessage = async ({
    userId,
    conversationId,
    content,
}: {
    userId: number;
    conversationId: number;
    content: string;
}): Promise<FormattedMessage> => {

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
        await messageRepository.save(
            message
        );

    const completeMessage =
        await messageRepository.findOne({
            where: {
                id: savedMessage.id,
            },

            relations: {
                sender: true,
                conversation: true,
            },
        });

    if (!completeMessage) {
        throw new Error(
            "Failed to load created message"
        );
    }

    return formatMessage(
        completeMessage
    );
};


/* =========================
   DELETE FOR ME
========================= */

export const deleteMessageForMe =
    async ({
        messageId,
        userId,
    }: {
        messageId: number;
        userId: number;
    }): Promise<FormattedMessage> => {

        /*
         * Load the message together with its
         * conversation and sender.
         */
        const message =
            await messageRepository.findOne({
                where: {
                    id: messageId,
                },

                relations: {
                    sender: true,
                    conversation: true,
                },
            });

        if (!message) {
            throw new Error(
                "Message not found"
            );
        }

        /*
         * Security check:
         *
         * The authenticated user must actually
         * belong to the conversation containing
         * this message.
         */
        const membership =
            await conversationMemberRepository.findOne({
                where: {
                    user: {
                        id: userId,
                    },

                    conversation: {
                        id: message.conversation.id,
                    },
                },
            });

        if (!membership) {
            throw new Error(
                "You are not a member of this conversation"
            );
        }

        /*
         * Do not create duplicate deletion rows.
         */
        const existingDeletion =
            await messageDeletionRepository.findOne({
                where: {
                    message: {
                        id: messageId,
                    },

                    user: {
                        id: userId,
                    },
                },
            });

        if (!existingDeletion) {

            const messageDeletion =
                messageDeletionRepository.create({
                    message: {
                        id: messageId,
                    },

                    user: {
                        id: userId,
                    },
                });

            await messageDeletionRepository.save(
                messageDeletion
            );
        }

        /*
         * Return the same explicit message
         * contract used everywhere else.
         */
        return formatMessage(
            message
        );
    };


/* =========================
   UNSEND
========================= */

export const unsendMessage =
    async ({
        messageId,
        userId,
    }: {
        messageId: number;
        userId: number;
    }): Promise<FormattedMessage> => {

        const message =
            await messageRepository.findOne({
                where: {
                    id: messageId,
                },

                relations: {
                    sender: true,
                    conversation: true,
                },
            });

        if (!message) {
            throw new Error(
                "Message not found"
            );
        }

        /*
         * Only the original sender can
         * unsend a message.
         */
        if (
            message.sender.id !==
            userId
        ) {
            throw new Error(
                "You are not the sender of this message"
            );
        }

        /*
         * If already unsent, simply return
         * the current formatted message.
         */
        if (
            message.deletedForEveryone
        ) {
            return formatMessage(
                message
            );
        }

        message.deletedForEveryone =
            true;

        message.deletedAt =
            new Date();

        message.content = "";

        await messageRepository.save(
            message
        );

        /*
         * Reload the saved entity so the
         * returned contract always represents
         * the database state.
         */
        const updatedMessage =
            await messageRepository.findOne({
                where: {
                    id: message.id,
                },

                relations: {
                    sender: true,
                    conversation: true,
                },
            });

        if (!updatedMessage) {
            throw new Error(
                "Failed to load unsent message"
            );
        }

        return formatMessage(
            updatedMessage
        );
    };