import { apiSlice } from "../api/apiSlice";
import { userCreditSpent } from "../auth/authSlice";

const compactObject = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  );

const sessionMatchesSearch = (session, search) => {
  const normalizedSearch = String(search || "")
    .trim()
    .toLowerCase();

  if (!normalizedSearch) return true;

  return [session?.title, session?.last_message?.content].some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalizedSearch),
  );
};

const updateCachedSessionLists = (dispatch, getState, update) => {
  const cachedArgs = apiSlice.util.selectCachedArgsForQuery(
    getState(),
    "chatSessionList",
  );

  cachedArgs.forEach((args) => {
    dispatch(
      apiSlice.util.updateQueryData("chatSessionList", args, (draft) => {
        if (!Array.isArray(draft?.data)) return;
        update(draft.data, args);
      }),
    );
  });
};

const upsertCachedSession = (dispatch, getState, session) => {
  if (!session?.id) return;

  updateCachedSessionLists(dispatch, getState, (sessions, args) => {
    const existingIndex = sessions.findIndex((item) => item.id === session.id);
    const existing = existingIndex >= 0 ? sessions[existingIndex] : null;
    const nextSession = compactObject({ ...existing, ...session });

    if (existingIndex >= 0) sessions.splice(existingIndex, 1);

    if (
      Number(args?.page || 1) === 1 &&
      sessionMatchesSearch(nextSession, args?.search)
    ) {
      sessions.unshift(nextSession);
      sessions.splice(Number(args?.page_size || 20));
    }
  });
};

const removeCachedSession = (dispatch, getState, sessionId) => {
  updateCachedSessionLists(dispatch, getState, (sessions) => {
    const index = sessions.findIndex((session) => session.id === sessionId);
    if (index >= 0) sessions.splice(index, 1);
  });
};

const getResponseSession = (response, fallback = {}) => {
  const payload = response?.data;
  const responseSession =
    payload?.session || payload?.chat_session || (payload?.id ? payload : null);
  const sessionId = responseSession?.id || payload?.session_id || fallback.id;

  if (!sessionId) return null;

  const assistantMessage =
    payload?.assistant_message || payload?.answer || payload?.response;
  const lastMessage =
    typeof assistantMessage === "string"
      ? { content: assistantMessage }
      : assistantMessage?.content
        ? assistantMessage
        : fallback.last_message;

  return compactObject({
    ...responseSession,
    id: sessionId,
    title: responseSession?.title || fallback.title,
    last_message: lastMessage,
    updated_at:
      responseSession?.updated_at ||
      response?.meta?.timestamp ||
      fallback.updated_at,
  });
};

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
      keepUnusedDataFor: 30,
    }),

    createChatSession: builder.mutation({
      query: (body) => ({
        url: "/chat/sessions/create/",
        method: "POST",
        body,
      }),
      async onQueryStarted(body, { dispatch, getState, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;
          const session = getResponseSession(response, {
            title: body?.title || "New travel chat",
            updated_at: new Date().toISOString(),
          });
          upsertCachedSession(dispatch, getState, session);
        } catch {
          // The session list remains unchanged when creation fails.
        }
      },
    }),

    chatMessageList: builder.query({
      query: ({ session_id, ...params }) => ({
        url: `/chat/sessions/${session_id}/messages/?${paginationParams(params)}`,
        method: "GET",
      }),
      keepUnusedDataFor: 60,
    }),

    deleteChatSession: builder.mutation({
      query: (session_id) => ({
        url: `/chat/sessions/${session_id}/delete/`,
        method: "DELETE",
      }),
      async onQueryStarted(sessionId, { dispatch, getState, queryFulfilled }) {
        try {
          await queryFulfilled;
          removeCachedSession(dispatch, getState, sessionId);
        } catch {
          // Keep the cached session when deletion fails.
        }
      },
    }),

    askChatQuestion: builder.mutation({
      query: (body) => ({
        url: "/chat/ask/",
        method: "POST",
        body,
      }),
      async onQueryStarted(body, { dispatch, getState, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;
          dispatch(userCreditSpent(response?.meta?.credit_spent));

          const session = getResponseSession(response, {
            id: body?.session_id,
            title: body?.session_id ? undefined : "New travel chat",
            last_message: { content: body?.message },
            updated_at: new Date().toISOString(),
          });
          upsertCachedSession(dispatch, getState, session);
        } catch {
          // Failed questions neither spend credit nor change cached sessions.
        }
      },
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
