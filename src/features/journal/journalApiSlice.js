import { apiSlice } from "../api/apiSlice";

const paginationParams = ({ page = 1, page_size = 20, ...params } = {}) => {
  const query = new URLSearchParams({
    page: String(page),
    page_size: String(page_size),
  });

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, Array.isArray(value) ? value.join(",") : String(value));
  });

  return query.toString();
};

const journalTags = (result) => [
  "journal-list",
  ...(result?.data || []).map(({ id }) => ({ type: "journal-detail", id })),
];

const nextJournalPage = (lastPage, allPages, lastPageParam) =>
  lastPage?.meta?.next ? lastPageParam + 1 : undefined;

const infiniteJournalTags = (result, listTag) => [
  listTag,
  ...(result?.pages || []).flatMap((page) =>
    (page.data || []).map(({ id }) => ({ type: "journal-detail", id })),
  ),
];

export const journalApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    journalList: builder.query({
      query: (params) => `/journals/list/?${paginationParams(params)}`,
      providesTags: journalTags,
    }),
    journalInfiniteList: builder.infiniteQuery({
      query: ({ queryArg = {}, pageParam }) =>
        `/journals/list/?${paginationParams({
          ...queryArg,
          page: pageParam,
        })}`,
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: nextJournalPage,
      },
      providesTags: (result) => infiniteJournalTags(result, "journal-list"),
    }),
    userJournalList: builder.query({
      query: ({ user_id, ...params }) =>
        `/journals/users/${user_id}/list/?${paginationParams(params)}`,
      providesTags: journalTags,
    }),
    myJournalList: builder.query({
      query: (params) => `/journals/mine/list/?${paginationParams(params)}`,
      providesTags: (result) => ["my-journal-list", ...journalTags(result)],
    }),
    savedJournalList: builder.query({
      query: (params) => `/journals/saved/list/?${paginationParams(params)}`,
      providesTags: "saved-journal-list",
    }),
    savedJournalInfiniteList: builder.infiniteQuery({
      query: ({ queryArg = {}, pageParam }) =>
        `/journals/saved/list/?${paginationParams({
          ...queryArg,
          page: pageParam,
        })}`,
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: nextJournalPage,
      },
      providesTags: (result) =>
        infiniteJournalTags(result, "saved-journal-list"),
    }),
    journalDetail: builder.query({
      query: (journal_id) => `/journals/${journal_id}/detail/`,
      providesTags: (result, error, journal_id) => [
        { type: "journal-detail", id: journal_id },
      ],
    }),
    createJournal: builder.mutation({
      query: (body) => ({ url: "/journals/create/", method: "POST", body }),
      invalidatesTags: ["journal-list", "my-journal-list"],
    }),
    updateJournal: builder.mutation({
      query: ({ journal_id, body, method = "PATCH" }) => ({
        url: `/journals/${journal_id}/update/`,
        method,
        body,
      }),
      invalidatesTags: (result, error, { journal_id }) => [
        "journal-list",
        "my-journal-list",
        "saved-journal-list",
        { type: "journal-detail", id: journal_id },
      ],
    }),
    deleteJournal: builder.mutation({
      query: (journal_id) => ({
        url: `/journals/${journal_id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "journal-list",
        "my-journal-list",
        "saved-journal-list",
      ],
    }),
    saveJournal: builder.mutation({
      query: ({ journal_id, saved }) => ({
        url: `/journals/${journal_id}/save/`,
        method: saved ? "DELETE" : "POST",
      }),
      invalidatesTags: (result, error, { journal_id }) => [
        "journal-list",
        "saved-journal-list",
        { type: "journal-detail", id: journal_id },
      ],
    }),
    journalComments: builder.query({
      query: ({ journal_id, ...params }) =>
        `/journals/${journal_id}/comments/?${paginationParams(params)}`,
      providesTags: (result, error, { journal_id }) => [
        { type: "journal-comments", id: journal_id },
      ],
    }),
    createJournalComment: builder.mutation({
      query: ({ journal_id, body }) => ({
        url: `/journals/${journal_id}/comments/`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { journal_id }) => [
        "journal-list",
        "my-journal-list",
        { type: "journal-comments", id: journal_id },
        { type: "journal-detail", id: journal_id },
      ],
    }),
    journalReplies: builder.query({
      query: ({ journal_id, comment_id, ...params }) =>
        `/journals/${journal_id}/comments/${comment_id}/replies/?${paginationParams(params)}`,
      providesTags: (result, error, { comment_id }) => [
        { type: "journal-replies", id: comment_id },
      ],
    }),
    createJournalReply: builder.mutation({
      query: ({ journal_id, comment_id, body }) => ({
        url: `/journals/${journal_id}/comments/${comment_id}/replies/`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { journal_id, comment_id }) => [
        "journal-list",
        "my-journal-list",
        { type: "journal-comments", id: journal_id },
        { type: "journal-replies", id: comment_id },
      ],
    }),
    deleteJournalComment: builder.mutation({
      query: ({ comment_id }) => ({
        url: `/journals/comments/${comment_id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { journal_id, parent_id }) => [
        "journal-list",
        "my-journal-list",
        { type: "journal-detail", id: journal_id },
        { type: "journal-comments", id: journal_id },
        ...(parent_id ? [{ type: "journal-replies", id: parent_id }] : []),
      ],
    }),
  }),
});

export const {
  useJournalListQuery,
  useJournalInfiniteListInfiniteQuery,
  useUserJournalListQuery,
  useMyJournalListQuery,
  useSavedJournalListQuery,
  useSavedJournalInfiniteListInfiniteQuery,
  useJournalDetailQuery,
  useCreateJournalMutation,
  useUpdateJournalMutation,
  useDeleteJournalMutation,
  useSaveJournalMutation,
  useJournalCommentsQuery,
  useCreateJournalCommentMutation,
  useJournalRepliesQuery,
  useCreateJournalReplyMutation,
  useDeleteJournalCommentMutation,
} = journalApiSlice;
