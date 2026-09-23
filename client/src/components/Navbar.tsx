import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProfileDialog from "./ProfileDialog";
import { useState } from "react";
import type {
    AppDispatch,
    RootState,
} from "../app/store";

import {
    logout,
} from "../features/auth/authSlice";

import api from "../api/axios";

import {
    LogOut,
    User,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


function Navbar() {
    const [profileOpen, setProfileOpen] =
    useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { user } = useSelector(
        (state: RootState) => state.auth
    );


    /* =========================
       LOGOUT
    ========================= */

    const handleLogout = async () => {

        try {

            await api.post("/auth/logout");

        } catch (error) {

            console.error(
                "Logout failed:",
                error
            );

        } finally {

            dispatch(logout());

            navigate("/login");

        }

    };


    /* =========================
       USER INITIALS
    ========================= */

    const initials =
        user?.name
            ?.split(" ")
            .map(
                (word) =>
                    word.charAt(0)
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";


    return (

        <nav
            className="
                flex
                h-16
                shrink-0
                items-center
                justify-between
                border-b
                bg-background
                px-6
            "
        >

            {/* =========================
                LOGO
            ========================= */}

            <div className="flex items-center gap-2">

                <div
                    className="
                        flex
                        size-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-primary
                        text-sm
                        font-bold
                        text-primary-foreground
                    "
                >
                    C
                </div>

                <h1 className="text-lg font-semibold tracking-tight">
                    ChatFlow
                </h1>

            </div>


            {/* =========================
                PROFILE
            ========================= */}

            {user && (

                <>

                <DropdownMenu>

                    <DropdownMenuTrigger>

                        <div
                            className="
                                flex
                                h-auto
                                gap-3
                                rounded-xl
                                px-2
                                py-1.5
                            "
                        >

                            <div className="hidden text-right sm:block">

                                <p className="text-sm font-medium">
                                    {user.name}
                                </p>

                                <p className="max-w-45 truncate text-xs text-muted-foreground">
                                    {user.email}
                                </p>

                            </div>


                            <Avatar className="size-9">

                                <AvatarImage
                                    src={
                                        user.avatar ??
                                        undefined
                                    }
                                    alt={user.name}
                                />

                                <AvatarFallback>
                                    {initials}
                                </AvatarFallback>

                            </Avatar>

                        </div>

                    </DropdownMenuTrigger>


                    {/* =========================
                        DROPDOWN
                    ========================= */}

                    <DropdownMenuContent
                        align="end"
                        className="w-64"
                    >

                        <DropdownMenuLabel>

                            <div className="flex items-center gap-3">

                                <Avatar className="size-10">

                                    <AvatarImage
                                        src={
                                            user.avatar ??
                                            undefined
                                        }
                                        alt={user.name}
                                    />

                                    <AvatarFallback>
                                        {initials}
                                    </AvatarFallback>

                                </Avatar>


                                <div className="min-w-0">

                                    <p className="truncate text-sm font-medium">
                                        {user.name}
                                    </p>

                                    <p className="truncate text-xs font-normal text-muted-foreground">
                                        {user.email}
                                    </p>

                                </div>

                            </div>

                        </DropdownMenuLabel>


                        <DropdownMenuSeparator />


                        <DropdownMenuItem
                            onClick={() => setProfileOpen(true)}
                        >
                            <User className="size-4" />
                            Profile
                        </DropdownMenuItem>


                        <DropdownMenuSeparator />


                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-destructive focus:text-destructive"
                        >
                            <LogOut className="size-4" />
                            Logout
                        </DropdownMenuItem>

                    </DropdownMenuContent>

                </DropdownMenu>

                <ProfileDialog
                    user={user}
                    open={profileOpen}
                    onOpenChange={setProfileOpen}
                />

                </>

            )}

        </nav>

    );
}


export default Navbar;