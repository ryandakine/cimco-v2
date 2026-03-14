import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v2`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('cimco_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: 'An unexpected error occurred',
        };

        if (error.response) {
          apiError.status = error.response.status;
          
          // Handle specific error statuses
          switch (error.response.status) {
            case 401:
              apiError.message = 'Unauthorized. Please log in again.';
              // Clear token and redirect to login
              localStorage.removeItem('cimco_token');
              window.location.href = '/login';
              break;
            case 403:
              apiError.message = 'Forbidden. You do not have permission to perform this action.';
              break;
            case 404:
              apiError.message = 'Resource not found.';
              break;
            case 422:
              apiError.message = 'Validation error.';
              apiError.errors = (error.response.data as { detail?: Record<string, string[]> })?.detail;
              break;
            case 500:
              apiError.message = 'Server error. Please try again later.';
              break;
            default:
              apiError.message = (error.response.data as { detail?: string })?.detail || 'An error occurred';
          }
        } else if (error.request) {
          apiError.message = 'Network error. Please check your connection.';
        }

        return Promise.reject(apiError);
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get<T>(url, config).then(res => res.data);
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post<T>(url, data, config).then(res => res.data);
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put<T>(url, data, config).then(res => res.data);
  }

  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch<T>(url, data, config).then(res => res.data);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete<T>(url, config).then(res => res.data);
  }
}

export const apiClient = new ApiClient();
