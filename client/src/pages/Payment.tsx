import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";
import { useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";
import api from "../api/axios";
import type { PaymentInitiateResponse } from "../features/auth/authTypes";
import { CreditCard, LogOut, CheckCircle, ShieldCheck } from "lucide-react";

function Payment() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { isAuthenticated, initialized, user } = useAppSelector(
        (state) => state.auth
    );

    const [gateway, setGateway] = useState<"khalti" | "esewa">("esewa");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!initialized) return;

        if (!isAuthenticated) {
            navigate("/login", { replace: true });
            return;
        }

        // If user already paid, go straight to dashboard
        if (user && user.isPaid !== false) {
            navigate("/", { replace: true });
        }
    }, [initialized, isAuthenticated, user, navigate]);

    const handlePay = async () => {
        setError(null);
        setLoading(true);

        try {
            const response = await api.post<PaymentInitiateResponse>(
                "/auth/payment/initiate",
                { gateway }
            );

            const payload = response.data;

            if (payload.gateway === "esewa" && payload.params) {
                // Post form directly to eSewa epay portal
                const form = document.createElement("form");
                form.method = "POST";
                form.action = payload.paymentUrl;

                Object.entries(payload.params).forEach(([key, value]) => {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            } else if (payload.paymentUrl) {
                // If paymentUrl is on current origin (e.g. simulated payment during dev), navigate directly
                if (payload.paymentUrl.startsWith(window.location.origin)) {
                    const relativeUrl = payload.paymentUrl.slice(window.location.origin.length);
                    navigate(relativeUrl);
                } else {
                    // Redirect to external Khalti checkout
                    window.location.href = payload.paymentUrl;
                }
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to initiate payment. Please try again."
            );
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    if (!initialized || !user) {
        return null;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl space-y-6">
                {/* Header & User Info */}
                <div className="text-center space-y-2">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-16 w-16 rounded-full object-cover"
                            />
                        ) : (
                            <CreditCard size={32} />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Activate Your Account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Welcome, <span className="font-semibold text-foreground">{user.name}</span>!
                        A one-time registration fee is required to unlock full access to ChatFlow.
                    </p>
                </div>

                {/* Account details card */}
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium text-foreground">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600">
                            Payment Pending
                        </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border/50 pt-2">
                        <span className="text-muted-foreground">Registration Fee:</span>
                        <span className="text-base font-bold text-foreground">NPR 100</span>
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive text-center"
                    >
                        {error}
                    </div>
                )}

                {/* Gateway Selection */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                        Select Payment Gateway
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        {/* eSewa Option */}
                        <button
                            type="button"
                            onClick={() => setGateway("esewa")}
                            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${
                                gateway === "esewa"
                                    ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-2 ring-emerald-500/40"
                                    : "border-border bg-background hover:bg-accent"
                            }`}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#60BB46] text-white font-bold text-base shadow-sm">
                                e
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">eSewa</p>
                                <p className="text-[11px] text-muted-foreground">ePay Gateway</p>
                            </div>
                            {gateway === "esewa" && (
                                <CheckCircle size={16} className="text-emerald-500" />
                            )}
                        </button>

                        {/* Khalti Option */}
                        <button
                            type="button"
                            onClick={() => setGateway("khalti")}
                            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${
                                gateway === "khalti"
                                    ? "border-purple-600 bg-purple-600/10 shadow-sm ring-2 ring-purple-600/40"
                                    : "border-border bg-background hover:bg-accent"
                            }`}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5C2D91] text-white font-bold text-base shadow-sm">
                                K
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Khalti</p>
                                <p className="text-[11px] text-muted-foreground">ePayment v2</p>
                            </div>
                            {gateway === "khalti" && (
                                <CheckCircle size={16} className="text-purple-600" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Benefits */}
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                        <ShieldCheck size={16} className="text-primary" />
                        <span>Secure One-Time Activation</span>
                    </div>
                    <p>
                        Unlimited messaging, file uploads, real-time chats, and profile customization.
                    </p>
                </div>

                {/* Pay Button */}
                <button
                    type="button"
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full rounded-lg bg-primary py-3.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 shadow-md"
                >
                    {loading
                        ? "Redirecting to Payment Portal..."
                        : `Pay NPR 100 & Activate with ${
                            gateway === "esewa" ? "eSewa" : "Khalti"
                        }`}
                </button>

                {/* Logout link */}
                <div className="pt-2 text-center">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <LogOut size={14} />
                        <span>Sign out or use a different account</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Payment;
