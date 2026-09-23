import type {
    ConversationItemProps,
} from "../features/conversation/conversationTypes";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    Badge,
} from "@/components/ui/badge";

function ConversationItem({
    name,
    lastMessage,
    active = false,
    onClick,
}: ConversationItemProps) {

    const initials = name
        .split(" ")
        .map((word) => word.charAt(0))
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
                        src=""
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

                    <span className="shrink-0 text-[10px] text-muted-foreground">
                        10:42
                    </span>

                </div>


                <div className="mt-0.5 flex items-center justify-between gap-2">

                    <p className="truncate text-xs text-muted-foreground">
                        {lastMessage || "No messages yet"}
                    </p>

                    {/* Example unread badge */}

                    {active === false && (
                        <Badge
                            variant="secondary"
                            className="
                                hidden
                                h-5
                                min-w-5
                                rounded-full
                                px-1.5
                                text-[10px]
                            "
                        >
                            2
                        </Badge>
                    )}

                </div>

            </div>

        </button>
    );
}

export default ConversationItem;