import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/auth/callback"
                    element={<AuthCallback />}
                />

                <Route
                    path="/"
                    element={<h1>ChatFlow</h1>}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;