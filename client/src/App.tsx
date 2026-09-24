import { useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
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
import Profile from "./components/Profile"

import ProtectedRoute from "./components/ProtectedRoute";


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
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }


    return (

        <BrowserRouter>

            <Routes>

                {/* =========================
                    AUTH
                ========================= */}

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


                {/* =========================
                    CHAT
                ========================= */}

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <ChatFlow />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    PROFILE
                ========================= */}

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default App;