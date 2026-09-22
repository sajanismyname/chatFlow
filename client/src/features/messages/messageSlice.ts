import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

import api from "../../api/axios";

import type {
    Message,
    MessageState,
} from "./messageType";

const initialState: MessageState = {
    messages: [],
    loading: false,
    error: null,
};

export const fetchMessages = createAsyncThunk<
    Message[],
    number,
    { rejectValue: string }
>(
    "messages/fetchMessages",
    async (conversationId, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `/conversations/${conversationId}/messages`
            );

            return response.data.messages;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch messages"
            );
        }
    }
);

export const sendMessage = createAsyncThunk<
    Message,
    {
        conversationId: number;
        content: string;
    },
    { rejectValue: string }
>(
    "messages/sendMessage",
    async (
        { conversationId, content },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post(
                `/conversations/${conversationId}/messages`,
                {
                    content,
                }
            );

            return response.data.message;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to send message"
            );
        }
    }
);

const messageSlice = createSlice({
    name: "messages",

    initialState,

    reducers: {
        clearMessages: (state) => {
            state.messages = [];
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(
                fetchMessages.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                fetchMessages.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.messages = action.payload;
                }
            )

            .addCase(
                fetchMessages.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error =
                        action.payload ||
                        "Failed to fetch messages";
                }
            )

            .addCase(
                sendMessage.fulfilled,
                (state, action) => {
                    state.messages.push(action.payload);
                }
            )
    },
});


export const {
    clearMessages,
} = messageSlice.actions;

export default messageSlice.reducer;