import {
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";

import type {
    Conversation,
} from "../conversation/conversationTypes";

import type {
    Message,
} from "../messages/messageType";


interface ChatState {
    conversations: Conversation[];

    messages: Record<
        number,
        Message[]
    >;

    activeConversationId:
        number | null;

    onlineUsers: number[];

    /*
     * Original sidebar position before
     * a new message moved the conversation
     * to the top.
     */
    previousConversationPositions:
        Record<number, number>;

    /*
     * Message that caused the conversation
     * to move to the top.
     */
    conversationTopMessageIds:
        Record<number, number>;
}


const initialState: ChatState = {
    conversations: [],

    messages: {},

    activeConversationId: null,

    onlineUsers: [],

    previousConversationPositions: {},

    conversationTopMessageIds: {},
};


/* =========================
   HELPERS
========================= */

const isUnsent = (
    message: Message
) => {
    return (
        message.deletedForEveryone === true ||
        message.deletedAt !== null
    );
};


/*
 * Returns the latest message currently
 * visible to this user.
 *
 * Delete-for-me messages should already
 * be removed from the local array.
 *
 * Unsent messages remain in the array
 * because they are still visible.
 */
const getLastVisibleMessage = (
    messages: Message[]
): Message | null => {

    if (messages.length === 0) {
        return null;
    }

    return (
        messages[messages.length - 1] ??
        null
    );
};


/*
 * Converts a message into the text shown
 * in the conversation sidebar.
 */
const getPreviewContent = (
    message: Message | null
): string => {

    if (!message) {
        return "";
    }

    if (isUnsent(message)) {
        return "This message was unsent";
    }

    try {

        const parsed =
            JSON.parse(message.content);

        if (
            parsed?.type ===
            "attachment"
        ) {

            if (
                typeof parsed.text ===
                    "string" &&
                parsed.text.trim()
            ) {
                return parsed.text;
            }

            if (
                typeof parsed.fileName ===
                "string"
            ) {
                return parsed.fileName;
            }

            return "Attachment";
        }

    } catch {
        /*
         * Normal text message.
         */
    }

    return message.content;
};


/*
 * Updates the sidebar preview without
 * changing the conversation position.
 */
const updateConversationPreview = (
    conversation: Conversation,
    message: Message | null
) => {

    if (!message) {
        conversation.lastMessage = null;
        return;
    }

    conversation.lastMessage = {
        ...message,

        content:
            getPreviewContent(message),
    };
};


/*
 * Moves a conversation to the top and
 * remembers where it came from.
 */
const moveConversationToTop = (
    state: ChatState,
    conversationId: number,
    messageId: number
) => {

    const index =
        state.conversations.findIndex(
            (conversation) =>
                conversation.id ===
                conversationId
        );

    if (index === -1) {
        return;
    }


    /*
     * Only store the old position when
     * the conversation actually moved.
     */
    if (index > 0) {

        state.previousConversationPositions[
            conversationId
        ] = index;

        state.conversationTopMessageIds[
            conversationId
        ] = messageId;
    }


    const conversation =
        state.conversations[index];

    if (!conversation) {
        return;
    }


    state.conversations.splice(
        index,
        1
    );

    state.conversations.unshift(
        conversation
    );
};


/*
 * Restores the conversation to the position
 * it occupied before a particular message
 * moved it to the top.
 */
const restoreConversationPosition = (
    state: ChatState,
    conversationId: number,
    messageId: number
) => {

    const topMessageId =
        state.conversationTopMessageIds[
            conversationId
        ];

    const previousPosition =
        state.previousConversationPositions[
            conversationId
        ];


    /*
     * Do not move the conversation if the
     * deleted message was not responsible
     * for moving it to the top.
     */
    if (
        topMessageId !== messageId ||
        previousPosition === undefined
    ) {
        return;
    }


    const currentIndex =
        state.conversations.findIndex(
            (conversation) =>
                conversation.id ===
                conversationId
        );

    if (currentIndex === -1) {
        return;
    }


    const [
        conversation,
    ] = state.conversations.splice(
        currentIndex,
        1
    );


    if (!conversation) {
        return;
    }


    const targetIndex =
        Math.min(
            previousPosition,
            state.conversations.length
        );


    state.conversations.splice(
        targetIndex,
        0,
        conversation
    );


    delete state.previousConversationPositions[
        conversationId
    ];

    delete state.conversationTopMessageIds[
        conversationId
    ];
};


/* =========================
   SLICE
========================= */

const chatSlice = createSlice({

    name: "chat",

    initialState,

    reducers: {

        /* =====================
           CONVERSATIONS
        ===================== */

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

            if (!exists) {

                state.conversations.unshift(
                    action.payload
                );

            } else {

                /*
                 * If the conversation already
                 * exists, update its data without
                 * moving it.
                 */
                const index =
                    state.conversations.findIndex(
                        (conversation) =>
                            conversation.id ===
                            action.payload.id
                    );

                if (index !== -1) {

                    state.conversations[index] =
                        action.payload;

                }
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

            delete state.previousConversationPositions[
                conversationId
            ];

            delete state.conversationTopMessageIds[
                conversationId
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


        /* =====================
           PRESENCE
        ===================== */

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


            state.conversations.forEach(
                (conversation) => {

                    conversation.members.forEach(
                        (member) => {

                            if (
                                member.user.id ===
                                userId
                            ) {

                                member.user.online =
                                    true;

                            }

                        }
                    );

                }
            );
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


            state.conversations.forEach(
                (conversation) => {

                    conversation.members.forEach(
                        (member) => {

                            if (
                                member.user.id ===
                                userId
                            ) {

                                member.user.online =
                                    false;

                            }

                        }
                    );

                }
            );
        },


        /* =====================
           MESSAGES
        ===================== */

        setMessages: (
            state,
            action: PayloadAction<{
                conversationId: number;
                messages: Message[];
            }>
        ) => {

            state.messages[
                action.payload.conversationId
            ] =
                action.payload.messages;
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
                state.messages[
                    conversationId
                ] ?? [];


            const existingIds =
                new Set(
                    existing.map(
                        (message) =>
                            message.id
                    )
                );


            const newMessages =
                messages.filter(
                    (message) =>
                        !existingIds.has(
                            message.id
                        )
                );


            state.messages[
                conversationId
            ] = [
                ...newMessages,
                ...existing,
            ];
        },


        /* =====================
           ADD MESSAGE
        ===================== */

        addMessage: (
            state,
            action: PayloadAction<Message>
        ) => {

            const message =
                action.payload;


            const conversationId =
                message.conversationId;


            if (
                !state.messages[
                    conversationId
                ]
            ) {

                state.messages[
                    conversationId
                ] = [];

            }


            const existingMessages =
                state.messages[
                    conversationId
                ];


            /*
             * Prevent duplicate messages.
             */
            const alreadyExists =
                existingMessages.some(
                    (existingMessage) =>
                        existingMessage.id ===
                        message.id
                );


            /*
             * IMPORTANT:
             *
             * If the socket event arrives after
             * the REST request already inserted
             * the message, do not move the
             * conversation again.
             */
            if (alreadyExists) {
                return;
            }


            existingMessages.push(
                message
            );


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
             * Update sidebar preview.
             */
            updateConversationPreview(
                conversation,
                message
            );


            /*
             * Every genuinely new message moves
             * the conversation to the top.
             */
            moveConversationToTop(
                state,
                conversationId,
                message.id
            );
        },


        /* =====================
           UNSEND
        ===================== */

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
             * Keep the message in the chat.
             */
            message.content = "";

            message.deletedForEveryone =
                true;

            message.deletedAt =
                message.deletedAt ??
                new Date().toISOString();


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
             * The unsent message remains the
             * latest message, so the conversation
             * stays at the top.
             */
            updateConversationPreview(
                conversation,
                message
            );
        },


        /* =====================
           DELETE FOR ME
        ===================== */

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


            const deletedIndex =
                messages.findIndex(
                    (message) =>
                        message.id ===
                        messageId
                );


            if (deletedIndex === -1) {
                return;
            }


            /*
             * Only the latest message can affect
             * the sidebar preview.
             */
            const wasLatestMessage =
                deletedIndex ===
                messages.length - 1;


            /*
             * Remove the message locally.
             */
            state.messages[
                conversationId
            ] =
                messages.filter(
                    (message) =>
                        message.id !==
                        messageId
                );


            const updatedMessages =
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
             * If the deleted message was not
             * the latest message, the sidebar
             * preview remains unchanged.
             */
            if (!wasLatestMessage) {
                return;
            }


            /*
             * Find the message that should now
             * appear in the sidebar.
             */
            const latestVisibleMessage =
                getLastVisibleMessage(
                    updatedMessages
                );


            updateConversationPreview(
                conversation,
                latestVisibleMessage
            );


            /*
             * If the deleted message was the
             * message that moved this conversation
             * to the top, restore its old position.
             *
             * Example:
             *
             * Before sending:
             * A
             * B
             * C
             *
             * New message in C:
             * C
             * A
             * B
             *
             * Delete that message for me:
             * A
             * B
             * C
             */
            restoreConversationPosition(
                state,
                conversationId,
                messageId
            );
        },


        /* =====================
           CLEAR
        ===================== */

        clearChat: (
            state
        ) => {

            state.conversations = [];

            state.messages = {};

            state.activeConversationId =
                null;

            state.onlineUsers = [];

            state.previousConversationPositions =
                {};

            state.conversationTopMessageIds =
                {};
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
    prependMessages,

    addMessage,
    unsendMessage,
    deleteMessageForMe,

    clearChat,
} = chatSlice.actions;


export default chatSlice.reducer;