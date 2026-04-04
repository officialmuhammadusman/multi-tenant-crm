// src/lib/api/axios-instance.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { API } from '../api-routes';
import type { ApiResponseShape } from '@crm/types';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000,
});

let _accessToken: string | null = null;
let _isRefreshing = false;
let _refreshQueue: Array<(token: string | null) => void> = [];

export function setAxiosToken(token: string | null): void {
  _accessToken = token;
}

function processQueue(token: string | null): void {
  _refreshQueue.forEach((cb) => cb(token));
  _refreshQueue = [];
}

// ── Request: attach JWT ───────────────────────────────────────────────────────
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) config.headers['Authorization'] = `Bearer ${_accessToken}`;
  config.headers['X-Correlation-ID'] = crypto.randomUUID();
  return config;
});

// ── Response: unwrap ApiResponse + silent refresh on 401 ─────────────────────
axiosInstance.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponseShape<unknown>;
    if (body && typeof body === 'object' && 'success' in body && !body.success) {
      return Promise.reject(Object.assign(new Error(body.message ?? 'Request failed'), { response }));
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const body = error.response?.data as ApiResponseShape<unknown> | undefined;
    const status = body?.statusCode ?? error.response?.status;

    if (status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _refreshQueue.push((token) => {
            if (token) { original.headers['Authorization'] = `Bearer ${token}`; resolve(axiosInstance(original)); }
            else reject(error);
          });
        });
      }
      original._retry = true;
      _isRefreshing = true;
      try {
        const res = await axiosInstance.post(API.auth.refresh);
        const newToken = (res.data as ApiResponseShape<{ accessToken: string }>).data?.accessToken;
        if (newToken) {
          setAxiosToken(newToken);
          window.dispatchEvent(new CustomEvent('token:refreshed', { detail: { accessToken: newToken } }));
          processQueue(newToken);
          original.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(original);
        }
      } catch {
        processQueue(null);
        window.dispatchEvent(new CustomEvent('auth:logout'));
        toast.error('Session expired. Please log in again.');
      } finally {
        _isRefreshing = false;
      }
    }

    if (!error.response) toast.error('Network error — please check your connection');
    return Promise.reject(error);
  },
);

export default axiosInstance;
