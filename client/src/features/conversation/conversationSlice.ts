import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

import api from "../../api/axios";

import type {
    Conversation,
    ConversationState,
} from "./conversationTypes";

import {
    setConversations,
    addConversation,
} from "../chat/chatSlice";


const initialState: ConversationState = {
    loading: false,
    error: null,
};


/* =========================
   FETCH CONVERSATIONS
========================= */

export const fetchConversations =
    createAsyncThunk<
        Conversation[],
        void,
        { rejectValue: string }
    >(
        "conversations/fetchConversations",

        async (
            _,
            {
                dispatch,
                rejectWithValue,
            }
        ) => {
            try {

                const response =
                    await api.get(
                        "/conversations"
                    );

                const conversations =
                    response.data.conversations;

                dispatch(
                    setConversations(
                        conversations
                    )
                );

                return conversations;

            } catch (error: any) {

                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to fetch conversations"
                );
            }
        }
    );


/* =========================
   CREATE CONVERSATION
========================= */

export const createConversation =
    createAsyncThunk<
        Conversation,
        number,
        { rejectValue: string }
    >(
        "conversations/createConversation",

        async (
            userId,
            {
                dispatch,
                rejectWithValue,
            }
        ) => {
            try {

                const response =
                    await api.post(
                        "/conversations",
                        {
                            userId,
                        }
                    );

                const conversation =
                    response.data.conversation;

                dispatch(
                    addConversation(
                        conversation
                    )
                );

                return conversation;

            } catch (error: any) {

                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to create conversation"
                );
            }
        }
    );


/* =========================
   SLICE
========================= */

const conversationSlice = createSlice({

    name: "conversations",

    initialState,

    reducers: {},

    extraReducers: (builder) => {

        builder

            .addCase(
                fetchConversations.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                fetchConversations.fulfilled,
                (state) => {
                    state.loading = false;
                }
            )

            .addCase(
                fetchConversations.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error =
                        action.payload ||
                        "Failed to fetch conversations";
                }
            )

            .addCase(
                createConversation.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                createConversation.fulfilled,
                (state) => {
                    state.loading = false;
                }
            )

            .addCase(
                createConversation.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error =
                        action.payload ||
                        "Failed to create conversation";
                }
            );
    },
});


export default conversationSlice.reducer;