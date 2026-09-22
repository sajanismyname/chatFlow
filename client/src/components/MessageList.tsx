import { useAppSelector } from "../app/hooks";
import type { Message } from "../features/messages/messageType";

interface MessageListProps {
    messages: Message[];
}

function MessageList({
    messages,
}: MessageListProps) {

    const currentUser = useAppSelector(
        (state) => state.auth.user
    );

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {messages.map((message) => {

                const mine =
                    message.sender.id === currentUser?.id;

                return (
                    <div
                        key={message.id}
                        className={`flex ${
                            mine
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >

                        <div
                            className={`max-w-md rounded-2xl px-4 py-3 ${
                                mine
                                    ? "bg-black text-white"
                                    : "bg-white border"
                            }`}
                        >

                            <p className="text-sm">
                                {message.content}
                            </p>

                        </div>

                    </div>
                );
            })}

        </div>
    );
}

export default MessageList;