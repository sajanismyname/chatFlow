import { z } from "zod";

export const createConversationSchema = z.object({
    userId: z.coerce
        .number()
        .int()
        .positive(),
});

export const deleteConversationSchema = z.object({
    conversationId: z.coerce
        .number()
        .int()
        .positive(),
});