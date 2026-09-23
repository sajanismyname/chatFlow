import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import conversationReducer from "../features/conversation/conversationSlice";
import messageReducer from "../features/messages/messageSlice";
import chatReducer from "../features/chat/chatSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        conversations: conversationReducer,
        messages: messageReducer,
        chat: chatReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;