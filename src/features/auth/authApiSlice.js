import { apiSlice } from "../api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => {
        return {
          url: `/accounts/login/`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["my-profile"],
    }),

    register: builder.mutation({
      query: (payload) => {
        return {
          url: `/accounts/register/`,
          method: "POST",
          body: payload,
        };
      },
    }),

    googleAuth: builder.mutation({
      query: (payload) => {
        return {
          url: `/accounts/google/`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["my-profile"],
    }),

    refresh: builder.mutation({
      query: (payload) => {
        return {
          url: `/accounts/refresh/`,
          method: "POST",
          body: payload,
        };
      },
    }),

    publicAccount: builder.query({
      query: (username) => {
        return {
          url: `/accounts/public/${username}/`,
          method: "GET",
        };
      },
    }),

    selfDetails: builder.query({
      query: () => {
        return {
          url: `/accounts/self-details/`,
          method: "GET",
        };
      },
      providesTags: ["my-profile"],
    }),

    updateAccount: builder.mutation({
      query: (payload) => {
        return {
          url: `/accounts/update/`,
          method: "PATCH",
          body: payload,
        };
      },
      invalidatesTags: ["my-profile"],
    }),

    changePassword: builder.mutation({
      query: (payload) => {
        return {
          url: `/accounts/change-password/`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    deleteAccount: builder.mutation({
      query: () => {
        return {
          url: `/accounts/delete/`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["my-profile"],
    }),

    requestResetPassword: builder.mutation({
      query: (payload) => {
        return {
          url: `/accounts/request-reset-password/`,
          method: "POST",
          body: payload,
        };
      },
    }),

    resetPassword: builder.mutation({
      query: (payload) => {
        return {
          url: `/accounts/reset-password/`,
          method: "POST",
          body: payload,
        };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGoogleAuthMutation,
  useRefreshMutation,
  usePublicAccountQuery,
  useSelfDetailsQuery,
  useUpdateAccountMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useRequestResetPasswordMutation,
  useResetPasswordMutation,
} = authApiSlice;
