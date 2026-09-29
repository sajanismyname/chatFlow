import {Server} from "socket.io";
import type {Server as HttpServer} from "http";
import jwt from "jsonwebtoken";

interface jwtpayload {
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
            ) as jwtpayload;

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

        console.log(`user  ${userId} connected successfully`)

        socket.on("disconnect", (reason)=>{
            console.log(
                `socket disconnected user: ${userId}`,
                reason
            )
        })
    })

    return io
}