import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

function ProtectedRoute({
    children,
}: ProtectedRouteProps) {
    const { isAuthenticated, initialized } =
        useAppSelector((state) => state.auth);

    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;