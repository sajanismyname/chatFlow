import type { User } from "../auth/authTypes";

export interface Message {
    id: number;
    content: string;
    sender: User;
    createdAt: string;
    readAt: string | null;
}

export interface MessageState {
    messages: Message[];
    loading: boolean;
    error: string | null;
}