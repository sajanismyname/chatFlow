import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

import api from "../../api/axios";

import type {
    Message,
    MessageState,
} from "./messageType";

import {
    setMessages,
    addMessage,
} from "../chat/chatSlice";


const initialState: MessageState = {
    loading: false,
    error: null,
};


/* =========================
   FETCH MESSAGES
========================= */

export const fetchMessages =
    createAsyncThunk<
        Message[],
        number,
        { rejectValue: string }
    >(
        "messages/fetchMessages",

        async (
            conversationId,
            {
                dispatch,
                rejectWithValue,
            }
        ) => {

            try {

                const response =
                    await api.get(
                        `/conversations/${conversationId}/messages`
                    );

                const messages =
                    response.data.messages;

                dispatch(
                    setMessages({
                        conversationId,
                        messages,
                    })
                );

                return messages;

            } catch (error: any) {

                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to fetch messages"
                );
            }
        }
    );


/* =========================
   SEND MESSAGE
========================= */

export const sendMessage =
    createAsyncThunk<
        Message,
        {
            conversationId: number;
            content: string;
        },
        { rejectValue: string }
    >(
        "messages/sendMessage",

        async (
            {
                conversationId,
                content,
            },
            {
                dispatch,
                rejectWithValue,
            }
        ) => {

            try {

                const response =
                    await api.post(
                        `/conversations/${conversationId}/messages`,
                        {
                            content,
                        }
                    );

                const message =
                    response.data.message;

                dispatch(
                    addMessage(message)
                );

                return message;

            } catch (error: any) {

                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to send message"
                );
            }
        }
    );


/* =========================
   SLICE
========================= */

const messageSlice = createSlice({

    name: "messages",

    initialState,

    reducers: {},

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
                (state) => {
                    state.loading = false;
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
                sendMessage.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                sendMessage.fulfilled,
                (state) => {
                    state.loading = false;
                }
            )

            .addCase(
                sendMessage.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error =
                        action.payload ||
                        "Failed to send message";
                }
            );
    },
});


export default messageSlice.reducer;