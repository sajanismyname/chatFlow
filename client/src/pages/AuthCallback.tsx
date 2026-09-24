import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
    useAppDispatch,
    useAppSelector,
} from "../app/hooks";

import {
    initializeAuth,
} from "../features/auth/authSlice";


function AuthCallback() {

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const hasInitialized = useRef(false);

    const {
        initialized,
        isAuthenticated,
        loading,
    } = useAppSelector(
        (state) => state.auth
    );


    useEffect(() => {

        if (hasInitialized.current) {
            return;
        }

        hasInitialized.current = true;

        dispatch(initializeAuth());

    }, [dispatch]);


    useEffect(() => {

        if (!initialized || loading) {
            return;
        }

        if (isAuthenticated) {

            navigate("/", {
                replace: true,
            });

        } else {

            navigate("/login", {
                replace: true,
            });

        }

    }, [
        initialized,
        loading,
        isAuthenticated,
        navigate,
    ]);


    return (
        <div
            className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-background
            "
        >
            <p className="font-medium text-muted-foreground">
                Signing you in...
            </p>
        </div>
    );
}

export default AuthCallback;