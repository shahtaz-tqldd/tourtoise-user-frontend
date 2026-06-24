import { apiSlice } from "../api/apiSlice";

const paginationParams = ({ page = 1, page_size = 20, search } = {}) => {
  const query = new URLSearchParams({
    page: String(page),
    page_size: String(page_size),
  });

  if (search) query.set("search", search);

  return query.toString();
};

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    chatSessionList: builder.query({
      query: (params = {}) => ({
        url: `/chat/sessions/list/?${paginationParams(params)}`,
        method: "GET",
      }),
      providesTags: (result) => [
        "chat-session-list",
        ...(result?.data || []).map((session) => ({
          type: "chat-session",
          id: session.id,
        })),
      ],
    }),

    createChatSession: builder.mutation({
      query: (body) => ({
        url: "/chat/sessions/create/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["chat-session-list"],
    }),

    chatMessageList: builder.query({
      query: ({ session_id, ...params }) => ({
        url: `/chat/sessions/${session_id}/messages/?${paginationParams(params)}`,
        method: "GET",
      }),
      providesTags: (result, error, { session_id }) => [
        { type: "chat-message-list", id: session_id },
        { type: "chat-session", id: session_id },
      ],
    }),

    deleteChatSession: builder.mutation({
      query: (session_id) => ({
        url: `/chat/sessions/${session_id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, session_id) => [
        "chat-session-list",
        { type: "chat-session", id: session_id },
        { type: "chat-message-list", id: session_id },
      ],
    }),

    askChatQuestion: builder.mutation({
      query: (body) => ({
        url: "/chat/ask/",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        "chat-session-list",
        {
          type: "chat-message-list",
          id: result?.data?.session_id || body?.session_id,
        },
      ],
    }),
  }),
});

export const {
  useChatSessionListQuery,
  useCreateChatSessionMutation,
  useChatMessageListQuery,
  useDeleteChatSessionMutation,
  useAskChatQuestionMutation,
} = chatApiSlice;
