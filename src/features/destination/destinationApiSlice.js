import { apiSlice } from "../api/apiSlice";

export const destinationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    destinationList: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          page_size = 10,
          search,
          search_query,
          destination_type,
          country_code,
          budget_tier,
          difficulty,
          tag,
          best_travel_month,
          region,
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
        appendParam("destination_type", destination_type);
        appendParam("country_code", country_code);
        appendParam("budget_tier", budget_tier);
        appendParam("difficulty", difficulty);
        appendParam("tag", tag);
        appendParam("best_travel_month", best_travel_month);
        appendParam("region", region);

        return {
          url: `/destinations/list?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["destination-list"],
    }),

    destinationDetail: builder.query({
      query: (destination_slug) => {
        return {
          url: `/destinations/${destination_slug}/detail/`,
          method: "GET",
        };
      },
      providesTags: (result, error, destination_slug) => [
        { type: "destination-detail", id: destination_slug },
      ],
    }),

    saveDestination: builder.mutation({
      query: ({ destination_slug, save }) => {
        return {
          url: `/destinations/${destination_slug}/save/`,
          method: "POST",
          body: {
            save: save,
          },
        };
      },
      invalidatesTags: (result, error, { destination_slug }) => [
        "destination-list",
        "saved-destination-list",
        { type: "destination-detail", id: destination_slug },
      ],
    }),

    saveDestinationList: builder.query({
      query: ({ page = 1, pageSize = 12 } = {}) => {
        return {
          url: `/destinations/save/list/?page=${page}&page_size=${pageSize}`,
          method: "GET",
        };
      },
      providesTags: ["saved-destination-list"],
    }),
  }),
});

export const {
  useDestinationListQuery,
  useDestinationDetailQuery,
  useSaveDestinationListQuery,
  useSaveDestinationMutation,
} = destinationApiSlice;
