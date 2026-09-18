import { useState } from "react";

interface MessageInputProps {
    onSend: (message: string) => void;
}

function MessageInput({
    onSend,
}: MessageInputProps) {
    const [message, setMessage] = useState("");

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage) return;

        onSend(trimmedMessage);

        setMessage("");
    };

    return (
        <div className="shrink-0 border-t bg-white p-4">

            <form
                className="flex gap-3"
                onSubmit={handleSubmit}
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
                    className="rounded-xl bg-black px-6 py-3 text-white font-medium hover:bg-gray-800"
                >
                    Send
                </button>
            </form>

        </div>
    );
}

export default MessageInput;