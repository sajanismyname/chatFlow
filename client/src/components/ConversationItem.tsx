import {
    useEffect,
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


    return (

        <button
            type="button"
            onClick={onClick}
            className={`
                group
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-left
                transition-colors
                ${
                    active
                        ? "bg-muted"
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
                            hasUnreadMessage &&
                            !active
                                ? "font-bold text-foreground"
                                : "font-semibold"
                        }
                    `}>
                        {name}
                    </p>

                </div>


                <div className="mt-0.5 flex items-center justify-between gap-2">

                    <p className={`
                        truncate
                        text-xs
                        ${
                            hasUnreadMessage &&
                            !active
                                ? "font-bold text-foreground"
                                : "text-muted-foreground"
                        }
                    `}>
                        {lastMessage ||
                            "No messages yet"}
                    </p>

                </div>

            </div>

        </button>
    );
}


export default ConversationItem;