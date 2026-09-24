import {
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    ArrowLeft,
    Lock,
    Loader2,
} from "lucide-react";

import api from "../api/axios";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Input,
} from "@/components/ui/input";

import {
    Button,
} from "@/components/ui/button";

import {
    Label,
} from "@/components/ui/label";


function ResetPassword() {

    const navigate = useNavigate();

    const [searchParams] =
        useSearchParams();


    /* =========================
       RESET TOKEN
    ========================= */

    const token =
        searchParams.get("token");


    /* =========================
       STATE
    ========================= */

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    /* =========================
       SUBMIT
    ========================= */

    const handleSubmit = async (
        event: React.FormEvent
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        /* =========================
           TOKEN CHECK
        ========================= */

        if (!token) {

            setError(
                "Invalid password reset link."
            );

            return;

        }


        /* =========================
           PASSWORD CHECK
        ========================= */

        if (!password) {

            setError(
                "Please enter a new password."
            );

            return;

        }


        if (password.length < 8) {

            setError(
                "Password must be at least 8 characters."
            );

            return;

        }


        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;

        }


        try {

            setLoading(true);


            await api.post(
                "/auth/reset-password",
                {
                    token,
                    password,
                }
            );


            setSuccess(
                "Password reset successfully. You can now log in."
            );


            /*
             * Give the user a moment to see
             * the success message before
             * going to login.
             */

            setTimeout(() => {

                navigate("/login");

            }, 1500);


        } catch (error: any) {

            setError(
                error.response?.data?.message ||
                "Failed to reset password."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div
            className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-background
                px-4
            "
        >

            <Card className="w-full max-w-md">

                <CardHeader className="space-y-3">

                    <div
                        className="
                            flex
                            size-12
                            items-center
                            justify-center
                            rounded-full
                            bg-muted
                        "
                    >
                        <Lock className="size-5" />
                    </div>


                    <div>

                        <CardTitle className="text-2xl">
                            Reset your password
                        </CardTitle>

                        <CardDescription className="mt-2">
                            Enter a new password for
                            your account.
                        </CardDescription>

                    </div>

                </CardHeader>


                <CardContent>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* =========================
                            NEW PASSWORD
                        ========================= */}

                        <div className="space-y-2">

                            <Label htmlFor="password">
                                New password
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                disabled={loading}
                                autoComplete="new-password"
                            />

                            <p className="text-xs text-muted-foreground">
                                Password must be at least
                                8 characters.
                            </p>

                        </div>


                        {/* =========================
                            CONFIRM PASSWORD
                        ========================= */}

                        <div className="space-y-2">

                            <Label htmlFor="confirmPassword">
                                Confirm password
                            </Label>

                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                disabled={loading}
                                autoComplete="new-password"
                            />

                        </div>


                        {/* =========================
                            ERROR
                        ========================= */}

                        {error && (

                            <div
                                className="
                                    rounded-md
                                    border
                                    border-destructive/30
                                    bg-destructive/10
                                    px-3
                                    py-2
                                    text-sm
                                    text-destructive
                                "
                            >
                                {error}
                            </div>

                        )}


                        {/* =========================
                            SUCCESS
                        ========================= */}

                        {success && (

                            <div
                                className="
                                    rounded-md
                                    border
                                    border-green-500/30
                                    bg-green-500/10
                                    px-3
                                    py-2
                                    text-sm
                                    text-green-700
                                    dark:text-green-400
                                "
                            >
                                {success}
                            </div>

                        )}


                        {/* =========================
                            RESET BUTTON
                        ========================= */}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >

                            {loading ? (

                                <>
                                    <Loader2
                                        className="
                                            mr-2
                                            size-4
                                            animate-spin
                                        "
                                    />

                                    Resetting...

                                </>

                            ) : (

                                "Reset password"

                            )}

                        </Button>


                        {/* =========================
                            BACK TO LOGIN
                        ========================= */}

                        <div className="flex justify-center">

                            <Link
                                to="/login"
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    text-sm
                                    text-muted-foreground
                                    transition-colors
                                    hover:text-foreground
                                "
                            >

                                <ArrowLeft className="size-4" />

                                Back to login

                            </Link>

                        </div>

                    </form>

                </CardContent>

            </Card>

        </div>

    );

}


export default ResetPassword;