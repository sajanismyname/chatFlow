import {useEffect} from "react"
import { useSelector } from "react-redux";

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

        socket.on("connect", handleConnect)
        socket.on("disconnect", handleDisconnect)
        socket.on("connect_error", handleConnectError)

        return () => {
            socket.off("connect", handleConnect)
            socket.off("disconnect", handleDisconnect)
            socket.off("connect_error", handleConnectError)
        }
    }, [])
    
    return null
}

export default SocketManager