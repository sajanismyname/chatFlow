import { useRef, useState } from "react";

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

    const [message, setMessage] =
        useState("");

    const [showEmojiPicker, setShowEmojiPicker] =
        useState(false);

    const fileInputRef =
        useRef<HTMLInputElement>(null);


    const emojis = [
        "😀",
        "😂",
        "😍",
        "😊",
        "👍",
        "❤️",
        "🎉",
        "🔥",
        "🙏",
        "😎",
        "🤝",
        "✨",
    ];


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
                    FILE INPUT
                ========================= */}

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    disabled={disabled}
                    onChange={(event) => {

                        const file =
                            event.target.files?.[0];

                        if (!file) {
                            return;
                        }


                        setMessage((current) =>
                            current.trim()
                                ? `${current} [${file.name}]`
                                : `[${file.name}]`
                        );


                        event.target.value = "";

                    }}
                />


                {/* =========================
                    ATTACHMENT
                ========================= */}

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full"
                    disabled={disabled}
                    onClick={() =>
                        fileInputRef
                            .current
                            ?.click()
                    }
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
                        EMOJI PICKER
                    ========================= */}

                    {showEmojiPicker &&
                        !disabled && (

                            <div
                                className="
                                    absolute
                                    bottom-12
                                    right-0
                                    z-20
                                    grid
                                    grid-cols-6
                                    gap-1
                                    rounded-xl
                                    border
                                    border-border
                                    bg-popover
                                    p-2
                                    shadow-lg
                                "
                                role="dialog"
                                aria-label="Emoji picker"
                            >

                                {emojis.map(
                                    (emoji) => (

                                        <button
                                            key={emoji}
                                            type="button"
                                            className="
                                                flex
                                                size-9
                                                items-center
                                                justify-center
                                                rounded-lg
                                                text-lg
                                                hover:bg-muted
                                            "
                                            onClick={() => {

                                                setMessage(
                                                    (current) =>
                                                        `${current}${emoji}`
                                                );

                                                setShowEmojiPicker(
                                                    false
                                                );

                                            }}
                                            aria-label={`Add ${emoji}`}
                                        >
                                            {emoji}
                                        </button>

                                    )
                                )}

                            </div>

                        )}


                    {/* =========================
                        EMOJI BUTTON
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
                        onClick={() =>
                            setShowEmojiPicker(
                                (open) => !open
                            )
                        }
                        aria-label="Add emoji"
                        aria-expanded={
                            showEmojiPicker
                        }
                    >
                        <Smile className="size-4" />
                    </Button>

                </div>


                {/* =========================
                    SEND BUTTON
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