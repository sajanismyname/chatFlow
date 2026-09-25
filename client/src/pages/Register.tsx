import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { register } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { registerSchema } from "../validators/authSchema";

function Register() {

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [validationError, setValidationError] =
    useState<string | null>(null);

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

    setValidationError(null);

    const result = registerSchema.safeParse({
        name,
        email,
        password,
    });

    if (!result.success) {

        setValidationError(
            result.error.issues[0]?.message ||
            "Please check your input"
        );

        return;
    }

    const response = await dispatch(
        register(result.data)
    );

    if (register.fulfilled.match(response)) {
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

                {(validationError || error) && (

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
                        {validationError || error}
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
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-3
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
                    {/* Google Logo */}
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            fill="#4285F4"
                            d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.92-4.18 2.92-7.4z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 21.82c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.75 9.75 0 0 0 12 21.82z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M6.54 13.91A5.86 5.86 0 0 1 6.23 12c0-.66.11-1.3.31-1.91V7.57H3.3A9.76 9.76 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.43l3.24-2.52z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 6.06c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.14 14.63 2.18 12 2.18a9.75 9.75 0 0 0-8.7 5.39l3.24 2.52C7.31 7.78 9.46 6.06 12 6.06z"
                        />
                    </svg>

                    <span>Continue with Google</span>
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