import {
    createAsyncThunk,
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";

import api from "../../api/axios";

import type {
    AuthState,
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    User,
} from "./authTypes";


/* =========================
   INITIAL AUTH STATE
========================= */

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: false,
};


/* =========================
   LOGIN
========================= */

export const login = createAsyncThunk<
    AuthResponse,
    LoginCredentials,
    { rejectValue: string }
>(
    "auth/login",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await api.post<AuthResponse>(
                "/auth/login",
                {
                    email,
                    password,
                }
            );

            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    }
);


/* =========================
   REGISTER
========================= */

export const register = createAsyncThunk<
    AuthResponse,
    RegisterCredentials,
    { rejectValue: string }
>(
    "auth/register",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post<AuthResponse>(
                "/auth/register",
                credentials
            );

            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    }
);


/* =========================
   INITIALIZE AUTH
========================= */

export const initializeAuth = createAsyncThunk<
    AuthResponse,
    void,
    { rejectValue: string }
>(
    "auth/initialize",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post<AuthResponse>(
                "/auth/refresh"
            );

            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Authentication initialization failed"
            );
        }
    }
);


/* =========================
   AUTH SLICE
========================= */

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {

        setCredentials: (
            state,
            action: PayloadAction<{
                user: User;
                accessToken: string;
            }>
        ) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
        },

        setAccessToken: (
            state,
            action: PayloadAction<string>
        ) => {
            state.accessToken = action.payload;
        },

        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            /* =========================
               LOGIN
            ========================= */

            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;

                state.user = action.payload.user;
                state.accessToken =
                    action.payload.accessToken;

                state.isAuthenticated = true;
            })

            .addCase(login.rejected, (state, action) => {
                state.loading = false;

                state.error =
                    action.payload || "Login failed";
            })


            /* =========================
               REGISTER
            ========================= */

            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;

                state.user = action.payload.user;
                state.accessToken =
                    action.payload.accessToken;

                state.isAuthenticated = true;
            })

            .addCase(register.rejected, (state, action) => {
                state.loading = false;

                state.error =
                    action.payload ||
                    "Registration failed";
            })


            /* =========================
               INITIALIZE
            ========================= */

            .addCase(initializeAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.initialized = true;

                state.user = action.payload.user;
                state.accessToken =
                    action.payload.accessToken;

                state.isAuthenticated = true;
            })

            .addCase(initializeAuth.rejected, (state) => {
                state.loading = false;
                state.initialized = true;

                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
            });
    },
});


export const {
    setCredentials,
    setAccessToken,
    logout,
} = authSlice.actions;

export default authSlice.reducer;