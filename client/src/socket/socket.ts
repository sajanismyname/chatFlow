import {io, type Socket} from "socket.io-client"

export const socket:Socket = io("http://localhost:5000", {
    autoConnect: false
})

export const connectSocket = (accessToken: string) => { 
    socket.auth = {
        token : accessToken
    }

    if(!socket.connected){
        socket.connect();
    }
}

export const disconnectSocket = () => {
    if (socket.connected){
        socket.disconnect();
    }
}