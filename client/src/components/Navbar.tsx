import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";

function Navbar() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { user } = useSelector(
        (state: RootState) => state.auth
    );

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <nav className="h-16 border-b bg-white px-6 flex items-center justify-between">

            {/* Logo */}
            <div>
                <h1 className="text-xl font-bold">
                    ChatFlow
                </h1>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3">

                <div className="text-right">
                    <p className="text-sm font-medium">
                        {user?.name}
                    </p>

                    <p className="text-xs text-gray-500">
                        {user?.email}
                    </p>
                </div>

                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">

                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="font-semibold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    )}

                </div>

                <button
                    onClick={handleLogout}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;