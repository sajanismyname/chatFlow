import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type {
    AppDispatch,
    RootState,
} from "../app/store";
import { login } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

function Login() {

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { loading, error } = useSelector(
        (state: RootState) => state.auth as {
            loading: boolean;
            error: string | null;
        }
    );

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    /* =========================
       LOGIN
    ========================= */

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        const result = await dispatch(
            login({
                email,
                password,
            })
        );

        if (login.fulfilled.match(result)) {
            navigate("/");
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
                text-foreground
                transition-colors
            "
        >

            <div
                className="
                    w-full
                    max-w-md
                    rounded-2xl
                    border
                    border-border
                    bg-card
                    p-8
                    shadow-lg
                "
            >

                {/* =========================
                    HEADER
                ========================= */}

                <div className="mb-8 text-center">

                    <h1 className="text-3xl font-bold">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Sign in to your ChatFlow account
                    </p>

                </div>


                {/* =========================
                    ERROR
                ========================= */}

                {error && (

                    <div
                        className="
                            mb-4
                            rounded-lg
                            border
                            border-destructive/20
                            bg-destructive/10
                            px-4
                            py-3
                            text-sm
                            text-destructive
                        "
                        role="alert"
                    >
                        {error}
                    </div>

                )}


                {/* =========================
                    FORM
                ========================= */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* EMAIL */}

                    <div>

                        <label
                            htmlFor="login-email"
                            className="
                                mb-2
                                block
                                text-sm
                                font-medium
                            "
                        >
                            Email
                        </label>

                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="you@example.com"
                            className="
                                w-full
                                rounded-lg
                                border
                                border-input
                                bg-background
                                px-4
                                py-3
                                text-foreground
                                outline-none
                                placeholder:text-muted-foreground
                                focus:border-ring
                                focus:ring-2
                                focus:ring-ring/30
                            "
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div>

                        <label
                            htmlFor="login-password"
                            className="
                                mb-2
                                block
                                text-sm
                                font-medium
                            "
                        >
                            Password
                        </label>

                        <input
                            id="login-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="••••••••"
                            className="
                                w-full
                                rounded-lg
                                border
                                border-input
                                bg-background
                                px-4
                                py-3
                                text-foreground
                                outline-none
                                placeholder:text-muted-foreground
                                focus:border-ring
                                focus:ring-2
                                focus:ring-ring/30
                            "
                            required
                        />

                    </div>


                    {/* SUBMIT */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            rounded-lg
                            bg-primary
                            py-3
                            font-medium
                            text-primary-foreground
                            transition-colors
                            hover:bg-primary/90
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in"}
                    </button>

                </form>


                {/* =========================
                    DIVIDER
                ========================= */}

                <div className="my-6 flex items-center gap-4">

                    <div className="h-px flex-1 bg-border" />

                    <span className="text-sm text-muted-foreground">
                        OR
                    </span>

                    <div className="h-px flex-1 bg-border" />

                </div>


                {/* =========================
                    GOOGLE LOGIN
                ========================= */}

                <button
                    type="button"
                    onClick={() => {
                        window.location.href =
                            "http://localhost:5000/api/auth/google";
                    }}
                    className="
                        w-full
                        rounded-lg
                        border
                        border-input
                        bg-background
                        py-3
                        font-medium
                        text-foreground
                        transition-colors
                        hover:bg-accent
                        hover:text-accent-foreground
                    "
                >
                    Continue with Google
                </button>


                {/* =========================
                    REGISTER
                ========================= */}

                <p
                    className="
                        mt-6
                        text-center
                        text-sm
                        text-muted-foreground
                    "
                >
                    Don't have an account?{" "}

                    <a
                        href="/register"
                        className="
                            font-medium
                            text-foreground
                            hover:underline
                        "
                    >
                        Create one
                    </a>

                </p>

            </div>

        </div>
    );
}

export default Login;