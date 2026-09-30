import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    addMessage,
    setUserOffline,
    setUserOnline,
} from "@/features/chat/chatSlice";

import type { RootState } from "../app/store";

import {
    connectSocket,
    disconnectSocket,
    socket,
} from "./socket";

const SocketManager = () => {
    const accessToken = useSelector(
        (state: RootState) => state.auth.accessToken
    );

    const activeConversationId = useSelector(
        (state: RootState) =>
            state.chat.activeConversationId
    );

    const dispatch = useDispatch();

    useEffect(() => {
        if (!accessToken) {
            disconnectSocket();
            return;
        }

        const handleConnect = () => {
            console.log("Socket connected:", socket.id);
        };

        const handleDisconnect = (reason: string) => {
            console.log(
                "Socket disconnected:",
                reason
            );
        };

        const handleConnectError = (error: Error) => {
            console.log(
                "Socket connection error:",
                error.message
            );
        };

        const handleNewMessage = (message: any) => {
            dispatch(addMessage(message));
        };

        const handleSocketError = (
            error: { message: string }
        ) => {
            console.error(
                "Socket error:",
                error.message
            );
        };

        const handleOnlineUsers = ({
            userIds,
        }: {
            userIds: number[];
        }) => {
            userIds.forEach((userId) => {
                dispatch(
                    setUserOnline(userId)
                );
            });
        };

        const handleUserOnline = (
            userId: number
        ) => {
            dispatch(
                setUserOnline(userId)
            );
        };

        const handleUserOffline = (
            userId: number
        ) => {
            dispatch(
                setUserOffline(userId)
            );
        };

        // Register listeners FIRST
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

        // Connect AFTER listeners are ready
        connectSocket(accessToken);

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

            disconnectSocket();
        };
    }, [accessToken, dispatch]);

    /*
     * Conversation room management
     */
    useEffect(() => {
        if (
            activeConversationId === null
        ) {
            return;
        }

        const joinConversation = () => {
            socket.emit(
                "join_conversation",
                activeConversationId
            );
        };

        if (socket.connected) {
            joinConversation();
        } else {
            socket.once(
                "connect",
                joinConversation
            );
        }

        return () => {
            socket.off(
                "connect",
                joinConversation
            );

            if (socket.connected) {
                socket.emit(
                    "leave_conversation",
                    activeConversationId
                );
            }
        };
    }, [activeConversationId]);

    return null;
};

export default SocketManager;