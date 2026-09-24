import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { register } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function Register() {

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { loading, error } = useSelector(
        (state: RootState) => state.auth
    );

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);


    /* =========================
       REGISTER
    ========================= */

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        const result = await dispatch(
            register({
                name,
                email,
                password,
            })
        );

        if (register.fulfilled.match(result)) {
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

                    <h1 className="text-3xl font-bold text-foreground">
                        Create your account
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Join ChatFlow today
                    </p>

                </div>


                {/* =========================
                    ERROR
                ========================= */}

                {error && (

                    <div
                        role="alert"
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
                    >
                        {error}
                    </div>

                )}


                {/* =========================
                    REGISTER FORM
                ========================= */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* NAME */}

                    <div className="space-y-2">

                        <label
                            htmlFor="register-name"
                            className="
                                text-sm
                                font-medium
                                text-foreground
                            "
                        >
                            Name
                        </label>

                        <input
                            id="register-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Your name"
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
                                focus:ring-ring/20
                            "
                            required
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="space-y-2">

                        <label
                            htmlFor="register-email"
                            className="
                                text-sm
                                font-medium
                                text-foreground
                            "
                        >
                            Email
                        </label>

                        <input
                            id="register-email"
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
                                focus:ring-ring/20
                            "
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="space-y-2">

                        <label
                            htmlFor="register-password"
                            className="
                                text-sm
                                font-medium
                                text-foreground
                            "
                        >
                            Password
                        </label>

                        <div className="relative">

                            <input
                                id="register-password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                autoComplete="new-password"
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
                                    pr-12
                                    text-foreground
                                    outline-none
                                    placeholder:text-muted-foreground
                                    focus:border-ring
                                    focus:ring-2
                                    focus:ring-ring/20
                                "
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (prev) => !prev
                                    )
                                }
                                className="
                                    absolute
                                    right-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-muted-foreground
                                    hover:text-foreground
                                "
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>

                        </div>

                    </div>


                    {/* =========================
                        SUBMIT
                    ========================= */}

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
                            ? "Creating account..."
                            : "Create account"}
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
                    GOOGLE
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
                        border-border
                        bg-background
                        py-3
                        font-medium
                        text-foreground
                        transition-colors
                        hover:bg-muted
                    "
                >
                    Continue with Google
                </button>


                {/* =========================
                    LOGIN LINK
                ========================= */}

                <p
                    className="
                        mt-6
                        text-center
                        text-sm
                        text-muted-foreground
                    "
                >
                    Already have an account?{" "}

                    <a
                        href="/login"
                        className="
                            font-medium
                            text-foreground
                            hover:underline
                        "
                    >
                        Sign in
                    </a>

                </p>

            </div>

        </div>
    );
}

export default Register;