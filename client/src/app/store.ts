import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import conversationReducer from "../features/conversation/conversationSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        conversations: conversationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;