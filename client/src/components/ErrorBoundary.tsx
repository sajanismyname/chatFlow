import React, { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    public handleReset = (): void => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    public render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
                    <div className="max-w-md space-y-4">
                        <div className="text-4xl">⚠️</div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                            Something went wrong
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            An unexpected error occurred while rendering the chat.
                        </p>
                        <Button onClick={this.handleReset} className="mt-4">
                            Return to Conversations
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
