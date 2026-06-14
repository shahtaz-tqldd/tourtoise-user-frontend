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

    tripAgentConversation: builder.query({
      query: (trip_id) => {
        return {
          url: `/trips/${trip_id}/agent-conversation/`,
          method: "GET",
        };
      },
      providesTags: ["trip-detail"],
    }),

    // # agent endpoints
    tripAgentActive: builder.mutation({
      query: (payload) => {
        return {
          url: `/trips/planning/agent-init/`,
          method: "POST",
          body: payload,
        };
      },
    }),

    tripAgentCreateMessage: builder.mutation({
      query: (payload) => {
        return {
          url: `/trips/planning/create-message/`,
          method: "POST",
          body: payload,
        };
      },
    }),

    tripAgentMessageList: builder.query({
      query: (params = {}) => {
        const { trip_id, step, page = 1, page_size = 10 } = params;

        const queryParams = new URLSearchParams({
          page: String(page),
          page_size: String(page_size),
        });

        const appendParam = (key, value) => {
          if (!value || (Array.isArray(value) && !value.length)) return;
          queryParams.set(key, Array.isArray(value) ? value.join(",") : value);
        };

        appendParam("trip_id", trip_id);
        appendParam("step", step);

        return {
          url: `/trips/planning/messages/?${queryParams.toString()}`,
          method: "GET",
        };
      },
    }),

    tripAgentRecommendations: builder.query({
      query: ({ trip_id }) => {
        return {
          url: `/trips/planning/recommendations/?trip_id=${trip_id}`,
          method: "GET",
        };
      },
    }),

    tripItineraries: builder.query({
      query: ({ trip_id }) => {
        return {
          url: `/trips/planning/itineraries/?trip_id=${trip_id}`,
          method: "GET",
        };
      },
    }),

    tripPreparation: builder.query({
      query: ({ trip_id }) => {
        return {
          url: `/trips/planning/preparation/?trip_id=${trip_id}`,
          method: "GET",
        };
      },
    }),

    tripOverview: builder.query({
      query: ({ trip_id }) => {
        return {
          url: `/trips/planning/overview/?trip_id=${trip_id}`,
          method: "GET",
        };
      },
    }),

    tripActivate: builder.query({
      query: ({ trip_id }) => {
        return {
          url: `/trips/planning/activate/`,
          method: "POST",
          body: { trip_id: trip_id },
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
  useDeleteTripMutation,
  useTripAgentActiveMutation,
  useTripAgentCreateMessageMutation,
  useTripAgentMessageListQuery,
  useTripAgentRecommendationsQuery,
  useTripItinerariesQuery,
  useTripPreparationQuery,
  useTripOverviewQuery,
  useTripActivateQuery,
  useLazyTripActivateQuery,
} = tripApiSlice;
