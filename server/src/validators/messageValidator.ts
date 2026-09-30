import { z } from "zod";

export const conversationIdSchema = z.object({
    conversationId: z.coerce
        .number()
        .int()
        .positive(),
});

export const sendMessageSchema = z.object({
    content: z.string().trim().min(1, "Message content is required"),
});

export const replyMessageSchema = z.object({
    content: z.string().trim().min(1, "Message content is required"),
    replyToMessageId: z.coerce
        .number()
        .int()
        .positive(),
});

export const deleteMessageSchema = z.object({
    messageId: z.coerce
        .number()
        .int()
        .positive(),
});