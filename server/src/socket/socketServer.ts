import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

import { AppDataSource } from "../config/dataSource.js";
import { ConversationMember } from "../entities/ConversationMember.js";
import { User } from "../entities/User.js";

import {
    createMessage,
    unsendMessage,
    deleteMessageForMe,
} from "../services/messageServices.js";


interface JwtPayload {
    userId: number;
}


export const initializeSocketServer = (
    httpServer: HttpServer
) => {

    const io = new Server(
        httpServer,
        {
            cors: {
                origin:
                    process.env.FRONTEND_URL ||
                    "http://localhost:5173",

                credentials: true,
            },
        }
    );


    /*
     * userId -> socket IDs
     *
     * A user can have multiple sockets open,
     * for example multiple browser tabs.
     */
    const onlineUsers =
        new Map<number, Set<string>>();

    const userRepository =
        AppDataSource.getRepository(User);


    /* =========================
       SOCKET AUTHENTICATION
    ========================= */

    io.use((socket, next) => {

        try {

            const token =
                socket.handshake.auth.token;

            if (!token) {
                return next(
                    new Error(
                        "Authentication required"
                    )
                );
            }

            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_ACCESS_SECRET!
                ) as JwtPayload;

            socket.data.userId =
                decoded.userId;

            next();

        } catch {

            next(
                new Error(
                    "Invalid or expired token"
                )
            );
        }
    });


    /* =========================
       CONNECTION
    ========================= */

    io.on(
        "connection",
        (socket) => {

            const userId =
                socket.data.userId as number;


            /* =========================
               ONLINE USERS
            ========================= */

            let userSockets =
                onlineUsers.get(userId);

            if (!userSockets) {

                userSockets =
                    new Set<string>();

                onlineUsers.set(
                    userId,
                    userSockets
                );
            }

            const wasOffline =
                userSockets.size === 0;

            userSockets.add(
                socket.id
            );

            /*
             * Join user-specific room for real-time
             * direct events & cross-conversation updates.
             */
            socket.join(`user:${userId}`);


            /*
             * Tell the newly connected client
             * who is currently online.
             */
            socket.emit(
                "online_user",
                {
                    userIds:
                        Array.from(
                            onlineUsers.keys()
                        ),
                }
            );


            /*
             * Only broadcast online when this
             * is the user's first socket.
             */
            if (wasOffline) {

                socket.broadcast.emit(
                    "user_online",
                    {
                        userId,
                    }
                );
            }


            /* =========================
               DISCONNECT
            ========================= */

            socket.on(
                "disconnect",
                () => {

                    const currentSockets =
                        onlineUsers.get(
                            userId
                        );

                    if (!currentSockets) {
                        return;
                    }

                    currentSockets.delete(
                        socket.id
                    );


                    /*
                     * Only mark the user offline
                     * after ALL their sockets have
                     * disconnected.
                     */
                    if (
                        currentSockets.size === 0
                    ) {

                        onlineUsers.delete(
                            userId
                        );

                        io.emit(
                            "user_offline",
                            {
                                userId,
                            }
                        );
                    }
                }
            );


            /* =========================
               JOIN CONVERSATION
            ========================= */

            socket.on(
                "join_conversation",
                async (
                    conversationId: number
                ) => {

                    try {

                        if (
                            !Number.isInteger(
                                conversationId
                            ) ||
                            conversationId <= 0
                        ) {

                            socket.emit(
                                "socket_error",
                                {
                                    message:
                                        "Invalid conversation ID",
                                }
                            );

                            return;
                        }


                        const member =
                            await AppDataSource
                                .getRepository(
                                    ConversationMember
                                )
                                .findOne({
                                    where: {
                                        conversation: {
                                            id:
                                                conversationId,
                                        },

                                        user: {
                                            id:
                                                userId,
                                        },
                                    },
                                });


                        if (!member) {

                            socket.emit(
                                "socket_error",
                                {
                                    message:
                                        "You are not a member of this conversation",
                                }
                            );

                            return;
                        }


                        const room =
                            `conversation:${conversationId}`;


                        socket.join(
                            room
                        );

                    } catch (error) {

                        console.error(
                            "Error joining conversation:",
                            error
                        );

                        socket.emit(
                            "socket_error",
                            {
                                message:
                                    "Failed to join conversation",
                            }
                        );
                    }
                }
            );


            /* =========================
               LEAVE CONVERSATION
            ========================= */

            socket.on(
                "leave_conversation",
                (
                    conversationId: number
                ) => {

                    const room =
                        `conversation:${conversationId}`;

                    socket.leave(
                        room
                    );
                }
            );


            /* =========================
               TYPING INDICATORS
            ========================= */

            socket.on(
                "typing",
                (conversationId: number) => {

                    socket.to(
                        `conversation:${conversationId}`
                    ).emit(
                        "user_typing",
                        {
                            conversationId,
                            userId,
                        }
                    );
                }
            );


            socket.on(
                "stop_typing",
                (conversationId: number) => {

                    socket.to(
                        `conversation:${conversationId}`
                    ).emit(
                        "user_stop_typing",
                        {
                            conversationId,
                            userId,
                        }
                    );
                }
            );


            /* =========================
               USER NOTE
            ========================= */

            socket.on(
                "update_note",
                async (note: string | null) => {
                    try {
                        const trimmedNote =
                            typeof note === "string" && note.trim().length > 0
                                ? note.trim().slice(0, 1500)
                                : null;

                        await userRepository.update(userId, {
                            note: trimmedNote,
                        });

                        io.emit("user_note_updated", {
                            userId,
                            note: trimmedNote,
                        });
                    } catch (error) {
                        console.error("Failed to update note via socket:", error);
                    }
                }
            );


            /* =========================
               SEND MESSAGE
            ========================= */

            socket.on(
                "send_message",
                async ({
                    conversationId,
                    content,
                }: {
                    conversationId: number;
                    content: string;
                }) => {

                    try {

                        if (
                            !Number.isInteger(
                                conversationId
                            ) ||
                            conversationId <= 0
                        ) {

                            socket.emit(
                                "socket_error",
                                {
                                    message:
                                        "Invalid conversation ID",
                                }
                            );

                            return;
                        }


                        if (
                            !content ||
                            typeof content !==
                                "string" ||
                            !content.trim()
                        ) {

                            socket.emit(
                                "socket_error",
                                {
                                    message:
                                        "Message content is empty",
                                }
                            );

                            return;
                        }


                        /*
                         * Verify that the sender
                         * belongs to the conversation.
                         */
                        const membership =
                            await AppDataSource
                                .getRepository(
                                    ConversationMember
                                )
                                .findOne({
                                    where: {
                                        user: {
                                            id:
                                                userId,
                                        },

                                        conversation: {
                                            id:
                                                conversationId,
                                        },
                                    },
                                });


                        if (!membership) {

                            socket.emit(
                                "socket_error",
                                {
                                    message:
                                        "You are not a member of this conversation",
                                }
                            );

                            return;
                        }

                        const members =
                            await AppDataSource
                                .getRepository(
                                    ConversationMember
                                )
                                .find({
                                    where: {
                                        conversation: {
                                            id: conversationId,
                                        },
                                    },
                                    relations: {
                                        user: true,
                                    },
                                });

                        const otherMembers = members.filter(
                            (m) => m.user.id !== userId
                        );

                        const hasDeletedMember = otherMembers.some(
                            (m) => m.user.isDeleted || m.user.name === "Unknown User"
                        );

                        if (hasDeletedMember) {
                            socket.emit(
                                "socket_error",
                                {
                                    message:
                                        "Cannot send message. This user's account has been deleted.",
                                }
                            );

                            return;
                        }

                        const message =
                            await createMessage({
                                userId,
                                conversationId,
                                content,
                            });

                        const targetRooms: string[] = [
                            `conversation:${conversationId}`,
                            ...members.map(
                                (m) => `user:${m.user.id}`
                            ),
                        ];

                        io.to(
                            targetRooms
                        ).emit(
                            "new_message",
                            {
                                id:
                                    message.id,

                                conversationId:
                                    message.conversationId,

                                content:
                                    message.content,

                                sender:
                                    message.sender,

                                readAt:
                                    message.readAt,

                                createdAt:
                                    message.createdAt,

                                deletedAt:
                                    message.deletedAt,

                                deletedForEveryone:
                                    message.deletedForEveryone,
                            }
                        );

                    } catch (error) {

                        console.error(
                            "Socket message error:",
                            error
                        );

                        socket.emit(
                            "socket_error",
                            {
                                message:
                                    "Failed to send message",
                            }
                        );
                    }
                }
            );


            /* =========================
               UNSEND MESSAGE
            ========================= */

            socket.on(
                "unsend_message",
                async (
                    messageId: number
                ) => {

                    try {

                        if (
                            !Number.isInteger(
                                messageId
                            ) ||
                            messageId <= 0
                        ) {

                            socket.emit(
                                "socket_error",
                                {
                                    message:
                                        "Invalid message ID",
                                }
                            );

                            return;
                        }


                        const message =
                            await unsendMessage({
                                messageId,
                                userId,
                            });


                        const members =
                            await AppDataSource
                                .getRepository(
                                    ConversationMember
                                )
                                .find({
                                    where: {
                                        conversation: {
                                            id: message.conversationId,
                                        },
                                    },
                                    relations: {
                                        user: true,
                                    },
                                });

                        const targetRooms = [
                            `conversation:${message.conversationId}`,
                            ...members.map(
                                (m) => `user:${m.user.id}`
                            ),
                        ];

                        io.to(
                            targetRooms
                        ).emit(
                            "message_unsent",
                            {
                                messageId:
                                    message.id,

                                conversationId:
                                    message.conversationId,
                            }
                        );

                    } catch (error: any) {

                        console.error(
                            "Socket unsend error:",
                            error
                        );

                        socket.emit(
                            "socket_error",
                            {
                                message:
                                    error.message ||
                                    "Failed to unsend message",

                                operation:
                                    "unsend",

                                messageId,
                            }
                        );
                    }
                }
            );


            /* =========================
               DELETE MESSAGE FOR ME
            ========================= */

            socket.on(
                "delete_message_for_me",
                async (
                    messageId: number
                ) => {

                    try {

                        if (
                            !Number.isInteger(
                                messageId
                            ) ||
                            messageId <= 0
                        ) {

                            socket.emit(
                                "socket_error",
                                {
                                    message:
                                        "Invalid message ID",
                                }
                            );

                            return;
                        }


                        const message =
                            await deleteMessageForMe({
                                messageId,
                                userId,
                            });


                        /*
                         * Only this user's socket
                         * receives this event.
                         *
                         * The other participant
                         * must NOT have their message
                         * removed.
                         */
                        socket.emit(
                            "message_deleted_for_me",
                            {
                                messageId:
                                    message.id,

                                conversationId:
                                    message.conversationId,
                            }
                        );

                    } catch (error: any) {

                        console.error(
                            "Socket delete-for-me error:",
                            error
                        );

                        socket.emit(
                            "socket_error",
                            {
                                message:
                                    error.message ||
                                    "Failed to delete message",

                                operation:
                                    "delete_for_me",

                                messageId,
                            }
                        );
                    }
                }
            );
        }
    );


    return io;
};