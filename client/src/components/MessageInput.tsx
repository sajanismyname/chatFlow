import { useState } from "react";

import {
    Paperclip,
    Send,
    Smile,
} from "lucide-react";

import {
    Button,
} from "@/components/ui/button";

import {
    Input,
} from "@/components/ui/input";


interface MessageInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}


function MessageInput({
    onSend,
    disabled = false,
}: MessageInputProps) {

    const [message, setMessage] = useState("");


    /* =========================
       SEND MESSAGE
    ========================= */

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        const trimmedMessage =
            message.trim();

        if (!trimmedMessage) {
            return;
        }

        onSend(trimmedMessage);

        setMessage("");
    };


    return (

        <div
            className="
                shrink-0
                border-t
                bg-background
                p-4
            "
        >

            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2"
            >

                {/* =========================
                    ATTACHMENT
                ========================= */}

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full"
                    disabled={disabled}
                    aria-label="Attach file"
                >
                    <Paperclip className="size-4" />
                </Button>


                {/* =========================
                    MESSAGE INPUT
                ========================= */}

                <div className="relative flex-1">

                    <Input
                        value={message}
                        onChange={(e) =>
                            setMessage(
                                e.target.value
                            )
                        }
                        disabled={disabled}
                        placeholder={
                            disabled
                                ? "Select a conversation..."
                                : "Type a message..."
                        }
                        className="
                            h-11
                            rounded-full
                            bg-muted/40
                            pr-11
                            focus-visible:bg-background
                        "
                    />


                    {/* =========================
                        EMOJI
                    ========================= */}

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="
                            absolute
                            right-1
                            top-1/2
                            size-9
                            -translate-y-1/2
                            rounded-full
                        "
                        disabled={disabled}
                        aria-label="Add emoji"
                    >
                        <Smile className="size-4" />
                    </Button>

                </div>


                {/* =========================
                    SEND
                ========================= */}

                <Button
                    type="submit"
                    size="icon"
                    className="
                        size-11
                        shrink-0
                        rounded-full
                    "
                    disabled={
                        disabled ||
                        !message.trim()
                    }
                    aria-label="Send message"
                >
                    <Send className="size-4" />
                </Button>

            </form>

        </div>

    );
}


export default MessageInput;