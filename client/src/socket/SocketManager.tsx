import {useEffect} from "react"
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "@/features/chat/chatSlice";

import type { RootState } from "../app/store";
import {
    connectSocket,
    disconnectSocket,
    socket,
} from "./socket";

const SocketManager= () => {
    const accessToken = useSelector(
        (state: RootState) => state.auth.accessToken
    )

    const dispatch = useDispatch()

    useEffect(()=>{
        if(!accessToken){
            disconnectSocket()
            return
        }

        connectSocket(accessToken);
        
        return () => {
            disconnectSocket()
        }
    }, [accessToken])


    useEffect(() => {
        const handleConnect = () => {
            console.log("Socket connected:", socket.id);
        };

        const handleDisconnect = (reason: string) => {
            console.log("Socket disconnected:", reason);
        };

        const handleConnectError = (error: Error) => {
            console.log("Socket connection error :", error.message);
        };


        const handleNewMessage = (message:any) =>{
            console.log("New Message received:", message)

            dispatch(addMessage(message))
        }

        const handleSocketError = (error: { message: string }) => {
            console.error(
                "Socket error:",
                error.message
            );
        };

        socket.on("connect", handleConnect)
        socket.on("disconnect", handleDisconnect)
        socket.on("connect_error", handleConnectError)
        socket.on("new_message", handleNewMessage)
        socket.on("socket_error", handleSocketError)
        
        return () => {
            socket.off("connect", handleConnect)
            socket.off("disconnect", handleDisconnect)
            socket.off("connect_error", handleConnectError)
            socket.off("new_message", handleNewMessage)
            socket.off(
                "socket_error",
                handleSocketError
            );
        }
    }, [dispatch])
    
    return null
}

export default SocketManager