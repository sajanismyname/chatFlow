import { useAppSelector } from "../app/hooks";

import type {
    Message,
} from "../features/messages/messageType";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    ScrollArea,
} from "@/components/ui/scroll-area";

import { FileText, Download } from "lucide-react";


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

        <ScrollArea className="flex-1">

            <div className="flex flex-col gap-4 p-6">

                {messages.length === 0 ? (

                    /* =========================
                       EMPTY STATE
                    ========================= */

                    <div
                        className="
                            flex
                            flex-1
                            flex-col
                            items-center
                            justify-center
                            py-20
                            text-center
                        "
                    >

                        <div
                            className="
                                mb-4
                                flex
                                size-14
                                items-center
                                justify-center
                                rounded-2xl
                                bg-muted
                            "
                        >
                            <span className="text-2xl">
                                💬
                            </span>
                        </div>

                        <h3 className="text-sm font-semibold">
                            No messages yet
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Send a message to start the conversation.
                        </p>

                    </div>

                ) : (

                    messages.map((message) => {

                        const mine =
                            message.sender.id ===
                            currentUser?.id;


                        const senderName =
                            message.sender.name ||
                            "User";


                        const initials =
                            senderName
                                .split(" ")
                                .map(
                                    (word) =>
                                        word.charAt(0)
                                )
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();


                        let attachment: {
                            type: string;
                            text?: string;
                            url: string;
                            fileName: string;
                            mimeType: string;
                            size?: number;
                        } | null = null;

                        try {
                            const parsed = JSON.parse(message.content);
                            if (
                                parsed?.type === "attachment" &&
                                typeof parsed.url === "string" &&
                                typeof parsed.fileName === "string"
                            ) {
                                attachment = parsed;
                            }
                        } catch {
                            // Normal text message.
                        }

                        return (

                            <div
                                key={message.id}
                                className={`
                                    flex
                                    items-end
                                    gap-2
                                    ${
                                        mine
                                            ? "justify-end"
                                            : "justify-start"
                                    }
                                `}
                            >

                                {/* =========================
                                    OTHER USER AVATAR
                                ========================= */}

                                {!mine && (

                                    <Avatar className="size-8 shrink-0">

                                        <AvatarImage
                                            src={
                                                message.sender.avatar ??
                                                undefined
                                            }
                                            alt={
                                                senderName
                                            }
                                        />

                                        <AvatarFallback>
                                            {initials}
                                        </AvatarFallback>

                                    </Avatar>

                                )}


                                {/* =========================
                                    MESSAGE
                                ========================= */}

                                <div
                                    className={`
                                        flex
                                        max-w-[75%]
                                        flex-col
                                        ${
                                            mine
                                                ? "items-end"
                                                : "items-start"
                                        }
                                    `}
                                >

                                    <div
                                        className={`
                                            rounded-2xl
                                            px-4
                                            py-2.5
                                            text-sm
                                            shadow-sm
                                            ${
                                                mine
                                                    ? `
                                                        rounded-br-md
                                                        bg-primary
                                                        text-primary-foreground
                                                    `
                                                    : `
                                                        rounded-bl-md
                                                        border
                                                        bg-background
                                                    `
                                            }
                                        `}
                                    >
                                        {attachment ? (
                                            <div className="space-y-2">
                                                {attachment.mimeType.startsWith("image/") ? (
                                                    <a
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <img
                                                            src={attachment.url}
                                                            alt={attachment.fileName}
                                                            className="max-h-72 max-w-full rounded-xl object-cover"
                                                        />
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-3 rounded-xl border border-current/10 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                                                    >
                                                        <FileText className="size-5 shrink-0" />
                                                        <span className="min-w-0 flex-1 truncate">
                                                            {attachment.fileName}
                                                        </span>
                                                        <Download className="size-4 shrink-0" />
                                                    </a>
                                                )}

                                                {attachment.text && (
                                                    <p className="whitespace-pre-wrap wrap-break-word">
                                                        {attachment.text}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap wrap-break-word">
                                                {message.content}
                                            </p>
                                        )}
                                    </div>


                                    {/* =========================
                                        TIMESTAMP
                                    ========================= */}

                                    <span
                                        className="
                                            mt-1
                                            px-1
                                            text-[10px]
                                            text-muted-foreground
                                        "
                                    >
                                        {new Date(
                                            message.createdAt
                                        ).toLocaleTimeString(
                                            [],
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}
                                    </span>

                                </div>

                            </div>

                        );

                    })

                )}

            </div>

        </ScrollArea>

    );
}


export default MessageList;