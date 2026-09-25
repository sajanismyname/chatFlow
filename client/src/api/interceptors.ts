import api from "./axios";
import {store} from "../app/store";
import {
    setAccessToken,
    logoutUser,
} from "../features/auth/authSlice";

let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
    const accessToken =
    store.getState().auth.accessToken;

    if (accessToken) {
        config.headers.Authorization =
            `Bearer ${accessToken}`;
    }

    return config;
});


api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
    error.response?.status === 401 &&
    !originalRequest._retry &&
    !originalRequest.url?.includes("/auth/refresh") &&
    !originalRequest.url?.includes("/auth/login") &&
    !originalRequest.url?.includes("/auth/register")
) {
    originalRequest._retry = true;

    try {
        if (!refreshPromise) {
            refreshPromise = api
                .post("/auth/refresh")
                .then((response) => {
                    const newAccessToken =
                        response.data.accessToken;

                    store.dispatch(
                        setAccessToken(newAccessToken)
                    );

                    return newAccessToken;
                })
                .finally(() => {
                    refreshPromise = null;
                });
        }

        const newAccessToken =
            await refreshPromise;

        originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;

        return api(originalRequest);
    } catch (refreshError) {
        store.dispatch(logoutUser());

        return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
})