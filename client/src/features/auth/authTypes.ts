export interface User {
    id: number;
    name: string;
    email: string;
    googleId: string | null;
    avatar: string | null;
    online?:boolean,
    note?: string | null;
    isPaid?: boolean;
    isDeleted?: boolean;
}

export interface AuthResponse {
    message: string;
    accessToken: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    gateway?: "khalti" | "esewa";
}

export type PaymentGateway = "khalti" | "esewa";

export interface RegisterPaymentInitiatePayload {
    name: string;
    email: string;
    password: string;
    gateway: PaymentGateway;
}

export interface PaymentInitiateResponse {
    message: string;
    gateway: PaymentGateway;
    amount: number;
    transactionUuid: string;
    paymentUrl: string;
    pidx?: string;
    params?: Record<string, string>;
    isSimulated?: boolean;
}

export interface PaymentVerifyPayload {
    gateway: PaymentGateway;
    transactionUuid?: string;
    pidx?: string;
    data?: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    initialized: boolean;
}

export interface UserSearchProps {
    onSelectUser: (user: User) => void;
    onClose: () => void;
}