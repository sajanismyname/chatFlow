import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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

interface User {
    id: number;
    name: string;
    avatar: string | null;
}

function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get(`/users/${id}/profile`);

                setUser(response.data.user);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUserProfile();
        }
    }, [id]);

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

                    <CardTitle>{user.name}'s Profile</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col items-center gap-4">
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
                </CardContent>
            </Card>
        </div>
    );
}

export default UserProfile;