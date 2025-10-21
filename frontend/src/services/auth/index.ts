import { api } from "../axios";
import type { ApiResponse, PaginatedResponse } from "../type";

// 사용자 관련 타입
export type User = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};

export type CreateUserRequest = {
  email: string;
  name: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

const authApi = {
  socialLogin: async (provider: string) => {
    const response = await api.get(`/auth/${provider}`);
    return response.data;
  },

  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      data
    );

    return response.data;
  },

  async register(data: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>("/auth/register", data);
    return response.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>("/auth/profile");
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>("/auth/profile", data);
    return response.data;
  },

  async getUsers(
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
      `/auth/users?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

export default authApi;
