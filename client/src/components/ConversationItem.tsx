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
    onClick,
}: ConversationItemProps) {

    /* =========================
       USER INITIALS
    ========================= */

    const initials = name
        .split(" ")
        .map((word) =>
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
                        ? "bg-accent"
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
                        src={avatar ?? undefined}
                        alt={name}
                    />

                    <AvatarFallback>
                        {initials}
                    </AvatarFallback>

                </Avatar>


                {/* ONLINE INDICATOR */}

                <span
                    className="
                        absolute
                        bottom-0
                        right-0
                        size-3
                        rounded-full
                        border-2
                        border-background
                        bg-emerald-500
                    "
                />

            </div>


            {/* =========================
                CONVERSATION INFO
            ========================= */}

            <div className="min-w-0 flex-1">

                <div className="flex items-center justify-between gap-2">

                    <p className="truncate text-sm font-semibold">
                        {name}
                    </p>

                </div>


                <div className="mt-0.5 flex items-center justify-between gap-2">

                    <p className="truncate text-xs text-muted-foreground">
                        {lastMessage ||
                            "No messages yet"}
                    </p>

                </div>

            </div>

        </button>

    );

}


export default ConversationItem;