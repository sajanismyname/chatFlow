import {
    useCallback,
    useLayoutEffect,
    useRef,
} from "react";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import type {
    Message,
} from "../features/messages/messageType";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    fetchOlderMessages,
} from "../features/messages/messageSlice";

import {
    FileText,
    Download,
} from "lucide-react";

interface MessageListProps {
    messages: Message[];
    conversationId: number;
}

function MessageList({
    messages,
    conversationId,
}: MessageListProps) {

    const dispatch = useAppDispatch();
    
    const pagination = useAppSelector(
        (state) =>
                state.messages.pagination[
                    conversationId
                ]
    )

    const hasMore = pagination?.hasMore ?? false;

    const loadingOlder = pagination?.loadingOlder ?? false;

    const previousScrollHeight =
    useRef(0);

    const previousScrollTop =
        useRef(0);
    
    const handleScroll= useCallback(
        async () => {
            const container =
                scrollRef.current;
            
            if(!container){
                return
            }

            if (
                container.scrollTop > 100 ||
                !hasMore ||
                loadingOlder ||
                messages.length === 0
            ) {
                return;
            }

            const oldestMessage = messages[0];

            if(!oldestMessage){
                return
            }

            previousScrollHeight.current =
                container.scrollHeight;

            previousScrollTop.current =
                container.scrollTop;

            await dispatch(
                fetchOlderMessages({
                    conversationId,
                    before: oldestMessage.id,
                })
            );

            requestAnimationFrame(() => {
                const newHeight =
                    container.scrollHeight;

                const scrollDifference =
                    newHeight -
                    previousScrollHeight.current;

                container.scrollTop =
                    previousScrollTop.current +
                    scrollDifference;
            })
        },
        [
            dispatch,
            conversationId,
            hasMore,
            loadingOlder,
            messages,
        ]
    );

    const currentUser = useAppSelector(
        (state) => state.auth.user
    );

    const scrollRef =
        useRef<HTMLDivElement | null>(null);

    const previousMessageCount =
        useRef(0);

    const initialLoad =
        useRef(true);

    useLayoutEffect(() => {
        const container =
            scrollRef.current;

        if (!container) {
            return;
        }

        const currentCount =
            messages.length;

        const previousCount =
            previousMessageCount.current;

        if (
            initialLoad.current &&
            currentCount > 0
        ) {
            container.scrollTop =
                container.scrollHeight;

            initialLoad.current = false;

            previousMessageCount.current =
                currentCount;

            return;
        }

        if (
            currentCount >
                previousCount &&
            container.scrollTop >
                100
        ) {
            previousMessageCount.current =
                currentCount;

            return;
        }

        if (
            currentCount >
                previousCount
        ) {
            const distanceFromBottom =
                container.scrollHeight -
                container.scrollTop -
                container.clientHeight;

            if (
                distanceFromBottom <= 100
            ) {
                container.scrollTop =
                    container.scrollHeight;
            }
        }

        previousMessageCount.current =
            currentCount;

    }, [messages]);

    return (
        <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="
                min-h-0
                flex-1
                overflow-y-auto
            "
        >
            <div className="flex flex-col gap-4 p-6">

                {messages.length === 0 ? (

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
                            const parsed =
                                JSON.parse(
                                    message.content
                                );

                            if (
                                parsed?.type ===
                                    "attachment" &&
                                typeof parsed.url ===
                                    "string" &&
                                typeof parsed.fileName ===
                                    "string"
                            ) {
                                attachment = parsed;
                            }
                        } catch {
                            // Normal text message.
                        }

                        const isImage =
                            attachment?.mimeType.startsWith(
                                "image/"
                            ) ?? false;

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

                                {!mine && (
                                    <Avatar className="size-8 shrink-0">
                                        <AvatarImage
                                            src={
                                                message
                                                    .sender
                                                    .avatar ??
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

                                    {/* IMAGE ATTACHMENT */}

                                    {attachment &&
                                    isImage ? (

                                        <a
                                            href={
                                                attachment.url
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block"
                                        >
                                            <img
                                                src={
                                                    attachment.url
                                                }
                                                alt={
                                                    attachment.fileName
                                                }
                                                className="
                                                    max-h-96
                                                    max-w-full
                                                    rounded-xl
                                                    object-contain
                                                "
                                            />
                                        </a>

                                    ) : (

                                        /* NORMAL MESSAGE / FILE */

                                        <div
                                            className={`
                                                rounded-2xl
                                                border
                                                bg-background
                                                text-foreground
                                                px-4
                                                py-2.5
                                                text-sm
                                                shadow-sm
                                                ${
                                                    mine
                                                        
                                                            ? "rounded-br-md"
                                                            : "rounded-bl-md"
                                                }
                                            `}
                                        >

                                            {attachment ? (

                                                <div className="space-y-2">

                                                    <a
                                                        href={
                                                            attachment.url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                            rounded-xl
                                                            border
                                                            border-current/10
                                                            px-3
                                                            py-2
                                                            hover:bg-black/5
                                                            dark:hover:bg-white/5
                                                        "
                                                    >
                                                        <FileText className="size-5 shrink-0" />

                                                        <span
                                                            className="
                                                                min-w-0
                                                                flex-1
                                                                truncate
                                                            "
                                                        >
                                                            {
                                                                attachment.fileName
                                                            }
                                                        </span>

                                                        <Download className="size-4 shrink-0" />
                                                    </a>

                                                    {attachment.text && (
                                                        <p className="
                                                            whitespace-pre-wrap
                                                            wrap-break-word
                                                        ">
                                                            {
                                                                attachment.text
                                                            }
                                                        </p>
                                                    )}

                                                </div>

                                            ) : (

                                                <p className="
                                                    whitespace-pre-wrap
                                                    wrap-break-word
                                                ">
                                                    {
                                                        message.content
                                                    }
                                                </p>

                                            )}

                                        </div>
                                    )}

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
        </div>
    );
}

export default MessageList;