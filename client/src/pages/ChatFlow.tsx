import { useState } from "react";

function ChatFlow() {
    const [message, setMessage] = useState("");

    const conversations = [
        {
            id: 1,
            name: "Alex",
            lastMessage: "See you tomorrow!",
        },
        {
            id: 2,
            name: "Sarah",
            lastMessage: "That sounds great.",
        },
        {
            id: 3,
            name: "John",
            lastMessage: "I'll send it soon.",
        },
    ];

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

    return (
        <div className="h-screen flex bg-gray-50">

            {/* ================= SIDEBAR ================= */}

            <aside className="w-80 border-r bg-white flex flex-col">

                <div className="p-5 border-b">
                    <div className="flex items-center justify-between">

                        <h1 className="text-2xl font-bold">
                            ChatFlow
                        </h1>

                        <button className="rounded-lg bg-black px-3 py-2 text-white text-sm">
                            + New
                        </button>

                    </div>

                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="mt-4 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-black"
                    />
                </div>


                <div className="flex-1 overflow-y-auto">

                    {conversations.map((conversation) => (
                        <button
                            key={conversation.id}
                            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50"
                        >

                            <div className="h-11 w-11 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                                {conversation.name[0]}
                            </div>

                            <div className="min-w-0 flex-1">

                                <p className="font-medium">
                                    {conversation.name}
                                </p>

                                <p className="text-sm text-gray-500 truncate">
                                    {conversation.lastMessage}
                                </p>

                            </div>

                        </button>
                    ))}

                </div>

            </aside>


            {/* ================= CHAT ================= */}

            <main className="flex-1 flex flex-col">

                {/* HEADER */}

                <header className="h-18 border-b bg-white px-6 flex items-center">

                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                        A
                    </div>

                    <div className="ml-3">
                        <h2 className="font-semibold">
                            Alex
                        </h2>

                        <p className="text-xs text-gray-500">
                            Online
                        </p>
                    </div>

                </header>


                {/* MESSAGES */}

                <div className="flex-1 overflow-y-auto p-6 space-y-4">

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${
                                msg.mine
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >

                            <div
                                className={`max-w-md rounded-2xl px-4 py-3 ${
                                    msg.mine
                                        ? "bg-black text-white"
                                        : "bg-white border"
                                }`}
                            >
                                <p className="text-sm">
                                    {msg.text}
                                </p>
                            </div>

                        </div>
                    ))}

                </div>


                {/* MESSAGE INPUT */}

                <div className="border-t bg-white p-4">

                    <form
                        className="flex gap-3"
                        onSubmit={(e) => {
                            e.preventDefault();

                            if (!message.trim()) return;

                            console.log(message);

                            setMessage("");
                        }}
                    >

                        <input
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            placeholder="Type a message..."
                            className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-black"
                        />

                        <button
                            type="submit"
                            className="rounded-xl bg-black px-6 py-3 text-white font-medium"
                        >
                            Send
                        </button>

                    </form>

                </div>

            </main>

        </div>
    );
}

export default ChatFlow;