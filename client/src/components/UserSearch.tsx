import { useEffect, useState } from "react";
import api from "../api/axios";

import type {
    User,
    UserSearchProps,
} from "../features/auth/authTypes";

import {
    ArrowLeft,
    Loader2,
    Search,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    Button,
} from "@/components/ui/button";

import {
    Input,
} from "@/components/ui/input";

import {
    ScrollArea,
} from "@/components/ui/scroll-area";


function UserSearch({
    onSelectUser,
    onClose,
}: UserSearchProps) {

    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");


    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.trim().length >= 2) {
                handleSearch(search.trim());
            }
        }, 400);

        return () => {
            clearTimeout(timer);
        };
    }, [search]);

    /* =========================
       SEARCH USERS
    ========================= */

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

            setUsers(
                response.data.users
            );

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


    /* =========================
       INITIALS
    ========================= */

    const getInitials = (
        name: string
    ) => {

        return name
            .split(" ")
            .map(
                (word) =>
                    word.charAt(0)
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();

    };


    return (

        <div
            className="
                absolute
                inset-0
                z-50
                flex
                flex-col
                bg-background
            "
        >

            {/* =========================
                HEADER
            ========================= */}

            <div
                className="
                    flex
                    items-center
                    gap-2
                    border-b
                    p-3
                "
            >

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full"
                    onClick={onClose}
                    aria-label="Close user search"
                >
                    <ArrowLeft className="size-4" />
                </Button>


                <div className="relative flex-1">

                    <Search
                        className="
                            absolute
                            left-3
                            top-1/2
                            size-4
                            -translate-y-1/2
                            text-muted-foreground
                        "
                    />

                    <Input
                        autoFocus
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search people..."
                        className="pl-9"
                    />

                </div>

            </div>


            {/* =========================
                        placeholder="Search people..."
                        className="pl-9"
                    />

                </div>

            </div>


            {/* =========================
                RESULTS
            ========================= */}

            <ScrollArea className="flex-1">

                <div className="p-2">

                    {/* LOADING */}

                    {loading && (

                        <div
                            className="
                                flex
                                items-center
                                justify-center
                                gap-2
                                py-8
                                text-sm
                                text-muted-foreground
                            "
                        >

                            <Loader2
                                className="
                                    size-4
                                    animate-spin
                                "
                            />

                            Searching...

                        </div>

                    )}


                    {/* EMPTY QUERY */}

                    {!loading &&
                        !query.trim() && (

                            <div
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    px-6
                                    py-12
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
                                    Find someone to chat with
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Search by name or email.
                                </p>

                            </div>

                        )}


                    {/* NO RESULTS */}

                    {!loading &&
                        query.trim() &&
                        users.length === 0 && (

                            <div
                                className="
                                    px-6
                                    py-12
                                    text-center
                                "
                            >

                                <p className="text-sm font-medium">
                                    No users found
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Try another name or email.
                                </p>

                            </div>

                        )}


                    {/* USERS */}

                    {!loading &&
                        users.map((user) => (

                            <button
                                key={user.id}
                                type="button"
                                onClick={() =>
                                    onSelectUser(user)
                                }
                                className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    p-3
                                    text-left
                                    transition-colors
                                    hover:bg-muted/60
                                "
                            >

                                {/* AVATAR */}

                                <Avatar className="size-10 shrink-0">

                                    <AvatarImage
                                        src={
                                            user.avatar ??
                                            undefined
                                        }
                                        alt={user.name}
                                    />

                                    <AvatarFallback>
                                        {getInitials(
                                            user.name
                                        )}
                                    </AvatarFallback>

                                </Avatar>


                                {/* USER INFO */}

                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-medium">
                                        {user.name}
                                    </p>

                                    <p className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </p>

                                </div>

                            </button>

                        ))}

                </div>

            </ScrollArea>

        </div>

    );
}


export default UserSearch;