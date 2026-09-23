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

import {
    fetchMessages,
    sendMessage,
} from "../features/messages/messageSlice";

import {
    fetchConversations,
} from "../features/conversation/conversationSlice";

import {
    setActiveConversation,
} from "../features/chat/chatSlice";


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
                ] ?? []
                : []
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

        if (activeConversationId === null) {
            return;
        }

        dispatch(
            sendMessage({
                conversationId:
                    activeConversationId,
                content,
            })
        );

    };


    return (

        <div className="flex h-screen flex-col bg-gray-50">

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