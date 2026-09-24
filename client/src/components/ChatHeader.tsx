import {
    MoreVertical,
    Phone,
    Video,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

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

    const navigate = useNavigate();


    const initials = name
        .split(" ")
        .map((word) =>
            word.charAt(0)
        )
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
                        {online
                            ? "Online"
                            : "Offline"}
                    </p>

                </div>

            </div>


            {/* =========================
                ACTIONS
            ========================= */}

            <div className="flex items-center gap-1">

                {/* VOICE CALL */}

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Start voice call"
                    onClick={() =>
                        window.alert(
                            "Voice calling is not configured on the server yet."
                        )
                    }
                >
                    <Phone className="size-4" />
                </Button>


                {/* VIDEO CALL */}

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Start video call"
                    onClick={() =>
                        window.alert(
                            "Video calling is not configured on the server yet."
                        )
                    }
                >
                    <Video className="size-4" />
                </Button>


                {/* MORE MENU */}

                <DropdownMenu>

                    <DropdownMenuTrigger
                        render={
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                aria-label="More options"
                            >
                                <MoreVertical className="size-4" />
                            </Button>
                        }
                    />

                    <DropdownMenuContent align="end">

                        <DropdownMenuItem
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            View my profile
                        </DropdownMenuItem>


                        <DropdownMenuSeparator />


                        <DropdownMenuItem
                            onClick={() =>
                                window.alert(
                                    `Conversation with ${name}`
                                )
                            }
                        >
                            Conversation details
                        </DropdownMenuItem>

                    </DropdownMenuContent>

                </DropdownMenu>

            </div>

        </header>

    );
}


export default ChatHeader;