import {
    useCallback,
    useEffect,
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
    clearNewlyArrivedHighlight,
} from "../features/chat/chatSlice";

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
    isTyping?: boolean;
}


function MessageList({
    messages,
    conversationId,
    isTyping = false,
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

    const newlyArrivedMessageIds = useAppSelector(
        (state) => state.chat.newlyArrivedMessageIds ?? []
    );

    useEffect(() => {
        if (newlyArrivedMessageIds.length > 0) {
            const timer = setTimeout(() => {
                dispatch(clearNewlyArrivedHighlight());
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [newlyArrivedMessageIds, dispatch]);


    const scrollRef =
        useRef<HTMLDivElement | null>(null);


    const wasNearBottom =
        useRef(true);


    const previousMessageCount =
        useRef(0);


    const previousNewestMessageId =
        useRef<number | null>(null);


    const previousConversationId =
        useRef<number | null>(null);


    const initialLoad =
        useRef(true);


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
                distanceFromBottom <= 100;


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


            previousScrollHeight.current =
                container.scrollHeight;

            previousScrollTop.current =
                container.scrollTop;

            preserveScrollPosition.current =
                true;


            dispatch(
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


        previousMessageCount.current =
            currentCount;

        previousNewestMessageId.current =
            newestMessageId;

    }, [messages]);


    /* =========================
       IMAGE LOAD
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
                absolute
                inset-0
                min-h-0
                min-w-0
                overflow-x-hidden
                overflow-y-auto
                overscroll-contain
                scrollbar-gutter-stable
            "
        >

            <div
                className="
                    flex
                    min-h-full
                    min-w-0
                    flex-col
                    gap-4
                    px-4
                    py-6
                    sm:px-6
                "
            >

                {messages.length === 0 ? (

                    <div
                        className="
                            flex
                            min-h-full
                            flex-1
                            flex-col
                            items-center
                            justify-center
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

                        const isNewArrival =
                            newlyArrivedMessageIds.includes(message.id);


                        const isUnsent =
                            Boolean(
                                message.deletedForEveryone
                            ) ||
                            message.deletedAt !== null;


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
                                    min-w-0
                                    w-full
                                    items-end
                                    gap-2
                                    ${
                                        mine
                                            ? "justify-end pl-10"
                                            : "justify-start pr-10"
                                    }
                                `}
                            >

                                {!mine && (

                                    <Avatar
                                        className="
                                            size-8
                                            shrink-0
                                        "
                                    >

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
                                        min-w-0
                                        max-w-[75%]
                                        flex
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
                                            flex
                                            min-w-0
                                            items-center
                                            gap-1
                                            ${
                                                mine
                                                    ? "flex-row-reverse"
                                                    : "flex-row"
                                            }
                                        `}
                                    >

                                        <div className="min-w-0">

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
                                                        className="
                                                            block
                                                            max-h-96
                                                            max-w-full
                                                            rounded-xl
                                                            object-contain
                                                        "
                                                    />

                                                </a>

                                            ) : (

                                                <>
                                                    {isNewArrival && !mine && (
                                                        <span className="mb-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black text-white shadow-sm dark:bg-emerald-500 dark:text-neutral-950">
                                                            New message
                                                        </span>
                                                    )}
                                                    <div
                                                        className={`
                                                            max-w-full
                                                            overflow-hidden
                                                            rounded-2xl
                                                            border
                                                            bg-background
                                                            px-4
                                                            py-2.5
                                                            text-sm
                                                            shadow-sm
                                                            transition-all
                                                            duration-300
                                                            ${
                                                                isNewArrival && !mine
                                                                    ? "border-black ring-2 ring-black/25 shadow-md shadow-black/10 animate-message-arrival dark:border-emerald-500 dark:ring-emerald-500/40 dark:shadow-emerald-500/20 text-foreground"
                                                                    : "border-border text-foreground"
                                                            }
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
                                                </>

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

                {isTyping && (
                    <div className="flex w-full justify-start mt-2 mb-2 pr-12">
                        <div className="flex flex-col">
                            <div className="relative group flex items-start gap-2 flex-row">
                                <div className="rounded-2xl px-4 py-2 bg-muted text-foreground rounded-tl-sm">
                                    <div className="flex gap-1 items-center h-5">
                                        <div className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
}


export default MessageList;