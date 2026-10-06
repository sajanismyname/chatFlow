import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { verifyRegisterPayment } from "../features/auth/authSlice";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

function PaymentVerify() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { loading, error, isAuthenticated, user } = useSelector(
        (state: RootState) => state.auth
    );

    const gateway = (searchParams.get("gateway") || "esewa") as "khalti" | "esewa";
    const txn = searchParams.get("txn") || undefined;
    const pidx = searchParams.get("pidx") || undefined;
    const data = searchParams.get("data") || undefined;
    const isFailed = searchParams.get("failed") === "true";
    const isSimulated = searchParams.get("simulated") === "true";

    const [verified, setVerified] = useState(false);
    const [localError, setLocalError] = useState<string | null>(
        isFailed ? "Payment was cancelled or failed on the payment portal." : null
    );
    const [hasAttempted, setHasAttempted] = useState(false);

    const handleVerify = async () => {
        setLocalError(null);
        try {
            const res = await dispatch(
                verifyRegisterPayment({
                    gateway,
                    transactionUuid: txn,
                    pidx,
                    data,
                })
            );

            if (verifyRegisterPayment.fulfilled.match(res)) {
                setVerified(true);
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else if (verifyRegisterPayment.rejected.match(res)) {
                setLocalError(
                    res.payload || "Payment verification failed. Please try again."
                );
            }
        } catch {
            setLocalError("An unexpected error occurred during verification.");
        }
    };

    useEffect(() => {
        // If user already paid, take them straight to dashboard
        if (isAuthenticated && user?.isPaid === true && !verified) {
            navigate("/", { replace: true });
            return;
        }

        // If no payment params are present in URL, redirect back to payment or login
        if (!txn && !pidx && !data && !isSimulated && !isFailed) {
            navigate(isAuthenticated ? "/payment" : "/login", { replace: true });
            return;
        }

        // Auto verify if not failed and not waiting for simulated confirmation
        if (!isFailed && !isSimulated && !hasAttempted) {
            setHasAttempted(true);
            void handleVerify();
        }
    }, [isFailed, isSimulated, hasAttempted, isAuthenticated, user?.isPaid, verified, txn, pidx, data, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
                {verified ? (
                    <div className="space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                            <CheckCircle2 size={40} />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Payment Successful!
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Your payment has been verified and your account is now active.
                            Redirecting to ChatFlow...
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            <span>Enter ChatFlow</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                ) : localError || error ? (
                    <div className="space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <AlertCircle size={40} />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Payment Verification Failed
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {localError || error}
                        </p>
                        <div className="pt-2 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => void handleVerify()}
                                disabled={loading}
                                className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                                {loading ? "Retrying..." : "Retry Verification"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(isAuthenticated ? "/payment" : "/register")}
                                className="w-full rounded-lg border border-input py-3 font-medium text-foreground hover:bg-accent"
                            >
                                {isAuthenticated ? "Return to Payment" : "Return to Register"}
                            </button>
                        </div>
                    </div>
                ) : isSimulated ? (
                    <div className="space-y-5">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
                            <span className="text-2xl font-bold">K</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Khalti Sandbox Simulation
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Test mode: confirm your registration fee payment
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-muted/40 p-4 text-left space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Service:</span>
                                <span className="font-medium text-foreground">ChatFlow Account</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Gateway:</span>
                                <span className="font-semibold text-purple-600">Khalti (Test)</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-border/50 pt-2">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="text-base font-bold text-foreground">NPR 100</span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <button
                                type="button"
                                onClick={() => void handleVerify()}
                                disabled={loading}
                                className="w-full rounded-lg bg-purple-600 py-3 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        Processing Payment...
                                    </span>
                                ) : (
                                    "Approve & Pay NPR 100"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(isAuthenticated ? "/payment" : "/register")}
                                className="w-full rounded-lg border border-input py-3 font-medium text-foreground hover:bg-accent"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center">
                            <Loader2 size={40} className="animate-spin text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Verifying Payment
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Please wait while we verify your transaction with {gateway === "khalti" ? "Khalti" : "eSewa"} and activate your account...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentVerify;
