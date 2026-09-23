import type { User } from "../auth/authTypes";

export interface ConversationMember {
    id: number;
    user: User;
}

export interface Conversation {
    id: number;
    type: "direct" | "group";
    createdAt: string;
    members: ConversationMember[];
}

export interface ConversationState {
    loading: boolean;
    error: string | null;
}

export interface ConversationItemProps {
    name: string;
    lastMessage: string;
    active?: boolean;
    onClick?: () => void;
}