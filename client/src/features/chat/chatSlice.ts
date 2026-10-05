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

    previousConversationPositions:
        Record<number, number>;

    conversationTopMessageIds:
        Record<number, number>;

    typingUsers:
        Record<number, number[]>;
}


const initialState: ChatState = {
    conversations: [],

    messages: {},

    activeConversationId: null,

    onlineUsers: [],

    previousConversationPositions: {},

    conversationTopMessageIds: {},

    typingUsers: {},
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
            JSON.parse(
                message.content
            );


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
        // Normal text message.
    }


    return message.content;
};


const getLastMessage = (
    messages: Message[]
): Message | null => {

    if (
        messages.length === 0
    ) {
        return null;
    }


    return (
        messages[
            messages.length - 1
        ] ?? null
    );
};


const updateConversationPreview = (
    conversation: Conversation,
    message: Message | null
) => {

    if (!message) {
        conversation.lastMessage =
            null;

        return;
    }


    conversation.lastMessage = {
        ...message,
        content:
            getPreviewContent(message),
    };
};


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

        setOnlineUsers: (
            state,
            action: PayloadAction<
                number[]
            >
        ) => {

            state.onlineUsers =
                action.payload;


            state.conversations.forEach(
                (conversation) => {

                    conversation.members.forEach(
                        (member) => {

                            member.user.online =
                                action.payload.includes(
                                    member.user.id
                                );

                        }
                    );

                }
            );
        },


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


            const messages =
                state.messages[
                    conversationId
                ];


            const existing =
                messages.find(
                    (item) =>
                        item.id ===
                        message.id
                );


            if (!existing) {

                messages.push(
                    message
                );

            } else {

                Object.assign(
                    existing,
                    message
                );

            }


            const conversation =
                state.conversations.find(
                    (item) =>
                        item.id ===
                        conversationId
                );


            if (!conversation) {
                return;
            }


            updateConversationPreview(
                conversation,
                message
            );


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
             * Keep the unsent message as
             * the sidebar preview.
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


            if (
                deletedIndex === -1
            ) {
                return;
            }


            const wasLatest =
                deletedIndex ===
                messages.length - 1;


            state.messages[
                conversationId
            ] =
                messages.filter(
                    (message) =>
                        message.id !==
                        messageId
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


            if (!wasLatest) {
                return;
            }


            const remainingMessages =
                state.messages[
                    conversationId
                ] ?? [];


            const previousMessage =
                getLastMessage(
                    remainingMessages
                );


            updateConversationPreview(
                conversation,
                previousMessage
            );


            const movedByMessageId =
                state.conversationTopMessageIds[
                    conversationId
                ];


            const previousPosition =
                state.previousConversationPositions[
                    conversationId
                ];


            /*
             * Restore the conversation to
             * its original position only if
             * this exact message caused it
             * to move to the top.
             */
            if (
                movedByMessageId ===
                    messageId &&
                previousPosition !==
                    undefined
            ) {

                const currentIndex =
                    state.conversations.findIndex(
                        (item) =>
                            item.id ===
                            conversationId
                    );


                if (
                    currentIndex !== -1
                ) {

                    const [
                        conversationToMove,
                    ] =
                        state.conversations.splice(
                            currentIndex,
                            1
                        );


                    if (
                        conversationToMove
                    ) {

                        const targetIndex =
                            Math.min(
                                previousPosition,
                                state
                                    .conversations
                                    .length
                            );


                        state.conversations.splice(
                            targetIndex,
                            0,
                            conversationToMove
                        );
                    }
                }


                delete state.previousConversationPositions[
                    conversationId
                ];

                delete state.conversationTopMessageIds[
                    conversationId
                ];
            }
        },


        /* =====================
           TYPING
        ===================== */

        setUserTyping: (
            state,
            action: PayloadAction<{
                conversationId: number;
                userId: number;
            }>
        ) => {

            const {
                conversationId,
                userId: typingUserId,
            } = action.payload;


            if (
                !state.typingUsers[
                    conversationId
                ]
            ) {

                state.typingUsers[
                    conversationId
                ] = [];
            }


            if (
                !state.typingUsers[
                    conversationId
                ].includes(
                    typingUserId
                )
            ) {

                state.typingUsers[
                    conversationId
                ].push(
                    typingUserId
                );
            }
        },


        clearUserTyping: (
            state,
            action: PayloadAction<{
                conversationId: number;
                userId: number;
            }>
        ) => {

            const {
                conversationId,
                userId: typingUserId,
            } = action.payload;


            if (
                state.typingUsers[
                    conversationId
                ]
            ) {

                state.typingUsers[
                    conversationId
                ] =
                    state.typingUsers[
                        conversationId
                    ].filter(
                        (id) =>
                            id !==
                            typingUserId
                    );
            }
        },


        /* =====================
           MEMBER NOTE
        ===================== */

        updateMemberNote: (
            state,
            action: PayloadAction<{
                userId: number;
                note: string | null;
            }>
        ) => {
            const { userId, note } = action.payload;

            state.conversations.forEach((conversation) => {
                conversation.members.forEach((member) => {
                    if (member.user.id === userId) {
                        member.user.note = note;
                    }
                });
            });
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

            state.typingUsers =
                {};
        },
    },
});


export const {
    setConversations,
    addConversation,
    removeConversation,
    setActiveConversation,

    setOnlineUsers,
    setUserOnline,
    setUserOffline,

    setMessages,
    prependMessages,

    addMessage,
    unsendMessage,
    deleteMessageForMe,

    setUserTyping,
    clearUserTyping,

    updateMemberNote,

    clearChat,
} = chatSlice.actions;


export default chatSlice.reducer;