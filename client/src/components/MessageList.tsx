import {
    useCallback,
    useLayoutEffect,
    useRef,
} from "react";

import {
    useAppDispatch,
    useAppSelector,
} from "../app/hooks";

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

    const currentUser = useAppSelector(
        (state) => state.auth.user
    );

    const pagination = useAppSelector(
        (state) =>
            state.messages.pagination[
                conversationId
            ]
    );

    const hasMore =
        pagination?.hasMore ?? false;

    const loadingOlder =
        pagination?.loadingOlder ?? false;


    const scrollRef =
        useRef<HTMLDivElement | null>(null);


    /*
     * Used to determine whether the user
     * is currently near the bottom.
     */
    const wasNearBottom =
        useRef(true);


    /*
     * Tracks the previous number of messages.
     */
    const previousMessageCount =
        useRef(0);


    /*
     * Tracks the previous newest message.
     */
    const previousNewestMessageId =
        useRef<number | null>(null);


    /*
     * Used when switching conversations.
     */
    const previousConversationId =
        useRef<number | null>(null);


    /*
     * Used for the first load of a conversation.
     */
    const initialLoad =
        useRef(true);


    /*
     * Used when older messages are prepended.
     */
    const preserveScrollPosition =
        useRef(false);

    const previousScrollHeight =
        useRef(0);

    const previousScrollTop =
        useRef(0);


    /* =========================
       RESET ON CONVERSATION CHANGE
    ========================= */

    useLayoutEffect(() => {

        if (
            previousConversationId.current !==
            conversationId
        ) {

            previousConversationId.current =
                conversationId;

            previousMessageCount.current =
                0;

            previousNewestMessageId.current =
                null;

            initialLoad.current =
                true;

            preserveScrollPosition.current =
                false;

            wasNearBottom.current =
                true;
        }

    }, [conversationId]);


    /* =========================
       LOAD OLDER MESSAGES
    ========================= */

    const handleScroll =
        useCallback(async () => {

            const container =
                scrollRef.current;

            if (!container) {
                return;
            }


            const distanceFromBottom =
                container.scrollHeight -
                container.scrollTop -
                container.clientHeight;


            /*
             * Always remember whether the user
             * is near the bottom.
             */
            wasNearBottom.current =
                distanceFromBottom <= 100;


            /*
             * Only load older messages when
             * the user reaches the top.
             */
            if (
                container.scrollTop > 100 ||
                !hasMore ||
                loadingOlder ||
                messages.length === 0
            ) {
                return;
            }


            const oldestMessage =
                messages[0];

            if (!oldestMessage) {
                return;
            }


            /*
             * Save the current viewport before
             * older messages are added.
             */
            previousScrollHeight.current =
                container.scrollHeight;

            previousScrollTop.current =
                container.scrollTop;

            preserveScrollPosition.current =
                true;


            await dispatch(
                fetchOlderMessages({
                    conversationId,
                    before: oldestMessage.id,
                })
            );

        }, [
            conversationId,
            dispatch,
            hasMore,
            loadingOlder,
            messages,
        ]);


    /* =========================
       HANDLE MESSAGE CHANGES
    ========================= */

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


        const newestMessage =
            messages[messages.length - 1];

        const newestMessageId =
            newestMessage?.id ?? null;


        /*
         * INITIAL LOAD
         *
         * Always show the latest message.
         */
        if (
            initialLoad.current &&
            currentCount > 0
        ) {

            requestAnimationFrame(() => {

                container.scrollTop =
                    container.scrollHeight;

            });

            initialLoad.current =
                false;

            previousMessageCount.current =
                currentCount;

            previousNewestMessageId.current =
                newestMessageId;

            wasNearBottom.current =
                true;

            return;
        }


        /*
         * OLDER MESSAGES WERE LOADED
         *
         * Older messages are inserted at
         * the beginning, so preserve the
         * user's exact viewport.
         */
        if (
            preserveScrollPosition.current &&
            currentCount > previousCount
        ) {

            const newScrollHeight =
                container.scrollHeight;

            const heightDifference =
                newScrollHeight -
                previousScrollHeight.current;


            requestAnimationFrame(() => {

                container.scrollTop =
                    previousScrollTop.current +
                    heightDifference;

            });


            preserveScrollPosition.current =
                false;

            previousMessageCount.current =
                currentCount;

            previousNewestMessageId.current =
                newestMessageId;

            return;
        }


        /*
         * NEW MESSAGE / NEW ATTACHMENT
         *
         * The newest message ID changed.
         */
        const receivedNewMessage =
            newestMessageId !== null &&
            newestMessageId !==
                previousNewestMessageId.current;


        if (
            receivedNewMessage &&
            currentCount >= previousCount
        ) {

            /*
             * Only move to the bottom if the
             * user was already near the bottom.
             */
            if (wasNearBottom.current) {

                requestAnimationFrame(() => {

                    container.scrollTop =
                        container.scrollHeight;

                });

            }

            previousMessageCount.current =
                currentCount;

            previousNewestMessageId.current =
                newestMessageId;

            return;
        }


        /*
         * Keep refs synchronized.
         */
        previousMessageCount.current =
            currentCount;

        previousNewestMessageId.current =
            newestMessageId;

    }, [messages]);

    const handleImageLoad = useCallback(() => {
    const container = scrollRef.current;

        if (!container) {
            return;
        }

        if (wasNearBottom.current) {
            requestAnimationFrame(() => {
                container.scrollTop =
                    container.scrollHeight;
            });
        }
    }, []);


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
                                attachment =
                                    parsed;
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
                                                onLoad={handleImageLoad}
                                                className="
                                                    max-h-96
                                                    max-w-full
                                                    rounded-xl
                                                    object-contain
                                                "
                                            />

                                        </a>

                                    ) : (

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

                                                        <p
                                                            className="
                                                                whitespace-pre-wrap
                                                                wrap-break-word
                                                            "
                                                        >
                                                            {
                                                                attachment.text
                                                            }
                                                        </p>

                                                    )}

                                                </div>

                                            ) : (

                                                <p
                                                    className="
                                                        whitespace-pre-wrap
                                                        wrap-break-word
                                                    "
                                                >
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