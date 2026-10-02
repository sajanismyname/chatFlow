import { AppDataSource } from "../config/dataSource.js";
import { Message } from "../entities/Message.js";
import { MessageDeletion } from "../entities/MessageDeletion.js";

const messageRepository =
    AppDataSource.getRepository(Message);

const messageDeletionRepository =
    AppDataSource.getRepository(MessageDeletion);


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
        await messageRepository.save(message);

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

    return completeMessage;
};


/* =========================
   DELETE MESSAGE FOR ME
========================= */

export const deleteMessageForMe = async ({
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
        throw new Error("Message not found");
    }


    /*
     * Delete-for-me is idempotent.
     *
     * If the user already deleted this message,
     * simply return the message instead of throwing.
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
   UNSEND MESSAGE
========================= */

export const unsendMessage = async ({
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
            "Message not found or you are not the sender"
        );
    }


    if (message.sender.id !== userId) {
        throw new Error(
            "You are not the sender of this message"
        );
    }


    /*
     * Already unsent.
     */
    if (message.deletedForEveryone) {
        return message;
    }


    message.deletedForEveryone = true;
    message.deletedAt = new Date();

    /*
     * Remove the original content from the database.
     */
    message.content = "";

    await messageRepository.save(message);

    return message;
};