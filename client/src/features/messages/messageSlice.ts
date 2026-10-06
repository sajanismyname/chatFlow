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
    prependMessages,
} from "../chat/chatSlice";


const initialState: MessageState = {
    loading: false,
    error: null,
    pagination: {},
};


/* =========================
   FETCH LATEST MESSAGES
========================= */

export const fetchMessages =
    createAsyncThunk<
        {
            conversationId: number;
            messages: Message[];
            hasMore: boolean;
        },
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
                        `/conversations/${conversationId}/messages`,
                        {
                            params: {
                                limit: 30,
                            },
                        }
                    );


                const messages =
                    response.data.messages;

                const hasMore =
                    response.data.hasMore;


                dispatch(
                    setMessages({
                        conversationId,
                        messages,
                    })
                );


                return {
                    conversationId,
                    messages,
                    hasMore,
                };

            } catch (error: any) {

                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to fetch messages"
                );
            }
        }
    );


/* =========================
   FETCH OLDER MESSAGES
========================= */

export const fetchOlderMessages =
    createAsyncThunk<
        {
            conversationId: number;
            messages: Message[];
            hasMore: boolean;
        },
        {
            conversationId: number;
            before: number;
        },
        { rejectValue: string }
    >(
        "messages/fetchOlderMessages",

        async (
            {
                conversationId,
                before,
            },
            {
                dispatch,
                rejectWithValue,
            }
        ) => {

            try {

                const response =
                    await api.get(
                        `/conversations/${conversationId}/messages`,
                        {
                            params: {
                                limit: 30,
                                before,
                            },
                        }
                    );


                const messages =
                    response.data.messages;

                const hasMore =
                    response.data.hasMore;


                dispatch(
                    prependMessages({
                        conversationId,
                        messages,
                    })
                );


                return {
                    conversationId,
                    messages,
                    hasMore,
                };

            } catch (error: any) {

                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to fetch older messages"
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


                /*
                 * The REST response adds the message
                 * immediately for the sender.
                 *
                 * SocketManager also receives the
                 * broadcast, but chatSlice.addMessage()
                 * prevents the duplicate by ID.
                 */
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

            /* =====================
               INITIAL FETCH
            ===================== */

            .addCase(
                fetchMessages.pending,
                (state) => {

                    state.loading = true;

                    state.error = null;
                }
            )

            .addCase(
                fetchMessages.fulfilled,
                (
                    state,
                    action
                ) => {

                    state.loading = false;

                    state.pagination[
                        action.payload
                            .conversationId
                    ] = {
                        hasMore:
                            action.payload
                                .hasMore,

                        loadingOlder: false,
                    };
                }
            )

            .addCase(
                fetchMessages.rejected,
                (
                    state,
                    action
                ) => {

                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Failed to fetch messages";
                }
            )


            /* =====================
               OLDER MESSAGES
            ===================== */

            .addCase(
                fetchOlderMessages.pending,
                (
                    state,
                    action
                ) => {

                    const conversationId =
                        action.meta.arg
                            .conversationId;


                    state.pagination[
                        conversationId
                    ] = {

                        ...(state.pagination[
                            conversationId
                        ] ?? {
                            hasMore: true,
                        }),

                        loadingOlder: true,
                    };
                }
            )

            .addCase(
                fetchOlderMessages.fulfilled,
                (
                    state,
                    action
                ) => {

                    state.pagination[
                        action.payload
                            .conversationId
                    ] = {

                        hasMore:
                            action.payload
                                .hasMore,

                        loadingOlder: false,
                    };
                }
            )

            .addCase(
                fetchOlderMessages.rejected,
                (
                    state,
                    action
                ) => {

                    const conversationId =
                        action.meta.arg
                            .conversationId;


                    state.pagination[
                        conversationId
                    ] = {

                        ...(state.pagination[
                            conversationId
                        ] ?? {
                            hasMore: true,
                        }),

                        loadingOlder: false,
                    };


                    state.error =
                        action.payload ||
                        "Failed to fetch older messages";
                }
            )


            /* =====================
               SEND MESSAGE
            ===================== */

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
                (
                    state,
                    action
                ) => {

                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Failed to send message";
                }
            )

            .addMatcher(
                (action) =>
                    action.type === "auth/logout" ||
                    action.type === "auth/logoutUser/fulfilled" ||
                    action.type === "auth/deleteAccount/fulfilled",
                () => initialState
            );
    },
});


export default messageSlice.reducer;