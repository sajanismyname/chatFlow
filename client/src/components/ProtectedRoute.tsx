import { Navigate } from "react-router-dom";

import {
    Loader2,
} from "lucide-react";

import {
    useAppSelector,
} from "../app/hooks";


interface ProtectedRouteProps {
    children: React.ReactNode;
}


function ProtectedRoute({
    children,
}: ProtectedRouteProps) {

    const {
        isAuthenticated,
        initialized,
    } = useAppSelector(
        (state) => state.auth
    );


    /* =========================
       AUTH INITIALIZATION
    ========================= */

    if (!initialized) {

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

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-3
                    "
                >

                    <Loader2
                        className="
                            size-6
                            animate-spin
                            text-muted-foreground
                        "
                    />

                    <p className="text-sm text-muted-foreground">
                        Checking your session...
                    </p>

                </div>

            </div>

        );
    }


    /* =========================
       NOT AUTHENTICATED
    ========================= */

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    /* =========================
       AUTHENTICATED
    ========================= */

    return <>{children}</>;

}


export default ProtectedRoute;