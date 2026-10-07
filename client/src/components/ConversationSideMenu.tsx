import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    X,
    Bell,
    BellOff,
    Trash2,
    User,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
    isSoundNotificationEnabled,
    setSoundNotificationEnabled,
    playNotificationSound,
} from "../utils/notificationSound";

interface ConversationSideMenuProps {
    conversationId: number;
    name: string;
    avatar?: string | null;
    online?: boolean;
    userId?: number;
    isDeleted?: boolean;
    onClose: () => void;
    onDeleteConversation: () => void;
}

function ConversationSideMenu({
    conversationId,
    name,
    avatar,
    online = false,
    userId,
    isDeleted = false,
    onClose,
    onDeleteConversation,
}: ConversationSideMenuProps) {
    const navigate = useNavigate();

    const [soundEnabled, setSoundEnabled] = useState(isSoundNotificationEnabled);

    const displayName = isDeleted ? "Unknown User" : name;

    const handleToggleMute = () => {
        if (soundEnabled) {
            setSoundNotificationEnabled(false);
            setSoundEnabled(false);
        } else {
            setSoundNotificationEnabled(true);
            setSoundEnabled(true);
            playNotificationSound();
        }
    };

    const handleViewProfile = () => {
        if (!userId || !conversationId || isDeleted) return;
        navigate(`/profile/${userId}`, {
            state: {
                conversationId,
            },
        });
    };

    const handleDelete = () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete your conversation with ${name}?`
        );
        if (!confirmed) return;

        onDeleteConversation();
        onClose();
    };

    const initials = displayName
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U";

    return (
        <aside
            className="
                flex
                h-full
                min-h-0
                w-full
                sm:w-64
                md:w-1/6
                min-w-[210px]
                shrink-0
                flex-col
                border-l
                bg-background
                transition-all
                animate-in
                slide-in-from-right-4
                duration-200
            "
        >
            {/* HEADER */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    Chat Details
                </h3>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                    aria-label="Close menu"
                >
                    <X className="size-4" />
                </Button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* USER PROFILE CARD */}
                <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
                    <div className="relative">
                        <Avatar className="size-16 ring-2 ring-border">
                            <AvatarImage
                                src={isDeleted ? undefined : (avatar ?? undefined)}
                                alt={displayName}
                            />
                            <AvatarFallback className="text-base font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        {!isDeleted && (
                            <span
                                className={`
                                    absolute
                                    bottom-0
                                    right-0
                                    size-3.5
                                    rounded-full
                                    border-2
                                    border-background
                                    ${online ? "bg-emerald-500" : "bg-gray-400"}
                                `}
                            />
                        )}
                    </div>
                    <div className="min-w-0 px-2 w-full">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {isDeleted
                                ? "Account deleted"
                                : online
                                    ? "Active now"
                                    : "Offline"}
                        </p>
                    </div>
                </div>

                {/* NOTIFICATION SETTINGS: MUTE MESSAGE */}
                <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Notifications
                    </span>

                    <button
                        type="button"
                        onClick={handleToggleMute}
                        className={`
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-xl
                            border
                            p-3
                            text-left
                            transition-colors
                            ${
                                !soundEnabled
                                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "border-border bg-card hover:bg-muted/60 text-foreground"
                            }
                        `}
                        title={
                            soundEnabled
                                ? "Click to mute messages"
                                : "Click to unmute messages"
                        }
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div
                                className={`
                                    flex
                                    size-8
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    ${
                                        !soundEnabled
                                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                            : "bg-muted text-muted-foreground"
                                    }
                                `}
                            >
                                {!soundEnabled ? (
                                    <BellOff className="size-4" />
                                ) : (
                                    <Bell className="size-4" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">
                                    Mute Messages
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    {!soundEnabled ? "Notifications muted" : "Sound on"}
                                </p>
                            </div>
                        </div>

                        <div
                            className={`
                                relative
                                inline-flex
                                h-5
                                w-9
                                shrink-0
                                cursor-pointer
                                rounded-full
                                border-2
                                border-transparent
                                transition-colors
                                duration-200
                                ease-in-out
                                ${!soundEnabled ? "bg-amber-500" : "bg-muted"}
                            `}
                        >
                            <span
                                className={`
                                    pointer-events-none
                                    inline-block
                                    size-4
                                    transform
                                    rounded-full
                                    bg-white
                                    shadow-sm
                                    ring-0
                                    transition
                                    duration-200
                                    ease-in-out
                                    ${!soundEnabled ? "translate-x-4" : "translate-x-0"}
                                `}
                            />
                        </div>
                    </button>
                </div>

                {/* CONVERSATION ACTIONS */}
                <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                    </span>

                    <div className="space-y-1.5">
                        {userId && !isDeleted && (
                            <button
                                type="button"
                                onClick={handleViewProfile}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    gap-2.5
                                    rounded-lg
                                    px-3
                                    py-2
                                    text-xs
                                    font-medium
                                    text-muted-foreground
                                    hover:bg-muted
                                    hover:text-foreground
                                    transition-colors
                                "
                            >
                                <User className="size-4 shrink-0" />
                                <span className="truncate">View Profile</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleDelete}
                            className="
                                flex
                                w-full
                                items-center
                                gap-2.5
                                rounded-lg
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-destructive
                                hover:bg-destructive/10
                                transition-colors
                            "
                        >
                            <Trash2 className="size-4 shrink-0" />
                            <span className="truncate">Delete Conversation</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default ConversationSideMenu;
