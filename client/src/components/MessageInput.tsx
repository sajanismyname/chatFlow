import { useRef, useState } from "react";

import {
    Camera,
    Paperclip,
    Send,
    Smile,
    X,
    Loader2,
} from "lucide-react";

import {
    Button,
} from "@/components/ui/button";

import {
    Input,
} from "@/components/ui/input";

import api from "@/api/axios";

interface MessageInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

interface PendingAttachment {
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
}

function MessageInput({
    onSend,
    disabled = false,
}: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const emojis = [
        "😀", "😂", "😍", "😊", "👍", "❤️",
        "🎉", "🔥", "🙏", "😎", "🤝", "✨",
    ];

    const handleFile = async (file: File) => {
        setUploadError(null);

        if (file.size > 10 * 1024 * 1024) {
            setUploadError("Files must be 10 MB or smaller.");
            return;
        }

        const reader = new FileReader();

        setUploading(true);

        reader.onload = async () => {
            try {
                if (typeof reader.result !== "string") {
                    throw new Error("Unable to read the selected file.");
                }

                const response = await api.post<PendingAttachment>("/uploads", {
                    data: reader.result,
                    fileName: file.name,
                    mimeType: file.type || "application/octet-stream",
                });

                setAttachment(response.data);
            } catch (error: any) {
                setUploadError(
                    error.response?.data?.message ||
                    "Failed to upload file."
                );
            } finally {
                setUploading(false);
            }
        };

        reader.onerror = () => {
            setUploading(false);
            setUploadError("Failed to read the selected file.");
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage && !attachment) {
            return;
        }

        if (attachment) {
            onSend(JSON.stringify({
                type: "attachment",
                text: trimmedMessage,
                ...attachment,
            }));
        } else {
            onSend(trimmedMessage);
        }

        setMessage("");
        setAttachment(null);
        setUploadError(null);
        setShowEmojiPicker(false);
    };

    return (
        <div className="shrink-0 border-t bg-background p-4">
            {uploadError && (
                <div className="mb-2 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    <span>{uploadError}</span>
                    <button
                        type="button"
                        onClick={() => setUploadError(null)}
                        aria-label="Dismiss upload error"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>
            )}

            {attachment && (
                <div className="mb-2 flex items-center gap-3 rounded-xl border bg-muted/40 px-3 py-2">
                    {attachment.mimeType.startsWith("image/") ? (
                        <img
                            src={attachment.url}
                            alt={attachment.fileName}
                            className="size-12 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                            FILE
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                            {attachment.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setAttachment(null)}
                        aria-label="Remove attachment"
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    disabled={disabled || uploading}
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                            void handleFile(file);
                        }
                        event.target.value = "";
                    }}
                />

                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    disabled={disabled || uploading}
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                            void handleFile(file);
                        }
                        event.target.value = "";
                    }}
                />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full"
                    disabled={disabled || uploading}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach file"
                >
                    <Paperclip className="size-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full"
                    disabled={disabled || uploading}
                    onClick={() => cameraInputRef.current?.click()}
                    aria-label="Take a photo"
                >
                    {uploading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Camera className="size-4" />
                    )}
                </Button>

                <div className="relative flex-1">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={disabled || uploading}
                        placeholder={
                            disabled
                                ? "Select a conversation..."
                                : attachment
                                    ? "Add a caption..."
                                    : "Type a message..."
                        }
                        className="h-11 rounded-full bg-muted/40 pr-11 focus-visible:bg-background"
                    />

                    {showEmojiPicker && !disabled && (
                        <div
                            className="absolute bottom-12 right-0 z-20 grid grid-cols-6 gap-1 rounded-xl border border-border bg-popover p-2 shadow-lg"
                            role="dialog"
                            aria-label="Emoji picker"
                        >
                            {emojis.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className="flex size-9 items-center justify-center rounded-lg text-lg hover:bg-muted"
                                    onClick={() => {
                                        setMessage((current) => `${current}${emoji}`);
                                        setShowEmojiPicker(false);
                                    }}
                                    aria-label={`Add ${emoji}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 size-9 -translate-y-1/2 rounded-full"
                        disabled={disabled || uploading}
                        onClick={() => setShowEmojiPicker((open) => !open)}
                        aria-label="Add emoji"
                        aria-expanded={showEmojiPicker}
                    >
                        <Smile className="size-4" />
                    </Button>
                </div>

                <Button
                    type="submit"
                    size="icon"
                    className="size-11 shrink-0 rounded-full"
                    disabled={
                        disabled ||
                        uploading ||
                        (!message.trim() && !attachment)
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
