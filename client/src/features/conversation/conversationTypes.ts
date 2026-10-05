import type { User } from "../auth/authTypes";

export interface ConversationMember {
    id: number;
    user: User;
    nickname: string | null;
}

export interface ConversationLastMessage {
    id: number;
    content: string;
    createdAt: string;
    sender: User;
}

export interface Conversation {
    id: number;
    type: "direct" | "group";
    createdAt: string;
    members: ConversationMember[];
    lastMessage: ConversationLastMessage | null;
}

export interface ConversationState {
    loading: boolean;
    error: string | null;
}

export interface ConversationItemProps {
    name: string;
    lastMessage: string;
    active?: boolean;
    online?: boolean;
    avatar?: string | null;
    isTyping?: boolean;
    lastMessageDate?: string | null;
    unreadCount?: number;
    isNewlyArrived?: boolean;
    onClick?: () => void;
}