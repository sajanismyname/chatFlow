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
} from "../features/conversation/conversationSlice";

import {
    setActiveConversation,
} from "../features/chat/chatSlice";
import type { Message } from "@/features/messages/messageType";

const EMPTY_MESSAGES: Message[] = [];

function ChatFlow() {

    const dispatch = useAppDispatch();


    /* =========================
       CHAT STATE
    ========================= */

    const conversations = useAppSelector(
        (state) =>
            state.chat.conversations
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


    /* =========================
       AUTH
    ========================= */

    const currentUser = useAppSelector(
        (state) => state.auth.user
    );


    /* =========================
       ACTIVE CONVERSATION
    ========================= */

    const selectedConversationData =
        conversations.find(
            (conversation) =>
                conversation.id ===
                activeConversationId
        );


    /* =========================
       OTHER USER
    ========================= */

    const otherUser =
        selectedConversationData
            ?.members
            ?.filter(
                (member) => member?.user
            )
            .find(
                (member) =>
                    member.user.id !==
                    currentUser?.id
            )?.user;

        console.log(
    "HEADER OTHER USER:",
    otherUser?.id,
    otherUser?.name,
    otherUser?.online
);


    /* =========================
       FETCH CONVERSATIONS
    ========================= */

    useEffect(() => {

        dispatch(
            fetchConversations()
        );

    }, [dispatch]);


    /* =========================
       FETCH MESSAGES
    ========================= */

    useEffect(() => {

        if (activeConversationId === null) {
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

    /* room management */

    useEffect(() => {
        if(activeConversationId === null){
            return;
        }

        const previousConversationId = activeConversationId

        if(socket.connected){
            socket.emit(
                "join_conversation",
                activeConversationId
            )
        }else{
            const handleConnect = () => {
                socket.emit(
                    "join_conversation",
                    activeConversationId
                )
            }

            socket.once("connect", handleConnect)

            return () =>{
                socket.off(
                    "connect",
                    handleConnect
                )
            }
        }

        return () =>{
            socket.emit(
                "leave_conversation",
                previousConversationId
            )
        }
    },[activeConversationId])

    /* =========================
       SELECT CONVERSATION
    ========================= */

    const handleSelectConversation = (
        conversationId: number
    ) => {

        dispatch(
            setActiveConversation(
                conversationId
            )
        );

    };


    /* =========================
       SEND MESSAGE
    ========================= */

    const handleSendMessage = (
        content: string
    ) => {

        if (activeConversationId === null || !content.trim()) {
            return;
        }

        socket.emit(
            "send_message",
            {
                conversationId: activeConversationId,
                content,
            }
        )
    };


    return (

        <div className="flex h-screen flex-col bg-background">

            <Navbar />

            <div className="flex min-h-0 flex-1">

                <Sidebar
                    conversations={
                        conversations
                    }

                    selectedConversation={
                        activeConversationId
                    }

                    onSelectConversation={
                        handleSelectConversation
                    }

                    onNewChat={() =>
                        console.log(
                            "New chat"
                        )
                    }
                />

<main className="flex min-w-0 flex-1 flex-col">

    {activeConversationId === null ? (

        <div className="flex flex-1 items-center justify-center">
            <div className="text-center">

                <div className="mb-4 text-4xl">
                    💬
                </div>

                <h2 className="text-lg font-semibold">
                    Welcome to ChatFlow
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    Select a conversation to start chatting.
                </p>

            </div>
        </div>

    ) : (

        <>
            <ChatHeader
                name={
                    otherUser?.name ||
                    "Select a conversation"
                }

                avatar={
                    otherUser?.avatar ??
                    null
                }

                online={
                    otherUser?.online ??
                    false
                }
            />

            <MessageList
                messages={messages}
            />

            <MessageInput
                onSend={handleSendMessage}
                disabled={false}
            />
        </>

    )}

</main>

            </div>

        </div>
    );
}


export default ChatFlow;