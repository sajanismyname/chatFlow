import { AppDataSource } from "../config/dataSource.js";
import { Message } from "../entities/Message.js";
import { MessageDeletion } from "../entities/MessageDeletion.js";

const messageRepository =
    AppDataSource.getRepository(Message);

const messageDeletionRepository =
    AppDataSource.getRepository(MessageDeletion);


/* =========================
   MESSAGE RESPONSE
========================= */

const formatMessage = (
    message: Message
) => {
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
}) => {

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
    }) => {

        const message =
            await messageRepository.findOne({
                where: {
                    id: messageId,
                },

                relations: {
                    conversation: true,
                },
            });


        if (!message) {
            throw new Error(
                "Message not found"
            );
        }


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


        if (existingDeletion) {
            return message;
        }


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


        return message;
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
    }) => {

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


        if (
            message.sender.id !==
            userId
        ) {
            throw new Error(
                "You are not the sender of this message"
            );
        }


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


        return formatMessage(
            message
        );
    };