import { useState } from "react";
import { api } from "@/services/axios";
import type { ApiResponse, ApiError, RequestState } from "@/services/type";
import type { AxiosRequestConfig } from "axios";

export function useApi<T>() {
  const [state, setState] = useState<RequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async (
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await api.request<ApiResponse<T>>({
        method,
        url,
        data,
        ...config,
      });

      setState({
        data: response.data.data,
        loading: false,
        error: null,
      });

      return response.data;
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      const errorMessage =
        apiError.response?.data?.message || "알 수 없는 오류가 발생했습니다.";

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      throw error;
    }
  };

  const get = (url: string, config?: Record<string, unknown>) =>
    execute("GET", url, undefined, config);

  const post = (
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ) => execute("POST", url, data, config);

  const put = (url: string, data?: unknown, config?: Record<string, unknown>) =>
    execute("PUT", url, data, config);

  const del = (url: string, config?: Record<string, unknown>) =>
    execute("DELETE", url, undefined, config);

  const patch = (
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ) => execute("PATCH", url, data, config);

  return {
    ...state,
    execute,
    get,
    post,
    put,
    delete: del,
    patch,
  };
}
