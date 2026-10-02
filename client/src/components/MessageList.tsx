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
    Button,
} from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    fetchOlderMessages,
} from "../features/messages/messageSlice";

import {
    FileText,
    Download,
    MoreHorizontal,
} from "lucide-react";

import {
    socket,
} from "../socket/socket";


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


    /*
     * Single scroll container ref.
     *
     * IMPORTANT:
     * Do not use a second ref for the same
     * scrolling element.
     */
    const scrollRef =
        useRef<HTMLDivElement | null>(null);


    /*
     * Whether the user was close to the
     * bottom before a message/layout change.
     */
    const wasNearBottom =
        useRef(true);


    /*
     * Previous message state.
     */
    const previousMessageCount =
        useRef(0);

    const previousNewestMessageId =
        useRef<number | null>(null);


    /*
     * Conversation tracking.
     */
    const previousConversationId =
        useRef<number | null>(null);


    /*
     * Initial message load.
     */
    const initialLoad =
        useRef(true);


    /*
     * Older-message scroll preservation.
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
            previousConversationId.current ===
            conversationId
        ) {
            return;
        }

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

    }, [conversationId]);


    /* =========================
       LOAD OLDER MESSAGES
    ========================= */

    const handleScroll =
        useCallback(() => {

            const container =
                scrollRef.current;

            if (!container) {
                return;
            }

            const distanceFromBottom =
                container.scrollHeight -
                container.scrollTop -
                container.clientHeight;

            wasNearBottom.current =
                distanceFromBottom <= 120;


            /*
             * Only request older messages when
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
             * prepending messages.
             */
            previousScrollHeight.current =
                container.scrollHeight;

            previousScrollTop.current =
                container.scrollTop;

            preserveScrollPosition.current =
                true;


            void dispatch(
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


        /* =========================
           INITIAL LOAD
        ========================= */

        if (
            initialLoad.current &&
            currentCount > 0
        ) {

            /*
             * Direct assignment is cheaper than
             * scheduling another animation frame.
             */
            container.scrollTop =
                container.scrollHeight;

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


        /* =========================
           OLDER MESSAGES
        ========================= */

        if (
            preserveScrollPosition.current &&
            currentCount > previousCount
        ) {

            const newScrollHeight =
                container.scrollHeight;

            const heightDifference =
                newScrollHeight -
                previousScrollHeight.current;

            container.scrollTop =
                previousScrollTop.current +
                heightDifference;

            preserveScrollPosition.current =
                false;

            previousMessageCount.current =
                currentCount;

            previousNewestMessageId.current =
                newestMessageId;

            return;
        }


        /* =========================
           NEW MESSAGE
        ========================= */

        const receivedNewMessage =
            newestMessageId !== null &&
            newestMessageId !==
                previousNewestMessageId.current;


        if (
            receivedNewMessage &&
            currentCount >= previousCount
        ) {

            if (wasNearBottom.current) {

                container.scrollTop =
                    container.scrollHeight;

            }

            previousMessageCount.current =
                currentCount;

            previousNewestMessageId.current =
                newestMessageId;

            return;
        }


        /*
         * Keep tracking state synchronized.
         */
        previousMessageCount.current =
            currentCount;

        previousNewestMessageId.current =
            newestMessageId;

    }, [messages]);


    /* =========================
       ATTACHMENT LOAD
    ========================= */

    const handleImageLoad =
        useCallback(() => {

            const container =
                scrollRef.current;

            if (!container) {
                return;
            }

            if (wasNearBottom.current) {

                container.scrollTop =
                    container.scrollHeight;

            }

        }, []);


    /* =========================
       MESSAGE ACTIONS
    ========================= */

    const handleUnsend = (
        messageId: number
    ) => {

        socket.emit(
            "unsend_message",
            messageId
        );

    };


    const handleDeleteForMe = (
        messageId: number
    ) => {

        socket.emit(
            "delete_message_for_me",
            messageId
        );

    };


    return (
        <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="
                h-full
                min-h-0
                overflow-y-auto
                overscroll-contain
                scroll-smooth
                px-3
                py-4
                sm:px-5
                sm:py-5
            "
        >

            <div className="flex min-h-full flex-col gap-3">

                {messages.length === 0 ? (

                    <div
                        className="
                            flex
                            flex-1
                            flex-col
                            items-center
                            justify-center
                            px-4
                            py-16
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

                        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                            Send a message to start the conversation.
                        </p>

                    </div>

                ) : (

                    messages.map((message) => {

                        const mine =
                            message.sender.id ===
                            currentUser?.id;


                        const isUnsent =
                            Boolean(
                                message.unsentAt
                            ) ||
                            message.deletedForEveryone;


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


                        if (!isUnsent) {

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

                                    <Avatar className="size-7 shrink-0 sm:size-8">

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
                                        max-w-[85%]
                                        flex-col
                                        sm:max-w-[75%]
                                        ${
                                            mine
                                                ? "items-end"
                                                : "items-start"
                                        }
                                    `}
                                >

                                    <div
                                        className={`
                                            flex
                                            items-center
                                            gap-1
                                            ${
                                                mine
                                                    ? "flex-row-reverse"
                                                    : "flex-row"
                                            }
                                        `}
                                    >

                                        <div>

                                            {isUnsent ? (

                                                <div
                                                    className="
                                                        rounded-2xl
                                                        border
                                                        bg-muted/50
                                                        px-4
                                                        py-2.5
                                                        text-sm
                                                        italic
                                                        text-muted-foreground
                                                    "
                                                >
                                                    This message was unsent
                                                </div>

                                            ) : attachment &&
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
                                                        onLoad={
                                                            handleImageLoad
                                                        }
                                                        loading="lazy"
                                                        className="
                                                            max-h-80
                                                            max-w-full
                                                            rounded-xl
                                                            object-contain
                                                            sm:max-h-96
                                                        "
                                                    />

                                                </a>

                                            ) : (

                                                <div
                                                    className={`
                                                        rounded-2xl
                                                        border
                                                        bg-background
                                                        px-4
                                                        py-2.5
                                                        text-sm
                                                        text-foreground
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
                                                                    min-w-0
                                                                    items-center
                                                                    gap-3
                                                                    rounded-xl
                                                                    border
                                                                    border-current/10
                                                                    px-3
                                                                    py-2
                                                                    transition-colors
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

                                        </div>


                                        {!isUnsent && (

                                            <DropdownMenu>

                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="
                                                                size-7
                                                                shrink-0
                                                                text-muted-foreground
                                                                hover:text-foreground
                                                            "
                                                        >
                                                            <MoreHorizontal className="size-4" />

                                                            <span className="sr-only">
                                                                Message options
                                                            </span>
                                                        </Button>
                                                    }
                                                />


                                                <DropdownMenuContent
                                                    align={
                                                        mine
                                                            ? "end"
                                                            : "start"
                                                    }
                                                >

                                                    {mine && (

                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleUnsend(
                                                                    message.id
                                                                )
                                                            }
                                                        >
                                                            Unsend
                                                        </DropdownMenuItem>

                                                    )}


                                                    {mine && (
                                                        <DropdownMenuSeparator />
                                                    )}


                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDeleteForMe(
                                                                message.id
                                                            )
                                                        }
                                                    >
                                                        Delete for me
                                                    </DropdownMenuItem>

                                                </DropdownMenuContent>

                                            </DropdownMenu>

                                        )}

                                    </div>


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