import {
    Moon,
    Sun,
} from "lucide-react";

import {
    useTheme,
} from "@/components/ThemeProvider";


function ThemeToggle() {

    const {
        theme,
        toggleTheme,
    } = useTheme();


    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${
                theme === "light"
                    ? "dark"
                    : "light"
            } mode`}
            className="
                relative
                flex
                h-9
                w-17
                items-center
                rounded-full
                border
                bg-muted
                p-1
                transition-colors
                hover:bg-muted/80
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
            "
        >

            {/* Sun */}

            <Sun
                className="
                    absolute
                    left-1.5
                    size-4
                    text-muted-foreground
                "
            />


            {/* Moon */}

            <Moon
                className="
                    absolute
                    right-1.5
                    size-4
                    text-muted-foreground
                "
            />


            {/* Sliding knob */}

            <span
                className={`
                    relative
                    z-10
                    flex
                    size-7
                    items-center
                    justify-center
                    rounded-full
                    bg-background
                    shadow-sm
                    transition-transform
                    duration-200
                    ${
                        theme === "dark"
                            ? "translate-x-8"
                            : "translate-x-0"
                    }
                `}
            >

                {theme === "light" ? (
                    <Sun className="size-3.5" />
                ) : (
                    <Moon className="size-3.5" />
                )}

            </span>

        </button>
    );
}


export default ThemeToggle;