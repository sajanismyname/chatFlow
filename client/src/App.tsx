import { useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import {
    useAppDispatch,
    useAppSelector,
} from "./app/hooks";

import {
    initializeAuth,
} from "./features/auth/authSlice";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import ChatFlow from "./pages/ChatFlow";
import Profile from "./components/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


function App() {

    const dispatch = useAppDispatch();

    const initialized = useAppSelector(
        (state) => state.auth.initialized
    );


    useEffect(() => {

        // Do NOT initialize here when Google redirects
        // to /auth/callback.
        if (
            window.location.pathname ===
            "/auth/callback"
        ) {
            return;
        }

        dispatch(initializeAuth());

    }, [dispatch]);


    return (
        <BrowserRouter>

            {!initialized &&
            window.location.pathname !== "/auth/callback" ? (

                <div className="flex min-h-screen items-center justify-center">
                    <p>Loading...</p>
                </div>

            ) : (

                <Routes>

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                    />

                    <Route
                        path="/auth/callback"
                        element={<AuthCallback />}
                    />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <ChatFlow />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>

            )}

        </BrowserRouter>
    );
}

export default App;