import { useState } from "react";

import api from "../api/axios";
import ConversationItem from "./ConversationItem";
import UserSearch from "./UserSearch";
import type { User, SidebarProps } from "../features/auth/authTypes";


function Sidebar({
    conversations,
    selectedConversation,
    onSelectConversation,
}: SidebarProps) {
    const [search, setSearch] = useState("");
    const [showUserSearch, setShowUserSearch] =
        useState(false);

    const filteredConversations =
        conversations.filter((conversation) =>
            conversation.name
                .toLowerCase()
                .includes(search.toLowerCase())
        );

    const handleSelectUser = async (user: User) => {
        try {
            const response = await api.post(
                "/conversations",
                {
                    userId: user.id,
                }
            );

            const conversation =
                response.data.conversation;

            console.log(
                "Conversation created:",
                conversation
            );

            setShowUserSearch(false);

            /*
             * Select the newly created conversation.
             */
            onSelectConversation(conversation.id);

        } catch (error) {
            console.error(
                "Failed to create conversation:",
                error
            );
        }
    };

    return (
        <aside className="relative w-80 shrink-0 border-r bg-white flex flex-col">

            {/* ================= SIDEBAR HEADER ================= */}

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


            {/* ================= CONVERSATION LIST ================= */}

            <div className="flex-1 overflow-y-auto">

                {filteredConversations.length > 0 ? (
                    filteredConversations.map(
                        (conversation) => (
                            <ConversationItem
                                key={conversation.id}
                                name={conversation.name}
                                lastMessage={
                                    conversation.lastMessage
                                }
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
                        )
                    )
                ) : (
                    <p className="p-5 text-sm text-gray-500">
                        No conversations found.
                    </p>
                )}

            </div>


            {/* ================= USER SEARCH ================= */}

            {showUserSearch && (
                <UserSearch
                    onClose={() =>
                        setShowUserSearch(false)
                    }
                    onSelectUser={handleSelectUser}
                />
            )}

        </aside>
    );
}

export default Sidebar;