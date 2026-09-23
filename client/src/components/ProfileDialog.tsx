import { useEffect, useState } from "react";
import { Camera } from "lucide-react";

import type { User } from "@/features/auth/authTypes";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    Button,
} from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Input,
} from "@/components/ui/input";

import {
    Label,
} from "@/components/ui/label";


interface ProfileDialogProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}


function ProfileDialog({
    user,
    open,
    onOpenChange,
}: ProfileDialogProps) {

    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(
        user.avatar ?? ""
    );

    const [loading, setLoading] = useState(false);


    /* =========================
       SYNC USER DATA
    ========================= */

    useEffect(() => {

        setName(user.name);
        setAvatar(user.avatar ?? "");

    }, [user]);


    /* =========================
       INITIALS
    ========================= */

    const initials =
        name
            ?.split(" ")
            .map(
                (word) =>
                    word.charAt(0)
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";


    /* =========================
       SAVE PROFILE
    ========================= */

    const handleSave = async () => {

        if (!name.trim()) {
            return;
        }

        try {

            setLoading(true);

            /*
             * We'll connect this to:
             *
             * PUT /api/users/profile
             *
             * once the backend endpoint
             * is ready.
             */

            console.log({
                name: name.trim(),
                avatar: avatar.trim() || null,
            });

            onOpenChange(false);

        } catch (error) {

            console.error(
                "Failed to update profile:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >

            <DialogContent className="sm:max-w-md">

                <DialogHeader>

                    <DialogTitle>
                        Edit profile
                    </DialogTitle>

                    <DialogDescription>
                        Update your ChatFlow profile information.
                    </DialogDescription>

                </DialogHeader>


                {/* =========================
                    AVATAR
                ========================= */}

                <div className="flex justify-center py-4">

                    <div className="relative">

                        <Avatar className="size-24">

                            <AvatarImage
                                src={
                                    avatar ||
                                    undefined
                                }
                                alt={name}
                            />

                            <AvatarFallback className="text-2xl">
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
                                size-8
                                rounded-full
                                border-2
                                border-background
                            "
                            onClick={() => {
                                // Avatar upload will be added later
                            }}
                        >
                            <Camera className="size-4" />
                        </Button>

                    </div>

                </div>


                {/* =========================
                    FORM
                ========================= */}

                <div className="space-y-4">

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
                            Email cannot be changed here.
                        </p>

                    </div>


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

                </div>


                {/* =========================
                    ACTIONS
                ========================= */}

                <DialogFooter>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            onOpenChange(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={
                            loading ||
                            !name.trim()
                        }
                    >
                        {loading
                            ? "Saving..."
                            : "Save changes"}
                    </Button>

                </DialogFooter>

            </DialogContent>

        </Dialog>

    );
}

export default ProfileDialog;