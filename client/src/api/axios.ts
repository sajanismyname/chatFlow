import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

import { store } from "../app/store";
import { setAccessToken, logout } from "../auth/authSlice";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const accessToken = store.getState().auth.accessToken;

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest =
            error.config as InternalAxiosRequestConfig & {
                _retry?: boolean;
            };

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
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

export default api;