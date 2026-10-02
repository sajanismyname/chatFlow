import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    ArrowLeft,
    Mail,
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


function ForgotPassword() {

    const [email, setEmail] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [remainingSeconds, setRemainingSeconds] =
        useState(0);


    /*
     * Countdown
     */
    useEffect(() => {

        if (remainingSeconds <= 0) {
            return;
        }

        const timer =
            window.setInterval(() => {

                setRemainingSeconds(
                    (seconds) =>
                        Math.max(
                            0,
                            seconds - 1
                        )
                );

            }, 1000);

        return () => {
            window.clearInterval(timer);
        };

    }, [remainingSeconds]);


    /*
     * Format countdown as MM:SS
     */
    const formatCountdown = (
        totalSeconds: number
    ) => {

        const minutes =
            Math.floor(
                totalSeconds / 60
            );

        const seconds =
            totalSeconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };


    const handleSubmit = async (
        event: React.FormEvent
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        if (!email.trim()) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        /*
         * Frontend convenience check.
         *
         * Backend remains the real protection.
         */
        if (remainingSeconds > 0) {

            setError(
                `Please wait ${formatCountdown(
                    remainingSeconds
                )} before requesting another reset link.`
            );

            return;
        }


        try {

            setLoading(true);


            const response =
                await api.post(
                    "/auth/forgot-password",
                    {
                        email:
                            email
                                .trim()
                                .toLowerCase(),
                    }
                );


            setSuccess(
                response.data.message
            );


            /*
             * Start the 30-minute countdown
             * after a successful request.
             */
            if (
                response.data
                    .retryAfterSeconds
            ) {

                setRemainingSeconds(
                    response.data
                        .retryAfterSeconds
                );
            }


        } catch (error: any) {

            const retryAfterSeconds =
                error.response?.data
                    ?.retryAfterSeconds;


            /*
             * Backend rate limit.
             */
            if (
                error.response?.status ===
                    429 &&
                retryAfterSeconds
            ) {

                setRemainingSeconds(
                    retryAfterSeconds
                );

                setError(
                    `Please wait ${formatCountdown(
                        retryAfterSeconds
                    )} before requesting another reset link.`
                );

            } else {

                setError(
                    error.response?.data
                        ?.message ||
                    "Unable to process your request."
                );
            }

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
                        <Mail className="size-5" />
                    </div>


                    <div>

                        <CardTitle className="text-2xl">
                            Forgot password?
                        </CardTitle>

                        <CardDescription className="mt-2">
                            Enter your email address and
                            we'll send you a password
                            reset link.
                        </CardDescription>

                    </div>

                </CardHeader>


                <CardContent>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div className="space-y-2">

                            <Label htmlFor="email">
                                Email
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                disabled={loading}
                                autoComplete="email"
                            />

                        </div>


                        {/* RATE LIMIT / ERROR */}

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


                        {/* SUCCESS */}

                        {success && !error && (

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
                                <p>
                                    {success}
                                </p>

                                {remainingSeconds > 0 && (

                                    <p className="mt-1">
                                        You can request
                                        another reset link
                                        in{" "}
                                        <strong>
                                            {formatCountdown(
                                                remainingSeconds
                                            )}
                                        </strong>
                                        .
                                    </p>

                                )}

                            </div>

                        )}


                        <Button
                            type="submit"
                            className="w-full"
                            disabled={
                                loading ||
                                remainingSeconds > 0
                            }
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

                                    Sending...
                                </>

                            ) : remainingSeconds > 0 ? (

                                `Try again in ${formatCountdown(
                                    remainingSeconds
                                )}`

                            ) : (

                                "Send reset link"

                            )}

                        </Button>


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


export default ForgotPassword;