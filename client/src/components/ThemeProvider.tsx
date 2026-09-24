import {
    useContext,
    createContext,
    useState,
    type ReactNode,
    useEffect,
} from "react"

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);


interface ThemeProviderProps {
    children : ReactNode;
}

export const ThemeProvider = ({children}: ThemeProviderProps) =>{
    const [theme, setThemeState] = 
            useState<Theme>(() => {
                const savedTheme = localStorage.getItem("theme");

                return savedTheme === "dark"
                    ? "dark"
                    : "light";
            });

            useEffect(() =>{
                const root = document.documentElement;

                root.classList.remove(
                    "light",
                    "dark"
                )

                root.classList.add(theme);

                localStorage.setItem(
                    "theme",
                    theme
                )
            }, [theme])

            const setTheme = (newTheme: Theme) => {
                setThemeState(newTheme)
            }

            const toggleTheme = () => {
                setThemeState( (currentTheme) => 
                currentTheme === "light"
                    ? "dark"
                    : "light"
                )
            }

            return (
                <ThemeContext.Provider value= {{
                    theme,
                    setTheme,
                    toggleTheme
                }}>
                {children}
                </ThemeContext.Provider>
            )
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
}