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

import {
    ScrollArea,
} from "@/components/ui/scroll-area";


function Sidebar({
    conversations,
    selectedConversation,
    onSelectConversation,
}: SidebarProps) {

    const [search, setSearch] = useState("");
    const [showUserSearch, setShowUserSearch] =
        useState(false);

    const dispatch = useAppDispatch();


    /* =========================
       CURRENT USER
    ========================= */

    const currentUser = useAppSelector(
        (state) => state.auth.user
    );


    /* =========================
       ACTIVE CONVERSATION
    ========================= */

    const activeConversationId =
        useAppSelector(
            (state) =>
                state.chat.activeConversationId
        );


    /* =========================
       GET OTHER USER
    ========================= */

    const getOtherUser = (
        conversation: Conversation
    ) => {

        return conversation.members.find(
            (member) =>
                member.user.id !== currentUser?.id
        )?.user;

    };


    /* =========================
       SEARCH FILTER
    ========================= */

    const filteredConversations =
        conversations.filter(
            (conversation) => {

                const otherUser =
                    getOtherUser(conversation);

                const name =
                    otherUser?.name
                        ?.toLowerCase() ?? "";

                return name.includes(
                    search.toLowerCase()
                );

            }
        );


    /* =========================
       CREATE CONVERSATION
    ========================= */

    const handleSelectUser = async (
        userId: number
    ) => {

        try {

            const conversation =
                await dispatch(
                    createConversation(userId)
                ).unwrap();


            // Close user search
            setShowUserSearch(false);


            // Make new conversation active
            dispatch(
                setActiveConversation(
                    conversation.id
                )
            );


            // Update parent state
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


    /* =========================
       SELECT CONVERSATION
    ========================= */

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
                relative
                flex
                h-full
                w-80
                shrink-0
                flex-col
                border-r
                bg-background
            "
        >

            {/* =================================
                SIDEBAR HEADER
            ================================= */}

            <div className="border-b p-4">

                <div className="flex items-center justify-between">

                    <div className="min-w-0">

                        <h2 className="text-lg font-semibold tracking-tight">
                            Conversations
                        </h2>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Your messages
                        </p>

                    </div>


                    {/* NEW CHAT BUTTON */}

                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 rounded-full"
                        onClick={() =>
                            setShowUserSearch(true)
                        }
                        aria-label="New conversation"
                    >
                        <Plus className="size-4" />
                    </Button>

                </div>


                {/* =================================
                    SEARCH
                ================================= */}

                <div className="relative mt-4">

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
                            pl-9
                            pr-9
                        "
                    />


                    {/* CLEAR SEARCH */}

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
                                text-xs
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


            {/* =================================
                CONVERSATION LIST
            ================================= */}

            <ScrollArea className="flex-1">

                {filteredConversations.length > 0 ? (

                    <div className="space-y-1 p-2">

                        {filteredConversations.map(
                            (conversation) => {

                                const otherUser =
                                    getOtherUser(
                                        conversation
                                    );

                                const isActive =
                                    activeConversationId ===
                                    conversation.id;


                                return (

                                    <ConversationItem
                                        key={
                                            conversation.id
                                        }

                                        name={
                                            otherUser?.name ||
                                            "Unknown user"
                                        }

                                        avatar={
                                            otherUser?.avatar ||
                                            undefined
                                        }

                                        lastMessage=""

                                        active={
                                            isActive ||
                                            selectedConversation ===
                                                conversation.id
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

                    /* =================================
                       EMPTY SEARCH STATE
                    ================================= */

                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            justify-center
                            px-6
                            py-16
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

            </ScrollArea>


            {/* =================================
                USER SEARCH
            ================================= */}

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