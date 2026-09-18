import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

interface User{
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthState{
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitializing: true,
}

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers:{
        setCredentials:(
            state,
            action:PayloadAction<{
                user:User;
                accessToken:string;
            }>
        ) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
        },

        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
        },

        setAccessToken: (
            state,
            action: PayloadAction<string>
        ) => {
            state.accessToken = action.payload;
            state.isAuthenticated = true;
        },
    },

    extraReducers: (builder) => {
    builder
        .addCase(initializeAuth.pending, (state) => {
            state.isInitializing = true;
        })
        .addCase(initializeAuth.fulfilled, (state) => {
            state.isInitializing = false;
        })
        .addCase(initializeAuth.rejected, (state) => {
            state.isInitializing = false;
            state.isAuthenticated = false;
        });
}

})

export const initializeAuth = createAsyncThunk(
    "auth/initialize",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post("/auth/refresh");

            dispatch(
                setAccessToken(response.data.accessToken)
            );

            return response.data.accessToken;
        } catch (error) {
            return rejectWithValue(null);
        }
    }
);

export const { setCredentials, logout, setAccessToken, } = authSlice.actions;

export default authSlice.reducer;