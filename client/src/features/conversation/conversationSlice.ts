import {
    createAsyncThunk,
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";

import api from "../../api/axios";
import type {
    Conversation,
    ConversationState,
} from "../conversation/conversationTypes";

const initialState: ConversationState = {
    conversations: [],
    loading: false,
    error: null,
};

export const fetchConversations =
    createAsyncThunk<
        Conversation[],
        void,
        { rejectValue: string }
    >(
        "conversations/fetchConversations",
        async (_, { rejectWithValue }) => {
            try {
                const response = await api.get(
                    "/conversations"
                );

                return response.data.conversations;
            } catch (error: any) {
                return rejectWithValue(
                    error.response?.data?.message ||
                        "Failed to fetch conversations"
                );
            }
        }
    );

export const createConversation =
    createAsyncThunk<
        Conversation,
        number,
        { rejectValue: string }
    >(
        "conversations/createConversation",
        async (userId, { rejectWithValue }) => {
            try {
                const response = await api.post(
                    "/conversations",
                    {
                        userId,
                    }
                );

                return response.data.conversation;
            } catch (error: any) {
                return rejectWithValue(
                    error.response?.data?.message ||
                        "Failed to create conversation"
                );
            }
        }
    );

const conversationSlice = createSlice({
    name: "conversations",

    initialState,

    reducers: {
        clearConversations: (state) => {
            state.conversations = [];
        },

        addConversation: (
            state,
            action: PayloadAction<Conversation>
        ) => {
            const exists =
                state.conversations.some(
                    (conversation) =>
                        conversation.id ===
                        action.payload.id
                );

            if (!exists) {
                state.conversations.push(
                    action.payload
                );
            }
        },
    },

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
                (state, action) => {
                    state.loading = false;
                    state.conversations =
                        action.payload;
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
                (state, action) => {
                    state.loading = false;

                    const exists =
                        state.conversations.some(
                            (conversation) =>
                                conversation.id ===
                                action.payload.id
                        );

                    if (!exists) {
                        state.conversations.push(
                            action.payload
                        );
                    }
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

export const {
    clearConversations,
    addConversation,
} = conversationSlice.actions;

export default conversationSlice.reducer;