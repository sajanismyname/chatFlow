import type { Conversation } from "../conversation/conversationTypes";

export interface SidebarProps {
    conversations: Conversation[];
    selectedConversation: number | null;
    onSelectConversation: (id: number) => void;
    onNewChat?: () => void;
}