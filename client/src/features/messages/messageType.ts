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
}


export interface MessageState {
    loading: boolean;

    error: string | null;

    pagination: {
        [conversationId: number]: {
            hasMore: boolean;
            loadingOlder: boolean;
        };
    };
}