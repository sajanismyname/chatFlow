import { useState } from "react";
import { useAppDispatch,useAppSelector } from "../app/hooks";
import type {
    Conversation,
} from "../features/conversation/conversationTypes";
import {
    createConversation,
} from "../features/conversation/conversationSlice";
import type { SidebarProps } from "../features/types/sidebarType";
import ConversationItem from "./ConversationItem";
import UserSearch from "./UserSearch";


function Sidebar({
    conversations,
    selectedConversation,
    onSelectConversation,
}: SidebarProps) {
    const [search, setSearch] = useState("");
    const [showUserSearch, setShowUserSearch] =
        useState(false);

    const dispatch = useAppDispatch()

    const currentUser = useAppSelector(
        (state) => state.auth.user
    );

    const getOtherUser = (
        conversation: Conversation
    ) => {
        return conversation.members.find(
            (member) =>
                member.user.id !== currentUser?.id
        )?.user;
    };

    const filteredConversations =
        conversations.filter((conversation) => {
            const otherUser =
                getOtherUser(conversation);

            return otherUser?.name
                .toLowerCase()
                .includes(search.toLowerCase());
        });

    const handleSelectUser = async (userId: number) => {
    try {
        const conversation = await dispatch(
            createConversation(userId)
        ).unwrap();

        setShowUserSearch(false);

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

    return (
        <aside className="relative w-80 shrink-0 border-r bg-white flex flex-col">

            {/* Header */}

            <div className="p-5 border-b">

                <div className="flex items-center justify-between">

                    <h2 className="text-lg font-semibold">
                        Conversations
                    </h2>

                    <button
                        onClick={() =>
                            setShowUserSearch(true)
                        }
                        className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
                    >
                        + New
                    </button>

                </div>

                <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search conversations..."
                    className="mt-4 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-black"
                />

            </div>

            {/* Conversation list */}

            <div className="flex-1 overflow-y-auto">

                {filteredConversations.length > 0 ? (
                    filteredConversations.map(
                        (conversation) => {
                            const otherUser =
                                getOtherUser(
                                    conversation
                                );

                            return (
                                <ConversationItem
                                    key={
                                        conversation.id
                                    }
                                    name={
                                        otherUser?.name ||
                                        "Unknown user"
                                    }
                                    lastMessage=""
                                    active={
                                        selectedConversation ===
                                        conversation.id
                                    }
                                    onClick={() =>
                                        onSelectConversation(
                                            conversation.id
                                        )
                                    }
                                />
                            );
                        }
                    )
                ) : (
                    <p className="p-5 text-sm text-gray-500">
                        No conversations found.
                    </p>
                )}

            </div>

            {/* New Chat */}

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