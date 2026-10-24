/**
 * Typed API client foundation (Task 5-c, Phase 1/2).
 *
 * A thin, typed layer OVER the existing central `apiFetch` helper in
 * `lib/utils.ts` (auth token, tenant headers, 401 redirect, retries are all
 * handled there and remain untouched). This module only adds:
 *   - `ApiError` (status + message + parsed payload) instead of bare failures
 *   - `apiGet / apiPost / apiPut / apiDelete` generic helpers
 *   - `unwrapList<T>` centralizing the `data || data.data || data.items` pattern
 *
 * Existing `apiFetch` call sites are NOT migrated yet (later phase); new code
 * and TanStack Query hooks should prefer this client.
 *
 * @example
 * // 1) List fetch with defensive unwrapping
 * import { apiGet, unwrapList } from '@/lib/api/client';
 * type Bank = { id: number; title: string };
 * const data = await apiGet<unknown>('/api/rap/banks');
 * const banks: Bank[] = unwrapList<Bank>(data);
 *
 * @example
 * // 2) Create with a JSON body (also: apiPut / apiDelete)
 * import { apiPost } from '@/lib/api/client';
 * const created = await apiPost<Omit<Bank, 'id'>, Bank>('/api/rap/banks', { title: 'بانک جدید' });
 *
 * @example
 * // 3) TanStack Query integration (provider is mounted in components/Providers.tsx)
 * import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 * import { apiGet, apiPost, unwrapList, ApiError } from '@/lib/api/client';
 *
 * function useBanks() {
 *   return useQuery<Bank[], ApiError>({
 *     queryKey: ['rap', 'banks'],
 *     queryFn: async () => unwrapList<Bank>(await apiGet('/api/rap/banks')),
 *   });
 * }
 *
 * function useCreateBank() {
 *   const qc = useQueryClient();
 *   return useMutation({
 *     mutationFn: (body: Omit<Bank, 'id'>) => apiPost<Omit<Bank, 'id'>, Bank>('/api/rap/banks', body),
 *     onSuccess: () => qc.invalidateQueries({ queryKey: ['rap', 'banks'] }),
 *   });
 * }
 */

import { apiFetch } from '../utils';

/** Error thrown by every helper in this module on a non-2xx response. */
export class ApiError extends Error {
  /** HTTP status code of the failed response. */
  readonly status: number;
  /** Parsed JSON body when available (undefined for non-JSON bodies). */
  readonly payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

function toApiError(res: Response, payload: unknown): ApiError {
  const message =
    payload && typeof payload === 'object' && typeof (payload as Record<string, unknown>).message === 'string'
      ? ((payload as Record<string, unknown>).message as string)
      : res.statusText || `Request failed with status ${res.status}`;
  return new ApiError(res.status, message, payload);
}

async function request<TRes>(url: string, method: string, body?: unknown, init?: RequestInit): Promise<TRes> {
  const res = await apiFetch(url, {
    ...init,
    method,
    ...(body !== undefined
      ? {
          headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
          body: JSON.stringify(body),
        }
      : {}),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw toApiError(res, data);
  }
  return data as TRes;
}

/** GET a JSON endpoint. Throws {@link ApiError} on non-2xx. */
export function apiGet<T>(url: string, init?: RequestInit): Promise<T> {
  return request<T>(url, 'GET', undefined, init);
}

/** POST a JSON body and return the parsed response. Throws {@link ApiError} on non-2xx. */
export function apiPost<TBody, TRes>(url: string, body?: TBody, init?: RequestInit): Promise<TRes> {
  return request<TRes>(url, 'POST', body, init);
}

/** PUT a JSON body and return the parsed response. Throws {@link ApiError} on non-2xx. */
export function apiPut<TBody, TRes>(url: string, body?: TBody, init?: RequestInit): Promise<TRes> {
  return request<TRes>(url, 'PUT', body, init);
}

/** DELETE an endpoint and return the parsed response. Throws {@link ApiError} on non-2xx. */
export function apiDelete<TRes>(url: string, init?: RequestInit): Promise<TRes> {
  return request<TRes>(url, 'DELETE', undefined, init);
}

/**
 * Centralizes the defensive `data || data.data || data.items` list-unwrapping
 * pattern duplicated across dozens of components.
 *
 * Returns the first array found among: the value itself, `.data`, `.items`;
 * otherwise an empty array (never null/undefined).
 */
export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}
