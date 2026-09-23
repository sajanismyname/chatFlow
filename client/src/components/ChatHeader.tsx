import {
    MoreVertical,
    Phone,
    Video,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    Button,
} from "@/components/ui/button";


interface ChatHeaderProps {
    name: string;
    avatar?: string | null;
    online?: boolean;
}


function ChatHeader({
    name,
    avatar,
    online = false,
}: ChatHeaderProps) {

    const initials = name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();


    return (

        <header
            className="
                flex
                h-16
                shrink-0
                items-center
                justify-between
                border-b
                bg-background
                px-5
            "
        >

            {/* =========================
                USER INFORMATION
            ========================= */}

            <div className="flex min-w-0 items-center gap-3">

                <div className="relative shrink-0">

                    <Avatar className="size-10">

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
                                    : "bg-muted-foreground"
                            }
                        `}
                    />

                </div>


                <div className="min-w-0">

                    <h2 className="truncate text-sm font-semibold">
                        {name}
                    </h2>

                    <p
                        className={`
                            text-xs
                            ${
                                online
                                    ? "text-emerald-600"
                                    : "text-muted-foreground"
                            }
                        `}
                    >
                        {online ? "Online" : "Offline"}
                    </p>

                </div>

            </div>


            {/* =========================
                ACTIONS
            ========================= */}

            <div className="flex items-center gap-1">

                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Start voice call"
                >
                    <Phone className="size-4" />
                </Button>


                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Start video call"
                >
                    <Video className="size-4" />
                </Button>


                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="More options"
                >
                    <MoreVertical className="size-4" />
                </Button>

            </div>

        </header>

    );
}


export default ChatHeader;