import { apiSlice } from "./api";

export const authApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation({
			query: (data) => {
				return {
					url: `/auth/login`,
					method: "POST",
					body: data,
				};
			},
			invalidatesTags: ["auth"],
		}),

		register: builder.mutation({
			query: (data) => {
				return {
					url: `/auth/register`,
					method: "POST",
					body: data,
				};
			},
			invalidatesTags: ["auth"],
		}),

		verifyRegistration: builder.mutation({
			query: (data) => {
				return {
					url: `/auth/verified-signup`,
					method: "POST",
					body: data,
				};
			},
		}),

		forgotPassword: builder.mutation({
			query: (data) => {
				const { bodyData } = data;
				return {
					url: `auth/forget-password`,
					method: "POST",
					body: bodyData,
				};
			},
		}),

		resetPassword: builder.mutation({
			query: (data) => {
				const { bodyData, userId, token } = data;
				return {
					url: `auth/forgot-password/${userId}/${token}`,
					method: "POST",
					body: bodyData,
				};
			},
		}),

		changePassword: builder.mutation({
			query: (payload) => {
				return {
					url: `/auth/reset-password`,
					method: "PATCH",
					body: payload,
				};
			},
		}),
	}),
});

export const {
	useLoginMutation,
	useRegisterMutation,
	useVerifyRegistrationMutation,
	useForgotPasswordMutation,
	useResetPasswordMutation,
	useChangePasswordMutation,
} = authApiSlice;