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


interface ChatHeaderProps {
    name: string;
    avatar?: string | null;
    online?: boolean;
    isTyping?: boolean;
    userId?: number;
    conversationId?: number;
    isSideMenuOpen?: boolean;
    onToggleSideMenu?: () => void;
}


function ChatHeader({
    name,
    avatar,
    online = false,
    isTyping = false,
    userId,
    conversationId,
    isSideMenuOpen = false,
    onToggleSideMenu,
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


    const handleViewProfile = () => {
        if (!userId || !conversationId) {
            return;
        }

        navigate(`/profile/${conversationId}/${userId}`);
    };


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

            {/* USER INFORMATION */}

            <div className="flex min-w-0 items-center gap-3">

                <div className="relative shrink-0">

                    <Avatar
                        className="size-10"
                        onClick={handleViewProfile}
                    >

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


                <div className="min-w-0">

                    <h2 className="truncate text-sm font-semibold">
                        {name}
                    </h2>

                    <p
                        className={`
                            text-xs
                            ${
                                isTyping
                                    ? "text-emerald-500 font-medium"
                                    : online
                                        ? "text-emerald-600"
                                        : "text-muted-foreground"
                            }
                        `}
                    >
                        {isTyping
                            ? "Typing..."
                            : online
                                ? "Online"
                                : "Offline"}
                    </p>

                </div>

            </div>


            {/* ACTIONS */}

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
                            "Voice calling is not configured yet."
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
                            "Video calling is not configured yet."
                        )
                    }
                >
                    <Video className="size-4" />
                </Button>


                {/* MORE OPTIONS (TOGGLES SIDE MENU) */}

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`
                        rounded-full
                        transition-colors
                        ${
                            isSideMenuOpen
                                ? "bg-muted text-foreground"
                                : ""
                        }
                    `}
                    aria-label="Conversation options"
                    title="Conversation options"
                    onClick={onToggleSideMenu}
                >
                    <MoreVertical className="size-4" />
                </Button>

            </div>

        </header>
    );
}


export default ChatHeader;