export interface User {
    id: number;
    name: string;
    email: string;
    googleId: string | null;
    avatar: string | null;
    online?:boolean,
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