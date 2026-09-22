import type { Conversation } from "../conversation/conversationTypes";

export interface User {
    id: number;
    name: string;
    email: string;
    googleId: string | null;
    avatar: string | null;
}

export interface AuthResponse {
    message: string;
    accessToken: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface userSearchProps{
    onSelectUser: (user: User) => void;
    onClose: () => void;
}

export interface SidebarProps {
    conversations: Conversation[];
    selectedConversation: number | null;
    onSelectConversation: (id: number) => void;
    onNewChat?: () => void;
}