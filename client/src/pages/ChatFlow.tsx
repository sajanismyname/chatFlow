import { useEffect } from "react";

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
    deleteConversation
} from "../features/conversation/conversationSlice";

import {
    setActiveConversation,
} from "../features/chat/chatSlice";

import type { Message } from "@/features/messages/messageType";

const EMPTY_MESSAGES: Message[] = [];

function ChatFlow() {
    const dispatch = useAppDispatch();

    const conversations = useAppSelector(
        (state) => state.chat.conversations
    );

    const activeConversationId =
        useAppSelector(
            (state) =>
                state.chat.activeConversationId
        );

    const messages = useAppSelector(
        (state) =>
            activeConversationId !== null
                ? state.chat.messages[
                      activeConversationId
                  ] ?? EMPTY_MESSAGES
                : EMPTY_MESSAGES
    );

    const onlineUsers = useAppSelector(
        (state) =>
            (state.chat as {
                onlineUsers?: number[];
            }).onlineUsers ?? []
    );

    const currentUser = useAppSelector(
        (state) => state.auth.user
    );

    const selectedConversationData =
        conversations.find(
            (conversation) =>
                conversation.id ===
                activeConversationId
        );

    const otherMember =
        selectedConversationData
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

    useEffect(() => {
        dispatch(
            fetchConversations()
        );
    }, [dispatch]);

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

    useEffect(() => {
        if (
            activeConversationId === null
        ) {
            return;
        }

        const previousConversationId =
            activeConversationId;

        if (socket.connected) {
            socket.emit(
                "join_conversation",
                activeConversationId
            );
        } else {
            const handleConnect = () => {
                socket.emit(
                    "join_conversation",
                    activeConversationId
                );
            };

            socket.once(
                "connect",
                handleConnect
            );

            return () => {
                socket.off(
                    "connect",
                    handleConnect
                );
            };
        }

        return () => {
            socket.emit(
                "leave_conversation",
                previousConversationId
            );
        };
    }, [activeConversationId]);

    const handleSelectConversation = (
        conversationId: number
    ) => {
        dispatch(
            setActiveConversation(
                conversationId
            )
        );
    };

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
       SIDEBAR MESSAGE PREVIEW
    ========================= */

    const getLastMessagePreview = (
        content?: string
    ) => {
        if (!content) {
            return "No messages yet";
        }

        try {
            const parsed = JSON.parse(content);

            if (
                parsed?.type === "attachment"
            ) {
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

    const handleDeleteConversation = async () => {
        if (activeConversationId === null) {
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

            socket.emit(
                "leave_conversation",
                conversationId
            );
        } catch {
            // Deletion failed.
        }
    };

    return (
        <div className="flex h-screen flex-col bg-background">
            <Navbar />

            <div className="flex min-h-0 flex-1">
                <Sidebar
                    conversations={
                        conversations.map(
                            (conversation) => ({
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
                                        : conversation.lastMessage,
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

                <main className="flex min-w-0 flex-1 flex-col">
                    {activeConversationId ===
                    null ? (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="text-center">
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

                        <ChatHeader
                            name={
                                otherUserNickname ||
                                otherUser?.name ||
                                "Select a conversation"
                            }
                            avatar={
                                otherUser?.avatar ?? null
                            }
                            online={
                                otherUserOnline
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

                            <MessageList
                                messages={
                                    messages
                                }
                                conversationId={
                                    activeConversationId
                                }
                            />

                            <MessageInput
                                onSend={
                                    handleSendMessage
                                }
                                disabled={
                                    false
                                }
                            />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default ChatFlow;