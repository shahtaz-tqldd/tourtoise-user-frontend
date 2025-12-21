import { apiSlice } from "./api";

export const destinationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    destinationList: builder.query({
      query: ({ page = 1, page_size = 10, search_str = "" }) => {
        let url = `/destinations/list?page=${page}&page_size=${page_size}`;
        if (search_str) {
          url += `&search_str=${search_str}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["destination-list"],
    }),

    destinationDetails: builder.query({
      query: ({ destination_slug }) => {
        return {
          url: `/destinations?destination_slug=${destination_slug}`,
          method: "GET",
        };
      },
      providesTags: ["destination-details"],
    }),
  }),
});

export const {
  useDestinationListQuery,
  useDestinationDetailsQuery,
} = destinationApiSlice;