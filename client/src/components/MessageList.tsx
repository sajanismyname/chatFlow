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
                                        <p className="whitespace-pre-wrap wrap-break-word">
                                            {message.content}
                                        </p>
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