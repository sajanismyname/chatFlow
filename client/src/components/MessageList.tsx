interface Message {
    id: number;
    sender: string;
    text: string;
    mine: boolean;
}

interface MessageListProps {
    messages: Message[];
}

function MessageList({
    messages,
}: MessageListProps) {
    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex ${
                        message.mine
                            ? "justify-end"
                            : "justify-start"
                    }`}
                >
                    <div
                        className={`max-w-md rounded-2xl px-4 py-3 ${
                            message.mine
                                ? "bg-black text-white"
                                : "bg-white border"
                        }`}
                    >
                        <p className="text-sm">
                            {message.text}
                        </p>
                    </div>
                </div>
            ))}

        </div>
    );
}

export default MessageList;