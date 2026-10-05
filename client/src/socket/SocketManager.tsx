import { useEffect, useRef } from "react";

import {
    useAppDispatch,
    useAppSelector,
} from "../app/hooks";

import {
    addMessage,
    setOnlineUsers,
    setUserOffline,
    setUserOnline,
    unsendMessage,
    deleteMessageForMe,
    setUserTyping,
    clearUserTyping,
    updateMemberNote,
} from "@/features/chat/chatSlice";

import { updateCurrentUserNote } from "@/features/auth/authSlice";

import type { RootState } from "../app/store";
import { store } from "../app/store";
import { fetchConversations } from "../features/conversation/conversationSlice";

import type {
    Message,
} from "../features/messages/messageType";

import {
    connectSocket,
    disconnectSocket,
    socket,
} from "./socket";

import { playNotificationSound } from "../utils/notificationSound";


const SocketManager = () => {

    const accessToken =
        useAppSelector(
            (state: RootState) =>
                state.auth.accessToken
        );


    const activeConversationId =
        useAppSelector(
            (state: RootState) =>
                state.chat.activeConversationId
        );

    const currentUser =
        useAppSelector(
            (state: RootState) =>
                state.auth.user
        );

    const currentUserRef = useRef(currentUser);
    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);


    const conversations =
        useAppSelector(
            (state: RootState) =>
                state.chat.conversations
        );

    const dispatch =
        useAppDispatch();


    useEffect(() => {

        if (!accessToken) {

            disconnectSocket();

            return;
        }


        const handleConnect = () => {

            console.log(
                "Socket connected:",
                socket.id
            );

            // Re-join all conversation rooms on connect / reconnect
            const currentConversations =
                store.getState().chat.conversations;
            currentConversations.forEach((conv) => {
                socket.emit("join_conversation", conv.id);
            });
        };


        const handleDisconnect = (
            reason: string
        ) => {

            console.log(
                "Socket disconnected:",
                reason
            );
        };


        const handleConnectError = (
            error: Error
        ) => {

            console.error(
                "Socket connection error:",
                error.message
            );
        };


        const handleNewMessage = (
            message: Message
        ) => {

            const isIncoming =
                !currentUserRef.current ||
                message.sender?.id !== currentUserRef.current.id;

            dispatch(
                addMessage({
                    message,
                    isIncoming,
                })
            );

            // If the conversation is not yet in the conversations list, fetch conversations
            const currentConversations =
                store.getState().chat.conversations;
            const convExists = currentConversations.some(
                (c) => c.id === message.conversationId
            );
            if (!convExists) {
                dispatch(fetchConversations());
            }

            // Play notification sound on incoming new messages
            if (isIncoming) {
                playNotificationSound();

                // If window/tab is in the background, alert user in document title
                if (typeof document !== "undefined" && document.hidden) {
                    const senderName = message.sender?.name || "User";
                    const originalTitle = document.title.replace(/^🔔\s*(\(\d+\)\s*)?/u, "");
                    document.title = `🔔 New message from ${senderName}`;

                    const handleFocus = () => {
                        document.title = originalTitle || "ChatFlow";
                        window.removeEventListener("focus", handleFocus);
                    };
                    window.addEventListener("focus", handleFocus);
                }
            }
        };


        const handleMessageUnsent = ({
            messageId,
            conversationId,
        }: {
            messageId: number;
            conversationId: number;
        }) => {

            dispatch(
                unsendMessage({
                    conversationId,
                    messageId,
                })
            );
        };


        const handleMessageDeletedForMe = ({
            messageId,
            conversationId,
        }: {
            messageId: number;
            conversationId: number;
        }) => {

            dispatch(
                deleteMessageForMe({
                    conversationId,
                    messageId,
                })
            );
        };


        const handleSocketError = (
            error: {
                message: string;
                operation?: string;
                messageId?: number;
            }
        ) => {

            console.error(
                "Socket error:",
                error
            );
        };


        /*
         * IMPORTANT:
         *
         * This event represents the complete
         * presence snapshot.
         */
        const handleOnlineUsers = ({
            userIds,
        }: {
            userIds: number[];
        }) => {

            dispatch(
                setOnlineUsers(
                    userIds
                )
            );
        };


        const handleUserOnline = (
            userId: number
        ) => {

            dispatch(
                setUserOnline(
                    userId
                )
            );
        };


        const handleUserOffline = (
            userId: number
        ) => {

            dispatch(
                setUserOffline(
                    userId
                )
            );
        };


        const handleUserTyping = ({
            conversationId,
            userId,
        }: {
            conversationId: number;
            userId: number;
        }) => {

            dispatch(
                setUserTyping({
                    conversationId,
                    userId,
                })
            );
        };


        const handleUserStopTyping = ({
            conversationId,
            userId,
        }: {
            conversationId: number;
            userId: number;
        }) => {

            dispatch(
                clearUserTyping({
                    conversationId,
                    userId,
                })
            );
        };


        const handleUserNoteUpdated = ({
            userId,
            note,
        }: {
            userId: number;
            note: string | null;
        }) => {

            dispatch(
                updateMemberNote({
                    userId,
                    note,
                })
            );

            if (currentUserRef.current?.id === userId) {
                dispatch(updateCurrentUserNote(note));
            }
        };


        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "disconnect",
            handleDisconnect
        );

        socket.on(
            "connect_error",
            handleConnectError
        );

        socket.on(
            "new_message",
            handleNewMessage
        );

        socket.on(
            "message_unsent",
            handleMessageUnsent
        );

        socket.on(
            "message_deleted_for_me",
            handleMessageDeletedForMe
        );

        socket.on(
            "socket_error",
            handleSocketError
        );

        socket.on(
            "user_online",
            handleUserOnline
        );

        socket.on(
            "user_offline",
            handleUserOffline
        );

        socket.on(
            "online_user",
            handleOnlineUsers
        );


        socket.on(
            "user_typing",
            handleUserTyping
        );


        socket.on(
            "user_stop_typing",
            handleUserStopTyping
        );

        socket.on(
            "user_note_updated",
            handleUserNoteUpdated
        );


        connectSocket(
            accessToken
        );


        return () => {

            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "disconnect",
                handleDisconnect
            );

            socket.off(
                "connect_error",
                handleConnectError
            );

            socket.off(
                "new_message",
                handleNewMessage
            );

            socket.off(
                "message_unsent",
                handleMessageUnsent
            );

            socket.off(
                "message_deleted_for_me",
                handleMessageDeletedForMe
            );

            socket.off(
                "socket_error",
                handleSocketError
            );

            socket.off(
                "user_online",
                handleUserOnline
            );

            socket.off(
                "user_offline",
                handleUserOffline
            );

            socket.off(
                "online_user",
                handleOnlineUsers
            );

            socket.off(
                "user_typing",
                handleUserTyping
            );

            socket.off(
                "user_stop_typing",
                handleUserStopTyping
            );

            socket.off(
                "user_note_updated",
                handleUserNoteUpdated
            );

            disconnectSocket();
        };

    }, [
        accessToken,
        dispatch,
    ]);


    /* =========================
       CONVERSATION ROOMS
       Keep user joined to all their conversation
       rooms so incoming messages update the sidebar live.
    ========================= */

    useEffect(() => {

        if (
            !socket.connected ||
            conversations.length === 0
        ) {
            return;
        }

        conversations.forEach((conv) => {
            socket.emit(
                "join_conversation",
                conv.id
            );
        });

    }, [
        conversations,
    ]);


    useEffect(() => {

        if (
            activeConversationId === null ||
            !socket.connected
        ) {
            return;
        }

        socket.emit(
            "join_conversation",
            activeConversationId
        );

    }, [
        activeConversationId,
    ]);


    return null;
};


export default SocketManager;