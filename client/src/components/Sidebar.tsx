import { useState } from "react";

import {
    useAppDispatch,
    useAppSelector,
} from "../app/hooks";

import type {
    Conversation,
} from "../features/conversation/conversationTypes";

import {
    createConversation,
} from "../features/conversation/conversationSlice";

import type {
    SidebarProps,
} from "../features/types/sidebarType";

import ConversationItem from "./ConversationItem";
import UserSearch from "./UserSearch";

import {
    setActiveConversation,
} from "../features/chat/chatSlice";

import {
    Search,
    Plus,
} from "lucide-react";

import {
    Button,
} from "@/components/ui/button";

import {
    Input,
} from "@/components/ui/input";


function Sidebar({
    conversations,
    selectedConversation,
    onSelectConversation,
}: SidebarProps) {
    const [search, setSearch] = useState("");
    const [showUserSearch, setShowUserSearch] =
        useState(false);

    const dispatch = useAppDispatch();

    const currentUser = useAppSelector(
        (state) => state.auth.user
    );

    const onlineUsers = useAppSelector(
        (state) => state.chat.onlineUsers
    );

    const activeConversationId =
        useAppSelector(
            (state) =>
                state.chat.activeConversationId
        );

    const getOtherMember = (
        conversation: Conversation
    ) => {
        return conversation.members.find(
            (member) =>
                member.user.id !== currentUser?.id
        );
    };

    const filteredConversations =
        conversations.filter(
            (conversation) => {
                const otherMember =
                    getOtherMember(
                        conversation
                    );

                const name = (
                    otherMember?.nickname ||
                    otherMember?.user.name ||
                    ""
                ).toLowerCase();

                return name.includes(
                    search.toLowerCase()
                );
            }
        );

    const handleSelectUser = async (
        userId: number
    ) => {
        try {
            const conversation =
                await dispatch(
                    createConversation(userId)
                ).unwrap();

            setShowUserSearch(false);

            dispatch(
                setActiveConversation(
                    conversation.id
                )
            );

            onSelectConversation(
                conversation.id
            );
        } catch (error) {
            console.error(
                "Failed to create conversation:",
                error
            );
        }
    };

    const handleSelectConversation = (
        conversationId: number
    ) => {
        onSelectConversation(
            conversationId
        );
    };

    return (
        <aside
            className="
                flex
                h-full
                min-h-0
                w-full
                shrink-0
                flex-col
                overflow-hidden
                border-r
                bg-background
                md:w-80
            "
        >
            {/* HEADER */}

            <div
                className="
                    shrink-0
                    border-b
                    bg-background
                    px-3
                    py-3
                    sm:px-4
                    sm:py-4
                "
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                            Conversations
                        </h2>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Your messages
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="
                            size-9
                            shrink-0
                            rounded-full
                            shadow-sm
                        "
                        onClick={() =>
                            setShowUserSearch(true)
                        }
                        aria-label="New conversation"
                    >
                        <Plus className="size-4" />
                    </Button>
                </div>

                {/* SEARCH */}

                <div className="relative mt-3 sm:mt-4">
                    <Search
                        className="
                            pointer-events-none
                            absolute
                            left-3
                            top-1/2
                            size-4
                            -translate-y-1/2
                            text-muted-foreground
                        "
                    />

                    <Input
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search conversations..."
                        className="
                            h-10
                            rounded-xl
                            border-border/70
                            bg-muted/30
                            pl-9
                            pr-9
                            shadow-none
                            focus-visible:bg-background
                        "
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                            className="
                                absolute
                                right-3
                                top-1/2
                                -translate-y-1/2
                                text-sm
                                text-muted-foreground
                                transition-colors
                                hover:text-foreground
                            "
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* CONVERSATIONS */}

            <div
                className="
                    min-h-0
                    flex-1
                    overflow-y-auto
                    overscroll-contain
                    px-2
                    py-2
                    sm:px-3
                    sm:py-3
                "
            >
                {filteredConversations.length > 0 ? (
                    <div className="space-y-1">
                        {filteredConversations.map(
                            (conversation) => {
                                const otherMember =
                                    getOtherMember(
                                        conversation
                                    );

                                const otherUser =
                                    otherMember?.user;

                                const displayName =
                                    otherMember?.nickname ||
                                    otherUser?.name ||
                                    "Unknown user";

                                const isActive =
                                    activeConversationId ===
                                    conversation.id;

                                const isOnline =
                                    otherUser?.id !==
                                        undefined &&
                                    onlineUsers.includes(
                                        otherUser.id
                                    );

                                return (
                                    <ConversationItem
                                        key={
                                            conversation.id
                                        }
                                        name={
                                            displayName
                                        }
                                        avatar={
                                            otherUser?.avatar ||
                                            undefined
                                        }
                                        lastMessage={
                                            conversation
                                                .lastMessage
                                                ?.content ||
                                            "No messages yet"
                                        }
                                        active={
                                            isActive ||
                                            selectedConversation ===
                                                conversation.id
                                        }
                                        online={
                                            isOnline
                                        }
                                        onClick={() =>
                                            handleSelectConversation(
                                                conversation.id
                                            )
                                        }
                                    />
                                );
                            }
                        )}
                    </div>
                ) : (
                    <div
                        className="
                            flex
                            h-full
                            min-h-60
                            flex-col
                            items-center
                            justify-center
                            px-6
                            text-center
                        "
                    >
                        <div
                            className="
                                mb-4
                                flex
                                size-12
                                items-center
                                justify-center
                                rounded-full
                                bg-muted
                            "
                        >
                            <Search className="size-5 text-muted-foreground" />
                        </div>

                        <p className="text-sm font-medium">
                            No conversations found
                        </p>

                        <p className="mt-1 max-w-55 text-xs leading-relaxed text-muted-foreground">
                            Try searching for another person.
                        </p>
                    </div>
                )}
            </div>

            {/* USER SEARCH */}

            {showUserSearch && (
                <UserSearch
                    onClose={() =>
                        setShowUserSearch(false)
                    }
                    onSelectUser={(user) =>
                        handleSelectUser(
                            user.id
                        )
                    }
                />
            )}
        </aside>
    );
}

export default Sidebar;