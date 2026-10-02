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
            state.conversations =
                action.payload;
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


        removeConversation: (
            state,
            action: PayloadAction<number>
        ) => {
            const conversationId =
                action.payload;

            state.conversations =
                state.conversations.filter(
                    (conversation) =>
                        conversation.id !==
                        conversationId
                );

            delete state.messages[
                conversationId
            ];

            if (
                state.activeConversationId ===
                conversationId
            ) {
                state.activeConversationId =
                    null;
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
            const userId =
                action.payload;

            if (
                !state.onlineUsers.includes(
                    userId
                )
            ) {
                state.onlineUsers.push(
                    userId
                );
            }
        },


        setUserOffline: (
            state,
            action: PayloadAction<number>
        ) => {
            const userId =
                action.payload;

            state.onlineUsers =
                state.onlineUsers.filter(
                    (id) =>
                        id !== userId
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

        unsendMessage: (
            state,
            action: PayloadAction<{
                conversationId: number;
                messageId: number;
            }>
        ) => {
            const messages =
                state.messages[
                    action.payload.conversationId
                ];

            if (!messages) {
                return;
            }

            const message = messages.find(
                (message) =>
                    message.id ===
                    action.payload.messageId
            );

            if (message) {
                message.content =
                    "This message was unsent";

                message.unsentAt =
                    new Date().toISOString();

                message.deletedForEveryone =
                    true;
            }
        },

    deleteMessageForMe: (
        state,
        action: PayloadAction<{
            conversationId: number;
            messageId: number;
        }>
    ) => {
        const {
            conversationId,
            messageId,
        } = action.payload;

        const messages =
            state.messages[conversationId];

        if (!messages) {
            return;
        }

        state.messages[conversationId] =
            messages.filter(
                (message) =>
                    message.id !== messageId
            );
    },


        addMessage: (
            state,
            action: PayloadAction<Message>
        ) => {
            const message =
                action.payload;

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

        prependMessages: (
    state,
    action: PayloadAction<{
        conversationId: number;
        messages: Message[];
    }>
) => {
    const {
        conversationId,
        messages,
    } = action.payload;

    const existing =
        state.messages[conversationId] ?? [];

    state.messages[conversationId] = [
        ...messages,
        ...existing,
    ];
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
    removeConversation,
    setActiveConversation,
    setUserOnline,
    setUserOffline,
    setMessages,
    addMessage,
    prependMessages,
    unsendMessage,
    deleteMessageForMe,
    clearChat,
} = chatSlice.actions;


export default chatSlice.reducer;