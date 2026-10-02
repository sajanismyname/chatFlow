import {Server} from "socket.io";
import type {Server as HttpServer} from "http";
import jwt from "jsonwebtoken";

import { AppDataSource } from "../config/dataSource.js";
import { ConversationMember } from "../entities/ConversationMember.js";
import {
    createMessage,
    unsendMessage,
    deleteMessageForMe,
} from "../services/messageServices.js";

interface jwtPayLoad {
    userId: number;
}

export const initializeSocketServer = (
    httpServer: HttpServer
) => {
    const io = new Server(httpServer, {
        cors: {
            origin:
                process.env.FRONTEND_URL || "http://localhost:5173",
                credentials: true
        }
    })

    const onlineUsers = new Map<number, Set<string>>();

    io.use((socket, next) => {
        try{
            const token = socket.handshake.auth.token;

            if(!token){
                return next(
                    new Error("Authentication required")
                );
            }

            const decode = jwt.verify(
                token,
                process.env.JWT_ACCESS_SECRET!,
            ) as jwtPayLoad;

            socket.data.userId =
                        decode.userId;

            next();
        }catch{
            next (
                new Error(
                    "Invalid or expired token"
                )
            )
        }
    })


    io.on("connection", (socket)=>{

        const userId = socket.data.userId;

        let userSocket = onlineUsers.get(userId);

        if(!userSocket){
            userSocket = new Set()
            onlineUsers.set(userId, userSocket)
        }

        const wasOffline = userSocket.size === 0;

        userSocket.add(socket.id);

        // Send currently online users to the newly connected user
        socket.emit("online_user", {
            userIds: Array.from(onlineUsers.keys()),
        });

        // Tell everyone else that this user just came online
        if (wasOffline) {
            socket.broadcast.emit("user_online", userId);
        }

        socket.on("disconnect", ()=>{

            const userSocket = onlineUsers.get(userId)

            if(userSocket){
                userSocket.delete(socket.id)

                if(userSocket.size === 0){
                    onlineUsers.delete(userId)

                    io.emit(
                        "user_offline",{
                            userId
                        }
                    )
                }
            }
        })

        socket.on("join_conversation", async (conversationId:number) => {
            try {
                const member = await AppDataSource
                    .getRepository(ConversationMember)
                    .findOne({
                        where: {
                            conversation: { id: conversationId },
                            user: { id: userId},
                        },
                    })

                if(!member){
                    socket.emit("socket_error",{
                        message: "You are not a member of this convo",
                    })
                    return
                }

                const room = `conversation:${conversationId}`;

                socket.join(room);
            } catch (error) {
                console.error(
                    "Error joining convo",
                    error
                )

                socket.emit("socket_error", {
                    message: "Failed to join convo"
                })
            }
        })

        socket.on("leave_conversation", (conversationId:number) => {
            const room = `conversation:${conversationId}`;

            socket.leave(room)

        })

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

                    if(
                        !Number.isInteger(conversationId) ||
                        conversationId <= 0
                    ){
                        socket.emit("socket_error", {
                            message: "invalid conversation ID"
                        })
                        return;
                    }
                    
                    if(!content ||typeof content !== "string" || !content.trim()){
                        socket.emit("socket_error", {
                            message: "Message content is empty"
                        })
                        return;
                    }

                    const membership = await AppDataSource
                            .getRepository(ConversationMember)
                            .findOne({
                                where: {
                                    user: {id :userId},
                                    conversation: {
                                        id: conversationId
                                    }
                                }
                            })

                    if(!membership){
                        socket.emit("socket_error", {
                            message: "You are not a member of this conversation",
                        })
                        return;
                    }

                    const message = await createMessage({
                        userId,
                        conversationId,
                        content
                    })

                    if(!message){
                        socket.emit("socket_error", {
                            message: "Failed to create message"
                        })
                        return;
                    }


                    io.to(`conversation:${conversationId}`).emit(
                        "new_message",{
                            id:message.id,
                            conversationId,
                            content: message.content,
                            sender: message.sender,
                            readAt: message.readAt,
                            createdAt: message.createdAt
                        }
                    )

                } catch (error) {
                    console.error(
                        "Socket message error:",
                        error
                    );

                    socket.emit("socket_error", {
                        message: "Failed to send message",
                    });
                }
            }
        )

        socket.on(
        "unsend_message",
        async (messageId: number) => {
            try {
                if (
                    !Number.isInteger(messageId) ||
                    messageId <= 0
                ) {
                    socket.emit("socket_error", {
                        message: "Invalid message ID",
                    });
                    return;
                }

                const message = await unsendMessage({
                    messageId,
                    userId,
                });

                if (!message || !message.conversation) {
                    socket.emit("socket_error", {
                        message: "Message not found",
                        operation: "unsend",
                        messageId,
                    });
                    return;
                }

                io.to(
                    `conversation:${message.conversation.id}`
                ).emit("message_unsent", {
                    messageId: message.id,
                    conversationId:
                        message.conversation.id,
                });

            } catch (error: any) {
                console.error(
                    "Socket unsend error:",
                    error
                );

                socket.emit("socket_error", {
                    message:
                        error.message ||
                        "Failed to unsend message",
                });
            }
        }
        );

        socket.on(
            "delete_message_for_me",
            async (messageId: number) => {
                try {
                    if (
                        !Number.isInteger(messageId) ||
                        messageId <= 0
                    ) {
                        socket.emit("socket_error", {
                            message: "Invalid message ID",
                            operation: "delete_for_me",
                            messageId,
                        });
                        return;
                    }

                    const message = await deleteMessageForMe({
                        messageId,
                        userId,
                    });

                    if (!message || !message.conversation) {
                        socket.emit("socket_error", {
                            message: "Message not found",
                            operation: "delete_for_me",
                            messageId,
                        });
                        return;
                    }

                    /*
                    * Only this user's client should
                    * remove the message.
                    */
                    socket.emit(
                        "message_deleted_for_me",
                        {
                            messageId,
                            conversationId:
                                message.conversation.id,
                        }
                    );

                } catch (error: any) {
                    console.error(
                        "Socket delete-for-me error:",
                        error
                    );

                    socket.emit("socket_error", {
                        message:
                            error.message ||
                            "Failed to delete message",
                        operation: "delete_for_me",
                        messageId,
                    });
                }
            }
        );
    })

    return io
}