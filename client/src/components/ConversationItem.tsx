interface ConversationItemProps {
    name: string;
    lastMessage: string;
    active?: boolean;
    onClick?: () => void;
}

function ConversationItem({
    name,
    lastMessage,
    active = false,
    onClick,
}: ConversationItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-5 py-4 text-left transition ${
                active
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
            }`}
        >
            <div className="h-11 w-11 shrink-0 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                {name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
                <p className="font-medium">
                    {name}
                </p>

                <p className="text-sm text-gray-500 truncate">
                    {lastMessage}
                </p>
            </div>
        </button>
    );
}

export default ConversationItem;