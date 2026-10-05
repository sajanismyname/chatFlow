import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type {
    ConversationItemProps,
} from "../features/conversation/conversationTypes";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";


function ConversationItem({
    name,
    avatar,
    lastMessage,
    active = false,
    online = false,
    isTyping = false,
    lastMessageDate,
    unreadCount = 0,
    isNewlyArrived = false,
    onClick,
}: ConversationItemProps) {

    /*
     * Track whether a newer message has arrived
     * since this conversation was last opened.
     */
    const [hasUnreadMessage, setHasUnreadMessage] =
        useState(false);


    /*
     * Store the previous preview so the initial
     * conversation load does not count as unread.
     */
    const previousLastMessage =
        useRef(lastMessage);


    /* =========================
       NEW MESSAGE DETECTION
    ========================= */

    useEffect(() => {

        /*
         * Opening the conversation clears its
         * unread state.
         */
        if (active) {

            setHasUnreadMessage(false);

            previousLastMessage.current =
                lastMessage;

            return;
        }


        /*
         * Only mark unread when the preview
         * actually changes after mounting.
         */
        if (
            lastMessage !==
            previousLastMessage.current
        ) {

            setHasUnreadMessage(true);
        }


        previousLastMessage.current =
            lastMessage;

    }, [
        active,
        lastMessage,
    ]);


    const isUnread = (hasUnreadMessage || unreadCount > 0 || isNewlyArrived) && !active;


    /* =========================
       USER INITIALS
    ========================= */

    const initials = name
        .split(" ")
        .map(
            (word) =>
                word.charAt(0)
        )
        .join("")
        .slice(0, 2)
        .toUpperCase();


    /* =========================
       FORMAT DATE
    ========================= */

    const formattedDate = useMemo(() => {

        if (!lastMessageDate) {
            return null;
        }

        const date = new Date(lastMessageDate);
        const now = new Date();

        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const messageDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

        const diffMs =
            today.getTime() - messageDay.getTime();

        const diffDays =
            Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Today — show time
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        if (diffDays === 1) {
            return "Yesterday";
        }

        if (diffDays < 7) {
            // This week — show day name
            return date.toLocaleDateString([], {
                weekday: "short",
            });
        }

        // Older — show short date
        return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
        });

    }, [lastMessageDate]);


    return (

        <button
            type="button"
            onClick={onClick}
            className={`
                group
                relative
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-left
                transition-all
                duration-200
                ${
                    active
                        ? "bg-muted"
                        : isUnread
                            ? "bg-black/[0.03] hover:bg-black/[0.06] dark:bg-emerald-500/[0.08] dark:hover:bg-emerald-500/[0.12]"
                            : "hover:bg-muted/60"
                }
            `}
        >

            {/* =========================
                AVATAR
            ========================= */}

            <div className="relative shrink-0">

                <Avatar className="size-11">

                    <AvatarImage
                        src={
                            avatar ??
                            undefined
                        }
                        alt={name}
                    />

                    <AvatarFallback>
                        {initials}
                    </AvatarFallback>

                </Avatar>


                {/* ONLINE INDICATOR */}

                <span
                    className={`
                        absolute
                        bottom-0
                        right-0
                        size-3
                        rounded-full
                        border-2
                        border-background
                        ${
                            online
                                ? "bg-emerald-500"
                                : "bg-gray-500"
                        }
                    `}
                />

            </div>


            {/* =========================
                CONVERSATION INFO
            ========================= */}

            <div className="min-w-0 flex-1">

                <div className="flex items-center justify-between gap-2">

                    <p className={`
                        truncate
                        text-sm
                        ${
                            isUnread
                                ? "font-bold text-black dark:text-emerald-400"
                                : "font-semibold text-foreground"
                        }
                    `}>
                        {name}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">

                        {formattedDate && (

                            <span
                                className={`
                                    shrink-0
                                    text-[11px]
                                    ${
                                        isUnread
                                            ? "font-bold text-black dark:text-emerald-400"
                                            : "text-muted-foreground"
                                    }
                                `}
                            >
                                {formattedDate}
                            </span>

                        )}

                        {/* HIGHLIGHT UNREAD BADGE: BLACK FOR WHITE THEME, GREEN FOR DARK THEME */}
                        {isUnread && (
                            unreadCount > 1 ? (
                                <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-bold text-white shadow-xs dark:bg-emerald-500 dark:text-neutral-950">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            ) : (
                                <span
                                    className="size-2 rounded-full bg-black dark:bg-emerald-500"
                                    title="New message"
                                />
                            )
                        )}

                    </div>

                </div>


                <div className="mt-0.5 flex items-center justify-between gap-2">

                    {isTyping ? (

                        <p className="
                            truncate
                            text-xs
                            font-medium
                            text-emerald-500
                        ">
                            Typing...
                        </p>

                    ) : (

                        <p className={`
                            truncate
                            text-xs
                            ${
                                isUnread
                                    ? "font-bold text-black dark:text-emerald-400"
                                    : "text-muted-foreground"
                            }
                        `}>
                            {lastMessage ||
                                "No messages yet"}
                        </p>

                    )}

                </div>

            </div>

        </button>
    );
}


export default ConversationItem;