import { apiSlice } from "../api/apiSlice";

export const tripApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    tripList: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          page_size = 10,
          search,
          search_query,
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
        appendParam("destination_slug", destination_slug);

        return {
          url: `/trips/list?${queryParams.toString()}`,
          method: "GET",
        };
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

    tripDetail: builder.query({
      query: (trip_slug) => {
        return {
          url: `/trips/${trip_slug}/detail/`,
          method: "GET",
        };
      },
      providesTags: ["trip-detail"],
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

    tripAgentActive: builder.mutation({
      query: (payload) => {
        return {
          url: `/trips/agent-active/`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["trip-list"],
    }),

    tripAgentCreateMessage: builder.mutation({
      query: (payload) => {
        return {
          url: `/trips/agent/create-message/`,
          method: "POST",
          body: payload,
        };
      },
    }),
  }),
});

export const {
  useTripListQuery,
  useTripDetailQuery,
  useTripAgentConversationQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useTripAgentActiveMutation,
  useTripAgentCreateMessageMutation
} = tripApiSlice;
