import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "./app/hooks";
import { initializeAuth } from "./features/auth/authSlice";

import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Register from "./pages/Register";
import ChatFlow from "./pages/ChatFlow";

function App() {
    const dispatch = useAppDispatch();

    const initialized = useAppSelector(
        (state) => state.auth.initialized
    );

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <BrowserRouter>
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
                    path="/auth/callback"
                    element={<AuthCallback />}
                />

                <Route
                    path="/"
                    element={<ChatFlow />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;