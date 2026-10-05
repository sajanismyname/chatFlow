import { useEffect } from "react";

import {
    ArrowLeft,
} from "lucide-react";

import {
    useAppDispatch,
    useAppSelector,
} from "../app/hooks";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

import { socket } from "@/socket/socket";

import {
    fetchMessages,
} from "../features/messages/messageSlice";

import {
    fetchConversations,
    deleteConversation,
} from "../features/conversation/conversationSlice";

import {
    setActiveConversation,
} from "../features/chat/chatSlice";

import type {
    Message,
} from "@/features/messages/messageType";


const EMPTY_MESSAGES: Message[] = [];


function ChatFlow() {

    const dispatch =
        useAppDispatch();


    const conversations =
        useAppSelector(
            (state) =>
                state.chat.conversations
        );


    const activeConversationId =
        useAppSelector(
            (state) =>
                state.chat.activeConversationId
        );


    const messages =
        useAppSelector(
            (state) =>
                activeConversationId !== null
                    ? state.chat.messages[
                          activeConversationId
                      ] ?? EMPTY_MESSAGES
                    : EMPTY_MESSAGES
        );


    const onlineUsers =
        useAppSelector(
            (state) =>
                state.chat.onlineUsers
        );


    const currentUser =
        useAppSelector(
            (state) =>
                state.auth.user
        );


    const selectedConversation =
        conversations.find(
            (conversation) =>
                conversation.id ===
                activeConversationId
        );


    const otherMember =
        selectedConversation
            ?.members
            ?.find(
                (member) =>
                    member.user.id !==
                    currentUser?.id
            );


    const otherUser =
        otherMember?.user;


    const otherUserNickname =
        otherMember?.nickname ?? null;


    const otherUserOnline =
        otherUser?.id !== undefined &&
        onlineUsers.includes(
            otherUser.id
        );


    const typingUsers =
        useAppSelector(
            (state) =>
                state.chat.typingUsers
        );


    const otherUserTyping =
        otherUser?.id !== undefined &&
        activeConversationId !== null &&
        typingUsers[activeConversationId]?.includes(
            otherUser.id
        );


    /* =========================
       LOAD CONVERSATIONS
    ========================= */

    useEffect(() => {

        dispatch(
            fetchConversations()
        );

    }, [
        dispatch,
    ]);


    /* =========================
       LOAD MESSAGES
    ========================= */

    useEffect(() => {

        if (
            activeConversationId === null
        ) {
            return;
        }


        dispatch(
            fetchMessages(
                activeConversationId
            )
        );

    }, [
        activeConversationId,
        dispatch,
    ]);


    /* =========================
       SELECT CONVERSATION
    ========================= */

    const handleSelectConversation = (
        conversationId: number
    ) => {

        dispatch(
            setActiveConversation(
                conversationId
            )
        );
    };


    /* =========================
       MOBILE BACK
    ========================= */

    const handleBackToConversations = () => {

        dispatch(
            setActiveConversation(
                null
            )
        );
    };


    /* =========================
       SEND MESSAGE
    ========================= */

    const handleSendMessage = (
        content: string
    ) => {

        if (
            activeConversationId === null ||
            !content.trim()
        ) {
            return;
        }


        socket.emit(
            "send_message",
            {
                conversationId:
                    activeConversationId,

                content,
            }
        );
    };


    /* =========================
       SIDEBAR PREVIEW
    ========================= */

    const getLastMessagePreview = (
        content?: string
    ) => {

        if (!content) {
            return "No messages yet";
        }


        try {

            const parsed =
                JSON.parse(content);


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


                if (
                    typeof parsed.mimeType ===
                        "string" &&
                    parsed.mimeType.startsWith(
                        "image/"
                    )
                ) {
                    return "📎 Image";
                }


                return "📎 File";
            }

        } catch {
            // Normal text message.
        }


        return content;
    };


    /* =========================
       DELETE CONVERSATION
    ========================= */

    const handleDeleteConversation =
        async () => {

            if (
                activeConversationId === null
            ) {
                return;
            }


            const conversationId =
                activeConversationId;


            try {

                await dispatch(
                    deleteConversation(
                        conversationId
                    )
                ).unwrap();


                if (socket.connected) {

                    socket.emit(
                        "leave_conversation",
                        conversationId
                    );
                }


                dispatch(
                    setActiveConversation(
                        null
                    )
                );

            } catch {
                // Deletion failed.
            }
        };


    return (
        <div
            className="
                flex
                h-dvh
                min-h-0
                w-full
                flex-col
                overflow-hidden
                bg-background
            "
        >

            <Navbar />


            <div
                className="
                    flex
                    min-h-0
                    min-w-0
                    flex-1
                    overflow-hidden
                "
            >

                {/* =========================
                    SIDEBAR
                ========================= */}

                <div
                    className={`
                        flex
                        h-full
                        min-h-0
                        shrink-0
                        ${
                            activeConversationId !==
                            null
                                ? "hidden md:flex"
                                : "flex"
                        }
                        w-full
                        md:w-1/3
                    `}
                >

                    <Sidebar
                        conversations={
                            conversations.map(
                                (
                                    conversation
                                ) => ({

                                    ...conversation,

                                    lastMessage:
                                        conversation.lastMessage
                                            ? {
                                                    ...conversation.lastMessage,

                                                    content:
                                                        getLastMessagePreview(
                                                            conversation
                                                                .lastMessage
                                                                .content
                                                        ),
                                                }
                                            : null,
                                })
                            )
                        }

                        selectedConversation={
                            activeConversationId
                        }

                        onSelectConversation={
                            handleSelectConversation
                        }
                    />

                </div>


                {/* =========================
                    CHAT
                ========================= */}

                <main
                    className={`
                        flex
                        min-h-0
                        min-w-0
                        flex-1
                        flex-col
                        overflow-hidden
                        ${
                            activeConversationId ===
                            null
                                ? "hidden md:flex"
                                : "flex"
                        }
                    `}
                >

                    {activeConversationId ===
                    null ? (

                        <div
                            className="
                                flex
                                min-h-0
                                flex-1
                                items-center
                                justify-center
                            "
                        >

                            <div className="px-4 text-center">

                                <div className="mb-4 text-4xl">
                                    💬
                                </div>

                                <h2 className="text-lg font-semibold">
                                    Welcome to ChatFlow
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    Select a conversation
                                    to start chatting.
                                </p>

                            </div>

                        </div>

                    ) : (

                        <>

                            {/* MOBILE BACK */}

                            <div
                                className="
                                    flex
                                    shrink-0
                                    items-center
                                    gap-1
                                    border-b
                                    bg-background
                                    px-2
                                    py-1.5
                                    md:hidden
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        handleBackToConversations
                                    }
                                    className="
                                        inline-flex
                                        size-9
                                        items-center
                                        justify-center
                                        rounded-full
                                        text-muted-foreground
                                        transition-colors
                                        hover:bg-muted
                                        hover:text-foreground
                                    "
                                    aria-label="Back to conversations"
                                >

                                    <ArrowLeft className="size-5" />

                                </button>

                                <span className="text-sm font-medium">
                                    Conversations
                                </span>

                            </div>


                            {/* CHAT HEADER */}

                            <div
                                className="
                                    min-w-0
                                    shrink-0
                                    border-b
                                    bg-background
                                "
                            >

                                <ChatHeader
                                    name={
                                        otherUserNickname ||
                                        otherUser?.name ||
                                        "Select a conversation"
                                    }

                                    avatar={
                                        otherUser?.avatar ??
                                        null
                                    }

                                    online={
                                        otherUserOnline
                                    }

                                    isTyping={
                                        otherUserTyping
                                    }

                                    userId={
                                        otherUser?.id
                                    }

                                    conversationId={
                                        activeConversationId
                                    }

                                    onDeleteConversation={
                                        handleDeleteConversation
                                    }
                                />

                            </div>


                            {/* =========================
                                MESSAGE VIEWPORT

                                THIS IS THE ONLY AREA
                                THAT MAY SCROLL.
                            ========================= */}

                            <div
                                className="
                                    relative
                                    min-h-0
                                    min-w-0
                                    flex-1
                                    overflow-hidden
                                "
                            >

                                <MessageList
                                    messages={
                                        messages
                                    }
                                    conversationId={
                                        activeConversationId
                                    }
                                    isTyping={
                                        otherUserTyping
                                    }
                                />

                            </div>


                            {/* =========================
                                MESSAGE INPUT
                            ========================= */}

                            <div
                                className="
                                    min-w-0
                                    shrink-0
                                    border-t
                                    bg-background
                                "
                            >

                                <MessageInput
                                    conversationId={
                                        activeConversationId
                                    }
                                    onSend={
                                        handleSendMessage
                                    }
                                    disabled={
                                        false
                                    }
                                />

                            </div>

                        </>
                    )}

                </main>

            </div>

        </div>
    );
}


export default ChatFlow;