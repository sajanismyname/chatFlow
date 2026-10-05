import { useEffect } from "react";

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
} from "@/features/chat/chatSlice";

import type { RootState } from "../app/store";

import type {
    Message,
} from "../features/messages/messageType";

import {
    connectSocket,
    disconnectSocket,
    socket,
} from "./socket";


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

            dispatch(
                addMessage(message)
            );
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

            disconnectSocket();
        };

    }, [
        accessToken,
        dispatch,
    ]);


    /* =========================
       CONVERSATION ROOM
    ========================= */

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


        return () => {

            if (socket.connected) {

                socket.emit(
                    "leave_conversation",
                    activeConversationId
                );
            }
        };

    }, [
        activeConversationId,
    ]);


    /*
     * When the socket connects after the
     * conversation effect ran, join the room.
     */
    useEffect(() => {

        if (
            activeConversationId === null
        ) {
            return;
        }


        const handleConnect = () => {

            socket.emit(
                "join_conversation",
                activeConversationId
            );
        };


        socket.on(
            "connect",
            handleConnect
        );


        return () => {

            socket.off(
                "connect",
                handleConnect
            );
        };

    }, [
        activeConversationId,
    ]);


    return null;
};


export default SocketManager;