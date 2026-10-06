import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    useAppDispatch,
    useAppSelector,
} from "@/app/hooks";

import {
    updateProfileThunk,
    deleteAccountThunk,
} from "@/features/auth/authSlice";
import { disconnectSocket } from "@/socket/socket";
import api from "@/api/axios";

import {
    ArrowLeft,
    Camera,
    Save,
    Trash2,
    AlertTriangle,
    Loader2,
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const avatarInputRef =
        useRef<HTMLInputElement>(null);

    const handleDeleteAccount = async () => {
        if (confirmText !== "DELETE") return;
        setIsDeleting(true);
        try {
            disconnectSocket();
            await dispatch(deleteAccountThunk()).unwrap();
            navigate("/login", { replace: true });
        } catch (err: any) {
            window.alert(err || "Failed to delete account");
            setIsDeleting(false);
        }
    };


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
            .map((word) =>
                word.charAt(0)
            )
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
                    avatar:
                        avatar.trim() || null,
                })
            ).unwrap();

            navigate("/", { replace: true });

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
                    aria-label="Go back"
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

                    <div className="mb-8">

                        <h2 className="text-xl font-semibold">
                            Profile information
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Update your personal information
                            and profile picture.
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

                                <AvatarFallback
                                    className="text-3xl"
                                >
                                    {initials}
                                </AvatarFallback>

                            </Avatar>


                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                aria-label="Choose profile picture"
                                onChange={async (event) => {

                                    const file =
                                        event.target.files?.[0];

                                    if (!file) {
                                        return;
                                    }


                                    if (
                                        file.size >
                                        2 * 1024 * 1024
                                    ) {

                                        window.alert(
                                            "Please choose an image smaller than 2 MB."
                                        );

                                        event.target.value = "";

                                        return;
                                    }


                                    try {
                                        const formData = new FormData();
                                        formData.append("file", file);

                                        const response = await api.post<{
                                            url: string;
                                        }>("/uploads", formData);

                                        setAvatar(response.data.url);
                                    } catch (error: any) {
                                        window.alert(
                                            error.response?.data?.message ||
                                            "Failed to upload profile picture."
                                        );
                                    }

                                }}
                            />


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
                                onClick={() =>
                                    avatarInputRef
                                        .current
                                        ?.click()
                                }
                                aria-label="Change profile picture"
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
                                name="name"
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
                                name="email"
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
                                name="avatar"
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

                {/* =========================
                    DANGER ZONE
                ========================= */}
                <div className="mt-8 rounded-xl border border-destructive/20 bg-destructive/5 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-destructive">
                                Delete Account
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Permanently delete your ChatFlow account, profile, conversations, and all message history. This action cannot be undone.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                setShowDeleteModal(true);
                                setConfirmText("");
                            }}
                            className="shrink-0"
                        >
                            <Trash2 className="size-4 mr-2" />
                            <span>Delete Account</span>
                        </Button>
                    </div>
                </div>

                {/* =========================
                    DELETE ACCOUNT MODAL
                ========================= */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in-0 zoom-in-95 duration-150">
                            <div className="flex items-center gap-3 text-destructive">
                                <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                                    <AlertTriangle className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Delete Account?</h3>
                                    <p className="text-xs text-muted-foreground">This action is permanent and irreversible</p>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Are you absolutely sure you want to delete your account? All your messages, profile information, and chat history will be permanently erased.
                            </p>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground block">
                                    Type <span className="font-bold text-foreground select-all">DELETE</span> to confirm:
                                </label>
                                <Input
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    className="border-destructive/30 focus-visible:ring-destructive font-mono"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setConfirmText("");
                                    }}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={confirmText !== "DELETE" || isDeleting}
                                    onClick={handleDeleteAccount}
                                >
                                    {isDeleting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="animate-spin size-4" />
                                            Deleting...
                                        </span>
                                    ) : (
                                        "Permanently Delete"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            </main>

        </div>

    );
}


export default Profile;