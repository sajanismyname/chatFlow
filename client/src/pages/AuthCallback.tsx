import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch } from "../app/hooks";
import { initializeAuth } from "../features/auth/authSlice";

function AuthCallback() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) {
            return;
        }

        hasInitialized.current = true;

        const authenticate = async () => {
            const result = await dispatch(initializeAuth());

            if (initializeAuth.fulfilled.match(result)) {
                navigate("/");
            } else {
                navigate("/login");
            }
        };

        authenticate();
    }, [dispatch, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <p className="text-gray-600">
                Signing you in...
            </p>
        </div>
    );
}

export default AuthCallback;