import { useState } from "react";
import ConversationItem from "./ConversationItem";

interface Conversation {
    id: number;
    name: string;
    lastMessage: string;
}

interface SidebarProps {
    conversations: Conversation[];
    selectedConversation: number | null;
    onSelectConversation: (id: number) => void;
    onNewChat?: () => void;
}

function Sidebar({
    conversations,
    selectedConversation,
    onSelectConversation,
    onNewChat,
}: SidebarProps) {
    const [search, setSearch] = useState("");

    const filteredConversations = conversations.filter(
        (conversation) =>
            conversation.name
                .toLowerCase()
                .includes(search.toLowerCase())
    );

    return (
        <aside className="w-80 shrink-0 border-r bg-white flex flex-col">

            {/* Sidebar Header */}

            <div className="p-5 border-b">

                <div className="flex items-center justify-between">

                    <h2 className="text-lg font-semibold">
                        Conversations
                    </h2>

                    <button
                        onClick={onNewChat}
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


            {/* Conversation List */}

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

        </aside>
    );
}

export default Sidebar;