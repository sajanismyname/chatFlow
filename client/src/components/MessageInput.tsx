import { useState } from "react";

interface MessageInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

function MessageInput({
    onSend,
    disabled = false,
}: MessageInputProps) {

    const [message, setMessage] = useState("");

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!message.trim()) {
            return;
        }

        onSend(message.trim());

        setMessage("");
    };

    return (
        <div className="border-t bg-white p-4">

            <form
                onSubmit={handleSubmit}
                className="flex gap-3"
            >

                <input
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                    disabled={disabled}
                    placeholder={
                        disabled
                            ? "Select a conversation..."
                            : "Type a message..."
                    }
                    className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-black disabled:bg-gray-100"
                />

                <button
                    type="submit"
                    disabled={disabled}
                    className="rounded-xl bg-black px-6 py-3 text-white font-medium disabled:opacity-50"
                >
                    Send
                </button>

            </form>

        </div>
    );
}

export default MessageInput;