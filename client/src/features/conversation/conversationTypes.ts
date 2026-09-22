export interface Conversation {
    id: number;
    name: string;
    lastMessage: string;
}

export interface ConversationState {
    conversations: Conversation[],
    loading: boolean,
    error: string | null,
}

export interface ConversationItemProps {
    name: string;
    lastMessage: string;
    active?: boolean;
    onClick?: () => void;
}