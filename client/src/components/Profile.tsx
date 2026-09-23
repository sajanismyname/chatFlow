import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    useAppDispatch,
    useAppSelector,
} from "@/app/hooks";

import {
    updateProfileThunk,
} from "@/features/auth/authSlice";

import {
    ArrowLeft,
    Camera,
    Save,
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
    Label,
} from "@/components/ui/label";

import type { SubmitEvent } from "react";


function Profile() {

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const {
        user,
        loading,
        error,
    } = useAppSelector(
        (state) => state.auth
    );


    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");


    /* =========================
       LOAD USER DATA
    ========================= */

    useEffect(() => {

        if (user) {

            setName(user.name);
            setAvatar(user.avatar ?? "");

        }

    }, [user]);


    /* =========================
       INITIALS
    ========================= */

    const initials =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => word.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";


    /* =========================
       SAVE PROFILE
    ========================= */

    const handleSave = async (
        event: SubmitEvent
    ) => {

        event.preventDefault();

        if (!name.trim()) {
            return;
        }

        try {

            await dispatch(
                updateProfileThunk({
                    name: name.trim(),
                    avatar: avatar.trim() || null,
                })
            ).unwrap();

        } catch (error) {

            console.error(
                "Failed to update profile:",
                error
            );

        }

    };


    /* =========================
       NO USER
    ========================= */

    if (!user) {

        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">
                    User not found.
                </p>
            </div>
        );

    }


    return (

        <div className="min-h-screen bg-background">

            {/* =========================
                HEADER
            ========================= */}

            <header
                className="
                    flex
                    h-16
                    items-center
                    border-b
                    bg-background
                    px-6
                "
            >

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft className="size-5" />
                </Button>


                <div className="ml-3">

                    <h1 className="text-lg font-semibold">
                        Profile
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage your account information
                    </p>

                </div>

            </header>


            {/* =========================
                CONTENT
            ========================= */}

            <main
                className="
                    mx-auto
                    w-full
                    max-w-2xl
                    px-6
                    py-10
                "
            >

                <div
                    className="
                        rounded-xl
                        border
                        bg-card
                        p-6
                        shadow-sm
                    "
                >

                    {/* =========================
                        TITLE
                    ========================= */}

                    <div className="mb-8">

                        <h2 className="text-xl font-semibold">
                            Profile information
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Update your personal information and profile picture.
                        </p>

                    </div>


                    {/* =========================
                        AVATAR
                    ========================= */}

                    <div className="mb-8 flex justify-center">

                        <div className="relative">

                            <Avatar className="size-28">

                                <AvatarImage
                                    src={
                                        avatar ||
                                        undefined
                                    }
                                    alt={name}
                                />

                                <AvatarFallback className="text-3xl">
                                    {initials}
                                </AvatarFallback>

                            </Avatar>


                            <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="
                                    absolute
                                    bottom-0
                                    right-0
                                    size-9
                                    rounded-full
                                    border-2
                                    border-background
                                "
                                onClick={() => {
                                    // Image upload will be added later
                                }}
                            >
                                <Camera className="size-4" />
                            </Button>

                        </div>

                    </div>


                    {/* =========================
                        FORM
                    ========================= */}

                    <form
                        onSubmit={handleSave}
                        className="space-y-6"
                    >

                        {/* NAME */}

                        <div className="space-y-2">

                            <Label htmlFor="profile-name">
                                Name
                            </Label>

                            <Input
                                id="profile-name"
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value
                                    )
                                }
                                placeholder="Your name"
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="space-y-2">

                            <Label htmlFor="profile-email">
                                Email
                            </Label>

                            <Input
                                id="profile-email"
                                value={user.email}
                                disabled
                            />

                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed.
                            </p>

                        </div>


                        {/* AVATAR URL */}

                        <div className="space-y-2">

                            <Label htmlFor="profile-avatar">
                                Avatar URL
                            </Label>

                            <Input
                                id="profile-avatar"
                                value={avatar}
                                onChange={(event) =>
                                    setAvatar(
                                        event.target.value
                                    )
                                }
                                placeholder="https://example.com/avatar.jpg"
                            />

                        </div>


                        {/* ERROR */}

                        {error && (

                            <p className="text-sm text-destructive">
                                {error}
                            </p>

                        )}


                        {/* SAVE */}

                        <div className="flex justify-end">

                            <Button
                                type="submit"
                                disabled={
                                    loading ||
                                    !name.trim()
                                }
                            >

                                <Save className="size-4" />

                                {loading
                                    ? "Saving..."
                                    : "Save changes"}

                            </Button>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
}


export default Profile;