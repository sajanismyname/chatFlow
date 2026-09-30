import {
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";

import type { Conversation } from "../conversation/conversationTypes";
import type { Message } from "../messages/messageType";

interface ChatState {
    conversations: Conversation[];
    messages: Record<number, Message[]>;
    activeConversationId: number | null;
    onlineUsers: number[];
}

const initialState: ChatState = {
    conversations: [],
    messages: {},
    activeConversationId: null,
    onlineUsers: [],
};

const chatSlice = createSlice({
    name: "chat",

    initialState,

    reducers: {
        /* =========================
           CONVERSATIONS
        ========================= */

        setConversations: (
            state,
            action: PayloadAction<Conversation[]>
        ) => {
            state.conversations = action.payload;
        },

        addConversation: (
            state,
            action: PayloadAction<Conversation>
        ) => {
            const exists =
                state.conversations.some(
                    (conversation) =>
                        conversation.id ===
                        action.payload.id
                );

            if (!exists) {
                state.conversations.push(
                    action.payload
                );
            }
        },

        /* =========================
           ACTIVE CONVERSATION
        ========================= */

        setActiveConversation: (
            state,
            action: PayloadAction<number | null>
        ) => {
            state.activeConversationId =
                action.payload;
        },

        /* =========================
           ONLINE USERS
        ========================= */

        setUserOnline: (
            state,
            action: PayloadAction<number>
        ) => {
            const userId = action.payload;

            if (
                !state.onlineUsers.includes(
                    userId
                )
            ) {
                state.onlineUsers.push(userId);
            }
        },

        setUserOffline: (
            state,
            action: PayloadAction<number>
        ) => {
            const userId = action.payload;

            state.onlineUsers =
                state.onlineUsers.filter(
                    (id) => id !== userId
                );
        },

        /* =========================
           MESSAGES
        ========================= */

        setMessages: (
            state,
            action: PayloadAction<{
                conversationId: number;
                messages: Message[];
            }>
        ) => {
            state.messages[
                action.payload.conversationId
            ] = action.payload.messages;
        },

        addMessage: (
            state,
            action: PayloadAction<Message>
        ) => {
            const message = action.payload;

            if (
                !state.messages[
                    message.conversationId
                ]
            ) {
                state.messages[
                    message.conversationId
                ] = [];
            }

            state.messages[
                message.conversationId
            ].push(message);

            const conversation =
                state.conversations.find(
                    (conversation) =>
                        conversation.id ===
                        message.conversationId
                );

            if (conversation) {
                conversation.lastMessage = {
                    id: message.id,
                    content: message.content,
                    createdAt:
                        message.createdAt,
                    sender: message.sender,
                };
            }
        },

        /* =========================
           CLEAR
        ========================= */

        clearChat: (state) => {
            state.conversations = [];
            state.messages = {};
            state.activeConversationId = null;
            state.onlineUsers = [];
        },
    },
});

export const {
    setConversations,
    addConversation,
    setActiveConversation,
    setUserOnline,
    setUserOffline,
    setMessages,
    addMessage,
    clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;