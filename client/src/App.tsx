import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Register from "./pages/Register";
import ChatFlow from "./pages/ChatFlow";

function App() {
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