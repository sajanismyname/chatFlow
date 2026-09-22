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
    fetchConversations,
} from "../features/conversation/conversationSlice";

function ChatFlow() {
    const [selectedConversation, setSelectedConversation] = useState(1);

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const conversations = useAppSelector(
    (state) => state.conversations.conversations
);

    const messages = [
        {
            id: 1,
            sender: "Alex",
            text: "Hey! How are you?",
            mine: false,
        },
        {
            id: 2,
            sender: "You",
            text: "I'm good! How about you?",
            mine: true,
        },
        {
            id: 3,
            sender: "Alex",
            text: "Doing great. Working on ChatFlow?",
            mine: false,
        },
    ];

    const handleSendMessage = (message: string) => {
        console.log("Sending message:", message);
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
                        name="Alex"
                        online={true}
                    />

                    <MessageList
                        messages={messages}
                    />

                    <MessageInput
                        onSend={handleSendMessage}
                    />

                </main>

            </div>

        </div>
    );
}

export default ChatFlow;