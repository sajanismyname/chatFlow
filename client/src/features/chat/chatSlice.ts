import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Conversation {
    id: number;
    name: string;
    avatar?: string | null;
    lastMessage?: string;
    lastMessageAt?: string;
    online?: boolean;
}

export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    createdAt: string;
}

interface ChatState {
    conversations: Conversation[];
    messages: Record<number, Message[]>;
    activeConversationId: number | null;
}

const initialState: ChatState = {
    conversations: [],
    messages: {},
    activeConversationId: null,
};

const chatSlice = createSlice({
    name: "chat",

    initialState,

    reducers: {
        setConversations: (
            state,
            action: PayloadAction<Conversation[]>
        ) => {
            state.conversations = action.payload;
        },

        setActiveConversation: (
            state,
            action: PayloadAction<number>
        ) => {
            state.activeConversationId = action.payload;
        },

        setMessages: (
            state,
            action: PayloadAction<{
                conversationId: number;
                messages: Message[];
            }>
        ) => {
            state.messages[action.payload.conversationId] =
                action.payload.messages;
        },

        addMessage: (
            state,
            action: PayloadAction<Message>
        ) => {
            const message = action.payload;

            if (!state.messages[message.conversationId]) {
                state.messages[message.conversationId] = [];
            }

            state.messages[message.conversationId].push(message);
        },
    },
});

export const {
    setConversations,
    setActiveConversation,
    setMessages,
    addMessage,
} = chatSlice.actions;

export default chatSlice.reducer;