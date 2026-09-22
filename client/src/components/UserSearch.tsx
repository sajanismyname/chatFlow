import { useState } from "react";
import api from "../api/axios";
import type {User, UserSearchProps}  from "../features/auth/authTypes";

function UserSearch({
    onSelectUser,
    onClose,
}: UserSearchProps) {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (
        value: string
    ) => {
        setQuery(value);

        if (!value.trim()) {
            setUsers([]);
            return;
        }

        try {
            setLoading(true);

            const response = await api.get(
                "/users/search",
                {
                    params: {
                        q: value,
                    },
                }
            );

            setUsers(response.data.users);
        } catch (error) {
            console.error(
                "Failed to search users:",
                error
            );

            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-white">

            <div className="flex items-center gap-3 border-b p-4">

                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-black"
                >
                    ←
                </button>

                <input
                    autoFocus
                    value={query}
                    onChange={(e) =>
                        handleSearch(e.target.value)
                    }
                    placeholder="Search users..."
                    className="flex-1 outline-none"
                />

            </div>

            <div className="p-2">

                {loading && (
                    <p className="p-3 text-sm text-gray-500">
                        Searching...
                    </p>
                )}

                {!loading &&
                    query.trim() &&
                    users.length === 0 && (
                        <p className="p-3 text-sm text-gray-500">
                            No users found.
                        </p>
                    )}

                {users.map((user) => (
                    <button
                        key={user.id}
                        onClick={() =>
                            onSelectUser(user)
                        }
                        className="w-full flex items-center gap-3 rounded-lg p-3 text-left hover:bg-gray-100"
                    >
                        <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 flex items-center justify-center font-semibold overflow-hidden">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                user.name
                                    .charAt(0)
                                    .toUpperCase()
                            )}
                        </div>

                        <div>
                            <p className="font-medium">
                                {user.name}
                            </p>

                            <p className="text-xs text-gray-500">
                                {user.email}
                            </p>
                        </div>
                    </button>
                ))}

            </div>
        </div>
    );
}

export default UserSearch;