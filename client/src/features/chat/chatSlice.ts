import {
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";

import type {
    Message,
} from "../messages/messageType";

import type {
    Conversation,
} from "../conversation/conversationTypes";


interface ChatState {

    conversations: Conversation[];

    messages: Record<
        number,
        Message[]
    >;

    activeConversationId:
        number | null;

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
            action: PayloadAction<
                Conversation[]
            >
        ) => {

            state.conversations =
                action.payload;
        },


        addConversation: (
            state,
            action: PayloadAction<
                Conversation
            >
        ) => {

            const exists =
                state.conversations.some(
                    (conversation) =>
                        conversation.id ===
                        action.payload.id
                );


            if (exists) {

                const index =
                    state.conversations.findIndex(
                        (conversation) =>
                            conversation.id ===
                            action.payload.id
                    );

                state.conversations[index] =
                    action.payload;

                return;
            }


            state.conversations.unshift(
                action.payload
            );
        },


        removeConversation: (
            state,
            action: PayloadAction<number>
        ) => {

            state.conversations =
                state.conversations.filter(
                    (conversation) =>
                        conversation.id !==
                        action.payload
                );


            delete state.messages[
                action.payload
            ];
        },


        setActiveConversation: (
            state,
            action: PayloadAction<
                number | null
            >
        ) => {

            state.activeConversationId =
                action.payload;
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


        prependMessages: (
            state,
            action: PayloadAction<{
                conversationId: number;
                messages: Message[];
            }>
        ) => {

            const existing =
                state.messages[
                    action.payload
                        .conversationId
                ] ?? [];


            const existingIds =
                new Set(
                    existing.map(
                        (message) =>
                            message.id
                    )
                );


            const newMessages =
                action.payload.messages.filter(
                    (message) =>
                        !existingIds.has(
                            message.id
                        )
                );


            state.messages[
                action.payload
                    .conversationId
            ] = [
                ...newMessages,
                ...existing,
            ];
        },


        addMessage: (
            state,
            action: PayloadAction<Message>
        ) => {

            const message =
                action.payload;

            const conversationId =
                message.conversationId;


            const messages =
                state.messages[
                    conversationId
                ] ?? [];


            /*
             * Prevent duplicate messages.
             */
            if (
                messages.some(
                    (existing) =>
                        existing.id ===
                        message.id
                )
            ) {
                return;
            }


            messages.push(message);


            state.messages[
                conversationId
            ] = messages;


            /*
             * Keep sidebar preview
             * synchronized with new messages.
             */
            const conversation =
                state.conversations.find(
                    (item) =>
                        item.id ===
                        conversationId
                );


            if (conversation) {

                conversation.lastMessage =
                    message;
            }
        },


        /* =========================
           UNSEND
        ========================= */

        unsendMessage: (
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
                state.messages[
                    conversationId
                ];


            if (!messages) {
                return;
            }


            const message =
                messages.find(
                    (item) =>
                        item.id ===
                        messageId
                );


            if (!message) {
                return;
            }


            /*
             * Keep the message in the
             * conversation.
             */
            message.content = "";

            message.deletedForEveryone =
                true;

            message.unsentAt =
                message.unsentAt ??
                new Date().toISOString();


            /*
             * If this was the newest message,
             * update the sidebar preview.
             */
            const conversation =
                state.conversations.find(
                    (item) =>
                        item.id ===
                        conversationId
                );


            if (
                conversation &&
                conversation.lastMessage?.id ===
                    messageId
            ) {

                conversation.lastMessage =
                    message;
            }
        },


        /* =========================
           DELETE FOR ME
        ========================= */

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
                state.messages[
                    conversationId
                ];


            if (!messages) {
                return;
            }


            /*
             * Remove the message only
             * from this user's Redux state.
             */
            state.messages[
                conversationId
            ] = messages.filter(
                (message) =>
                    message.id !==
                    messageId
            );


            /*
             * Find the new newest message.
             */
            const remainingMessages =
                state.messages[
                    conversationId
                ];


            const conversation =
                state.conversations.find(
                    (item) =>
                        item.id ===
                        conversationId
                );


            if (!conversation) {
                return;
            }


            /*
             * Only update the sidebar if
             * the deleted message was the
             * current sidebar preview.
             */
            if (
                conversation.lastMessage?.id ===
                messageId
            ) {

                const previousMessage =
                    remainingMessages[
                        remainingMessages.length - 1
                    ];


                conversation.lastMessage =
                    previousMessage ?? null;
            }
        },


        /* =========================
           ONLINE USERS
        ========================= */

        setUserOnline: (
            state,
            action: PayloadAction<number>
        ) => {

            if (
                !state.onlineUsers.includes(
                    action.payload
                )
            ) {

                state.onlineUsers.push(
                    action.payload
                );
            }
        },


        setUserOffline: (
            state,
            action: PayloadAction<number>
        ) => {

            state.onlineUsers =
                state.onlineUsers.filter(
                    (id) =>
                        id !== action.payload
                );
        },
    },
});


export const {
    setConversations,
    addConversation,
    removeConversation,
    setActiveConversation,

    setMessages,
    prependMessages,
    addMessage,

    unsendMessage,
    deleteMessageForMe,

    setUserOnline,
    setUserOffline,
} = chatSlice.actions;


export default chatSlice.reducer;