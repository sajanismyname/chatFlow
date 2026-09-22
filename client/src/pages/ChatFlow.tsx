import { useState, useEffect } from "react";
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

function ChatFlow() {
    const [selectedConversation, setSelectedConversation] =
        useState<number | null>(null);

    const dispatch = useAppDispatch();

    const messages = useAppSelector(
        (state) => state.messages.messages
    );

    const conversations = useAppSelector(
        (state) => state.conversations.conversations
    );

    const currentUser = useAppSelector(
        (state) => state.auth.user
    );

    // Find the currently selected conversation
    const selectedConversationData =
        conversations.find(
            (conversation) =>
                conversation.id === selectedConversation
        );

    // Find the other user in the conversation
    const otherUser =
    selectedConversationData?.members
        ?.filter((member) => member?.user)
        .find(
            (member) =>
                member.user.id !== currentUser?.id
        )?.user;

    useEffect(() => {
        if (!selectedConversation) {
            return;
        }

        dispatch(
            fetchMessages(selectedConversation)
        );
    }, [selectedConversation, dispatch]);

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const handleSendMessage = (
        content: string
    ) => {
        if (!selectedConversation) {
            return;
        }

        dispatch(
            sendMessage({
                conversationId: selectedConversation,
                content,
            })
        );
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">

            <Navbar />

            <div className="flex flex-1 min-h-0">

                <Sidebar
                    conversations={conversations}
                    selectedConversation={
                        selectedConversation
                    }
                    onSelectConversation={
                        setSelectedConversation
                    }
                    onNewChat={() =>
                        console.log("New chat")
                    }
                />

                <main className="flex-1 flex flex-col min-w-0">

                    <ChatHeader
                        name={otherUser?.name || "Select a conversation"}
                        avatar={otherUser?.avatar ?? null}
                        online={false}
                    />

                    <MessageList
                        messages={messages}
                    />

                    <MessageInput
                        onSend={handleSendMessage}
                        disabled={!selectedConversation}
                    />

                </main>

            </div>

        </div>
    );
}

export default ChatFlow;