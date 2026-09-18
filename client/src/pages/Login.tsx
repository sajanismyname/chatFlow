function Login() {
    const handleGoogleLogin = () => {
        window.location.href =
            "http://localhost:5000/api/auth/google";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
                <h1 className="mb-2 text-2xl font-bold">
                    Welcome to ChatFlow
                </h1>

                <p className="mb-6 text-gray-500">
                    Sign in to continue
                </p>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full rounded-lg border px-4 py-3 font-medium transition hover:bg-gray-50"
                >
                    Continue with Google
                </button>
            </div>
        </div>
    );
}

export default Login;