import { apiSlice } from "../api/apiSlice";

const nextDestinationFeaturePage = (lastPage, allPages, lastPageParam) =>
  lastPage?.meta?.next ? lastPageParam + 1 : undefined;

const destinationPaginationParams = ({ page = 1, page_size = 10, ...params } = {}) => {
  const queryParams = new URLSearchParams({
    page: String(page),
    page_size: String(page_size),
  });

  Object.entries(params).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && !value.length)) return;
    queryParams.set(key, Array.isArray(value) ? value.join(",") : value);
  });

  return queryParams.toString();
};

export const destinationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    destinationList: builder.query({
      query: (params = {}) => {
        return {
          url: `/destinations/list?${destinationPaginationParams({
            ...params,
            search: params.search || params.search_query,
          })}`,
          method: "GET",
        };
      },
      providesTags: ["destination-list"],
    }),

    destinationInfiniteList: builder.infiniteQuery({
      query: ({ queryArg = {}, pageParam }) => ({
        url: `/destinations/list?${destinationPaginationParams({
          ...queryArg,
          page: pageParam,
          search: queryArg.search || queryArg.search_query,
        })}`,
        method: "GET",
      }),
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: nextDestinationFeaturePage,
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

    destinationShortDetail: builder.query({
      query: (destination_slug) => {
        return {
          url: `/destinations/${destination_slug}/short-detail/`,
          method: "GET",
        };
      },
      providesTags: (result, error, destination_slug) => [
        { type: "destination-short-detail", id: destination_slug },
      ],
    }),

    destinationFeatureDetail: builder.query({
      query: ({ destination_slug, feature_type, feature_slug }) => ({
        url: `/destinations/${destination_slug}/${feature_type}/${feature_slug}/`,
        method: "GET",
      }),
      providesTags: (
        result,
        error,
        { destination_slug, feature_type, feature_slug },
      ) => [
        {
          type: "destination-feature-list",
          id: `${destination_slug}-${feature_type}-${feature_slug}`,
        },
      ],
    }),

    destinationFeatureList: builder.query({
      query: ({
        destination_slug,
        feature_type,
        page = 1,
        page_size = 12,
        search,
      }) => {
        const queryParams = new URLSearchParams({
          page: String(page),
          page_size: String(page_size),
        });

        if (search) queryParams.set("search", search);

        return {
          url: `/destinations/${destination_slug}/${feature_type}/?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result, error, { destination_slug, feature_type }) => [
        { type: "destination-detail", id: destination_slug },
        {
          type: "destination-feature-list",
          id: `${destination_slug}-${feature_type}`,
        },
      ],
    }),

    destinationFeatureInfiniteList: builder.infiniteQuery({
      query: ({ queryArg = {}, pageParam }) => {
        const {
          destination_slug,
          feature_type,
          page_size = 12,
          search,
        } = queryArg;

        const queryParams = new URLSearchParams({
          page: String(pageParam),
          page_size: String(page_size),
        });

        if (search) queryParams.set("search", search);

        return {
          url: `/destinations/${destination_slug}/${feature_type}/?${queryParams.toString()}`,
          method: "GET",
        };
      },
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: nextDestinationFeaturePage,
      },
      providesTags: (result, error, { destination_slug, feature_type }) => [
        { type: "destination-detail", id: destination_slug },
        {
          type: "destination-feature-list",
          id: `${destination_slug}-${feature_type}`,
        },
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

    saveDestinationInfiniteList: builder.infiniteQuery({
      query: ({ queryArg = {}, pageParam }) => {
        const { pageSize = 12 } = queryArg;

        return {
          url: `/destinations/save/list/?page=${pageParam}&page_size=${pageSize}`,
          method: "GET",
        };
      },
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: nextDestinationFeaturePage,
      },
      providesTags: ["saved-destination-list"],
    }),

    autogeneratedMessage: builder.query({
      query: () => {
        return {
          url: `/destinations/autogenerated-message/`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useDestinationListQuery,
  useDestinationInfiniteListInfiniteQuery,
  useDestinationDetailQuery,
  useDestinationShortDetailQuery,
  useDestinationFeatureDetailQuery,
  useDestinationFeatureListQuery,
  useDestinationFeatureInfiniteListInfiniteQuery,
  useSaveDestinationListQuery,
  useSaveDestinationInfiniteListInfiniteQuery,
  useSaveDestinationMutation,
  useAutogeneratedMessageQuery,
} = destinationApiSlice;
