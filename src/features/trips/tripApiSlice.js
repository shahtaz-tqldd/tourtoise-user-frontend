import { apiSlice } from "../api/apiSlice";

const nextTripPage = (lastPage, allPages, lastPageParam) =>
  lastPage?.meta?.next ||
  lastPage?.data?.meta?.next ||
  lastPage?.data?.pagination?.next
    ? lastPageParam + 1
    : undefined;

const tripListQueryParams = (params = {}) => {
  const {
    page = 1,
    page_size = 10,
    search,
    search_query,
    status,
    destination_slug,
  } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    page_size: String(page_size),
  });

  const appendParam = (key, value) => {
    if (!value || (Array.isArray(value) && !value.length)) return;
    queryParams.set(key, Array.isArray(value) ? value.join(",") : value);
  };

  appendParam("search", search || search_query);
  appendParam("status", status);
  appendParam("destination_slug", destination_slug);

  return queryParams.toString();
};

export const tripApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    tripList: builder.query({
      query: (params = {}) => {
        return {
          url: `/trips/list/?${tripListQueryParams(params)}`,
          method: "GET",
        };
      },
      providesTags: ["trip-list"],
    }),

    tripInfiniteList: builder.infiniteQuery({
      query: ({ queryArg = {}, pageParam }) => ({
        url: `/trips/list/?${tripListQueryParams({
          ...queryArg,
          page: pageParam,
        })}`,
        method: "GET",
      }),
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: nextTripPage,
      },
      providesTags: ["trip-list"],
    }),

    createTrip: builder.mutation({
      query: (payload) => {
        return {
          url: `/trips/create/`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["trip-list"],
    }),

    updateTrip: builder.mutation({
      query: ({ trip_id, ...payload }) => {
        return {
          url: `/trips/${trip_id}/update/`,
          method: "PATCH",
          body: payload,
        };
      },
      invalidatesTags: ["trip-list", "trip-detail"],
    }),

    createTripShareToken: builder.mutation({
      query: ({ trip_id }) => {
        return {
          url: `/trips/${trip_id}/share-token/`,
          method: "POST",
        };
      },
      invalidatesTags: ["trip-detail"],
    }),

    updateTripVisibility: builder.mutation({
      query: ({ trip_id, visibility }) => {
        return {
          url: `/trips/${trip_id}/visibility/`,
          method: "PATCH",
          body: { visibility },
        };
      },
      invalidatesTags: ["trip-detail"],
    }),

    deleteTrip: builder.mutation({
      query: ({ trip_id }) => {
        return {
          url: `/trips/${trip_id}/delete/`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["trip-list", "trip-detail"],
    }),

    tripDetail: builder.query({
      query: (trip_id) => {
        return {
          url: `/trips/${trip_id}/detail/`,
          method: "GET",
        };
      },
      providesTags: ["trip-detail"],
    }),

    tripShortDetails: builder.query({
      query: ({ trip_id }) => {
        return {
          url: `/trips/${trip_id}/short-details/`,
          method: "GET",
        };
      },
      providesTags: ["trip-short-details"],
    }),

    tripAgentConversation: builder.query({
      query: (trip_id) => {
        return {
          url: `/trips/${trip_id}/agent-conversation/`,
          method: "GET",
        };
      },
      providesTags: ["trip-detail"],
    }),

    // --- AGENT ENDPOINTS ---
    tripAgentActive: builder.mutation({
      query: (payload) => {
        return {
          url: `/trips/planning/agent-init/`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: (result, error, payload) => [
        { type: "trip-planning", id: `${payload?.trip_id}-preference` },
        "trip-detail",
        "trip-short-details",
      ],
    }),

    tripPlanning: builder.query({
      query: ({ trip_id, step, page_size }) => {
        const queryParams = new URLSearchParams({
          trip_id,
          step,
        });

        if (page_size) {
          queryParams.set("page_size", String(page_size));
        }

        return {
          url: `/trips/planning/?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result, error, { trip_id, step }) => [
        { type: "trip-planning", id: `${trip_id}-${step}` },
      ],
    }),

    tripAgentCreateMessage: builder.mutation({
      query: (payload) => {
        return {
          url: `/trips/planning/create-message/`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: (result, error, payload) => [
        { type: "trip-planning", id: `${payload?.trip_id}-preference` },
        "trip-detail",
        "trip-short-details",
      ],
    }),

    tripActivate: builder.mutation({
      query: ({ trip_id }) => {
        return {
          url: `/trips/planning/activate/`,
          method: "POST",
          body: { trip_id: trip_id },
        };
      },
      invalidatesTags: ["trip-list", "trip-detail", "trip-short-details"],
    }),

    // --- NOTES ENDPOINT ---
    tripNoteList: builder.query({
      query: (params = {}) => {
        const { trip_id, page = 1, page_size = 10, search } = params;

        const queryParams = new URLSearchParams({
          page: String(page),
          page_size: String(page_size),
        });

        const appendParam = (key, value) => {
          if (!value || (Array.isArray(value) && !value.length)) return;
          queryParams.set(key, Array.isArray(value) ? value.join(",") : value);
        };

        appendParam("search", search);

        return {
          url: `/trips/${trip_id}/notes/list?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["trip-note-list"],
    }),

    createTripNote: builder.mutation({
      query: ({ trip_id, payload }) => {
        return {
          url: `/trips/${trip_id}/notes/create/`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["trip-note-list"],
    }),

    updateTripNote: builder.mutation({
      query: ({ trip_id, note_id, payload }) => {
        return {
          url: `/trips/${trip_id}/notes/${note_id}/`,
          method: "PATCH",
          body: payload,
        };
      },
      invalidatesTags: ["trip-note-list"],
    }),

    deleteTripNote: builder.mutation({
      query: ({ trip_id, note_id }) => {
        return {
          url: `/trips/${trip_id}/notes/${note_id}/`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["trip-note-list"],
    }),

    tripNoteDetails: builder.query({
      query: ({ trip_id, note_id }) => {
        return {
          url: `/trips/${trip_id}/notes/${note_id}/`,
          method: "GET",
        };
      },
    }),

    // --- HEADSUP INFO ENDPOINT ---
    tripHeadsUpList: builder.query({
      query: (params = {}) => {
        const { trip_id, page = 1, page_size = 10, search } = params;

        const queryParams = new URLSearchParams({
          page: String(page),
          page_size: String(page_size),
        });

        const appendParam = (key, value) => {
          if (!value || (Array.isArray(value) && !value.length)) return;
          queryParams.set(key, Array.isArray(value) ? value.join(",") : value);
        };

        appendParam("search", search);

        return {
          url: `/trips/${trip_id}/heads-up/?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["trip-headsup-list"],
    }),

    createTripHeadsUp: builder.mutation({
      query: ({ trip_id, payload }) => {
        return {
          url: `/trips/${trip_id}/heads-up/`,
          method: "POST",
          body: payload,
        };
      },
    }),

    updateTripHeadsUp: builder.mutation({
      query: ({ trip_id, headsup_id, payload }) => {
        return {
          url: `/trips/${trip_id}/heads-up/${headsup_id}/`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    deleteTripHeadsUp: builder.mutation({
      query: ({ trip_id, headsup_id }) => {
        return {
          url: `/trips/${trip_id}/heads-up/${headsup_id}/`,
          method: "DELETE",
        };
      },
    }),

    // --- PACKING ITEMS ENDPOINT ---
    tripPackingItemList: builder.query({
      query: (params = {}) => {
        const { trip_id, page = 1, page_size = 10, search } = params;

        const queryParams = new URLSearchParams({
          page: String(page),
          page_size: String(page_size),
        });

        const appendParam = (key, value) => {
          if (!value || (Array.isArray(value) && !value.length)) return;
          queryParams.set(key, Array.isArray(value) ? value.join(",") : value);
        };

        appendParam("search", search);

        return {
          url: `/trips/${trip_id}/packing-items/?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["trip-packing-items-list"],
    }),

    createTripPackingItem: builder.mutation({
      query: ({ trip_id, payload }) => {
        return {
          url: `/trips/${trip_id}/packing-items/`,
          method: "POST",
          body: payload,
        };
      },
    }),

    updateTripPackingItem: builder.mutation({
      query: ({ trip_id, packing_item_id, payload }) => {
        return {
          url: `/trips/${trip_id}/packing-items/${packing_item_id}/`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    deleteTripPackingItem: builder.mutation({
      query: ({ trip_id, packing_item_id }) => {
        return {
          url: `/trips/${trip_id}/packing-items/${packing_item_id}/`,
          method: "DELETE",
        };
      },
    }),

    // --- DOCUMENTS ENDPOINT ---
    tripDocumentList: builder.query({
      query: ({ trip_id }) => {
        return {
          url: `/trips/${trip_id}/documents/`,
          method: "GET",
        };
      },
      providesTags: ["trip-document-list"],
    }),

    createDocumentItem: builder.mutation({
      query: ({ trip_id, payload }) => {
        return {
          url: `/trips/${trip_id}/documents/`,
          method: "POST",
          body: payload,
        };
      },
    }),

    updateTripDocumentItem: builder.mutation({
      query: ({ trip_id, document_item_id, payload }) => {
        return {
          url: `/trips/${trip_id}/documents/${document_item_id}/`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    deleteDocumentItem: builder.mutation({
      query: ({ trip_id, document_item_id }) => {
        return {
          url: `/trips/${trip_id}/documents/${document_item_id}/`,
          method: "DELETE",
        };
      },
    }),

    deleteDocumentFileItem: builder.mutation({
      query: ({ trip_id, document_item_id }) => {
        return {
          url: `/trips/${trip_id}/documents/${document_item_id}/file/`,
          method: "DELETE",
        };
      },
    }),

    // ROUTES ENDPOINT
    tripRouteList: builder.query({
      query: ({ trip_id }) => {
        return {
          url: `/trips/${trip_id}/plan/routes/`,
          method: "GET",
        };
      },
    }),

    // DAYWISE PLAN ENDPOINT
    daywisePlanList: builder.query({
      query: ({ trip_id }) => {
        return {
          url: `/trips/${trip_id}/plan/daywise/`,
          method: "GET",
        };
      },
    }),

    // TRIP MESSAGE ENDPOINT
    tripMessageList: builder.query({
      query: ({ trip_id, session_id, page, page_size, search }) => {
        const queryParams = new URLSearchParams({
          page: String(page),
          page_size: String(page_size),
        });

        const appendParam = (key, value) => {
          if (!value || (Array.isArray(value) && !value.length)) return;
          queryParams.set(key, Array.isArray(value) ? value.join(",") : value);
        };

        appendParam("search", search);

        return {
          url: `/trips/${trip_id}/chat/${session_id}/messages/?${queryParams.toString()}`,
          method: "GET",
        };
      },
    }),

    tripMessageInfiniteList: builder.infiniteQuery({
      query: ({ queryArg = {}, pageParam }) => {
        const { trip_id, session_id, page_size = 20, search } = queryArg;
        const queryParams = new URLSearchParams({
          page: String(pageParam),
          page_size: String(page_size),
        });

        const appendParam = (key, value) => {
          if (!value || (Array.isArray(value) && !value.length)) return;
          queryParams.set(key, Array.isArray(value) ? value.join(",") : value);
        };

        appendParam("search", search);

        return {
          url: `/trips/${trip_id}/chat/${session_id}/messages/?${queryParams.toString()}`,
          method: "GET",
        };
      },
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: nextTripPage,
      },
    }),

    createTripMessage: builder.mutation({
      query: ({ trip_id, session_id, payload }) => {
        return {
          url: `/trips/${trip_id}/chat/${session_id}/create-message/`,
          method: "POST",
          body: payload,
        };
      },
    }),

    readAllMessages: builder.mutation({
      query: ({ trip_id, session_id }) => {
        return {
          url: `/trips/${trip_id}/chat/${session_id}/read-all/`,
          method: "PATCH",
        };
      },
    }),
  }),
});

export const {
  useTripListQuery,
  useTripInfiniteListInfiniteQuery,
  useTripDetailQuery,
  useTripShortDetailsQuery,
  useTripAgentConversationQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useCreateTripShareTokenMutation,
  useUpdateTripVisibilityMutation,
  useDeleteTripMutation,

  // planning
  useTripAgentActiveMutation,
  useTripAgentCreateMessageMutation,
  useTripPlanningQuery,
  useTripActivateMutation,

  // notes
  useTripNoteListQuery,
  useCreateTripNoteMutation,
  useUpdateTripNoteMutation,
  useDeleteTripNoteMutation,
  useTripNoteDetailsQuery,

  // headsup
  useCreateTripHeadsUpMutation,
  useTripHeadsUpListQuery,
  useUpdateTripHeadsUpMutation,
  useDeleteTripHeadsUpMutation,

  // packing items
  useTripPackingItemListQuery,
  useCreateTripPackingItemMutation,
  useDeleteTripPackingItemMutation,
  useUpdateTripPackingItemMutation,

  // documents
  useCreateDocumentItemMutation,
  useTripDocumentListQuery,
  useUpdateTripDocumentItemMutation,
  useDeleteDocumentItemMutation,
  useDeleteDocumentFileItemMutation,

  // routes
  useTripRouteListQuery,

  // daywise plan
  useDaywisePlanListQuery,

  // trip messages
  useTripMessageListQuery,
  useTripMessageInfiniteListInfiniteQuery,
  useCreateTripMessageMutation,
  useReadAllMessagesMutation,
} = tripApiSlice;
