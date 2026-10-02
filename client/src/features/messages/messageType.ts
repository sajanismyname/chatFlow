import type { User } from "../auth/authTypes";

export interface Message {
    id: number;
    conversationId: number;
    content: string;
    sender: User;
    readAt: string | null;
    createdAt: string;

    deletedAt: string | null;
    deletedForEveryone: boolean;
    unsentAt: string | null;
}

export interface MessageState {
    loading: boolean;
    error: string | null;

    pagination: Record<
        number,
        {
            hasMore: boolean;
            loadingOlder: boolean;
        }
    >;
}