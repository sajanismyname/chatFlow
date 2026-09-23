import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks"; // Import your selector hook

function AuthCallback() {
    const navigate = useNavigate();

    // 1. Grab the global auth states instead of dispatching
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // 2. Wait until the initialization inside App.tsx finishes loading
        if (!loading) {
            if (isAuthenticated) {
                navigate("/", { replace: true });
            } else {
                navigate("/login", { replace: true });
            }
        }
    }, [isAuthenticated, loading, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <p className="text-gray-600 font-medium">
                Signing you in...
            </p>
        </div>
    );
}

export default AuthCallback;
