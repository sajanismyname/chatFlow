import api from "./axios";
import {store} from "../app/store";
import {
    setAccessToken,
    logout,
} from "../features/auth/authSlice";

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
        const response = await api.post("/auth/refresh");

        const newAccessToken =
            response.data.accessToken;

        store.dispatch(
            setAccessToken(newAccessToken)
        );

        originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;

        return api(originalRequest);

    } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
    }
}

        return Promise.reject(error);
    }
);