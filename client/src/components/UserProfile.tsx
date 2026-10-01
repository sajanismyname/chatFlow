import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import api from "../api/axios";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

interface User {
    id: number;
    name: string;
    avatar: string | null;
}

function UserProfile() {
    const {
        conversationId,
        id,
    } = useParams();

    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [nickname, setNickname] = useState("");
    const [editingNickname, setEditingNickname] = useState(false);
    const [loading, setLoading] = useState(true);
    const [savingNickname, setSavingNickname] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id || !conversationId) {
                return;
            }

            try {
                const [
                    profileResponse,
                    nicknameResponse,
                ] = await Promise.all([
                    api.get(`/users/${id}/profile`),

                    api.get(
                        `/users/${conversationId}/nickname/${id}`
                    ),
                ]);

                setUser(profileResponse.data.user);

                setNickname(
                    nicknameResponse.data.nickname ?? ""
                );
            } catch (error) {
                console.error(
                    "Failed to fetch user profile",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id, conversationId]);

    const handleSaveNickname = async () => {
        if (!conversationId || !id) {
            return;
        }

        if (!nickname.trim()) {
            return;
        }

        try {
            setSavingNickname(true);

            const response = await api.put(
                `/users/${conversationId}/nickname/${id}`,
                {
                    nickname: nickname.trim(),
                }
            );

            setNickname(response.data.nickname);
            setEditingNickname(false);
        } catch (error) {
            console.error(
                "Failed to update nickname",
                error
            );
        } finally {
            setSavingNickname(false);
        }
    };

    const handleDeleteNickname = async () => {
        if (!conversationId || !id) {
            return;
        }

        try {
            setSavingNickname(true);

            await api.delete(
                `/users/${conversationId}/nickname/${id}`
            );

            setNickname("");
            setEditingNickname(false);
        } catch (error) {
            console.error(
                "Failed to delete nickname",
                error
            );
        } finally {
            setSavingNickname(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">
                    User not found
                </p>

                <Button onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </div>
        );
    }

    const initials = user.name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mb-2 w-fit"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft />
                    </Button>

                    <CardTitle>
                        {user.name}'s Profile
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col items-center gap-6">
                    <Avatar className="size-24">
                        <AvatarImage
                            src={user.avatar ?? undefined}
                            alt={user.name}
                        />

                        <AvatarFallback className="text-xl">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="text-center">
                        <h2 className="text-xl font-semibold">
                            {user.name}
                        </h2>
                    </div>

                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                Nickname
                            </span>

                            {!editingNickname && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setEditingNickname(true)
                                    }
                                >
                                    <Pencil />
                                </Button>
                            )}
                        </div>

                        {editingNickname ? (
                            <div className="space-y-2">
                                <Input
                                    value={nickname}
                                    onChange={(event) =>
                                        setNickname(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter nickname"
                                    maxLength={50}
                                />

                                <div className="flex gap-2">
                                    <Button
                                        onClick={
                                            handleSaveNickname
                                        }
                                        disabled={
                                            savingNickname ||
                                            !nickname.trim()
                                        }
                                    >
                                        {savingNickname
                                            ? "Saving..."
                                            : "Save"}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setEditingNickname(
                                                false
                                            )
                                        }
                                        disabled={savingNickname}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : nickname ? (
                            <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
                                <span className="text-sm">
                                    {nickname}
                                </span>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={
                                        handleDeleteNickname
                                    }
                                    disabled={savingNickname}
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    setEditingNickname(true)
                                }
                            >
                                Add Nickname
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default UserProfile;