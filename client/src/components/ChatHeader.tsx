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
    return (
        <header className="h-16 shrink-0 border-b bg-white px-6 flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold overflow-hidden">
                {avatar ? (
                    <img
                        src={avatar}
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    name.charAt(0).toUpperCase()
                )}
            </div>

            <div className="ml-3">
                <h2 className="font-semibold">
                    {name}
                </h2>

                <p className="text-xs text-gray-500">
                    {online ? "Online" : "Offline"}
                </p>
            </div>
        </header>
    );
}

export default ChatHeader;