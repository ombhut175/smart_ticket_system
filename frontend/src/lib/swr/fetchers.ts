import useSWR, { SWRConfiguration, SWRResponse } from 'swr'
import useSWRMutation, { SWRMutationConfiguration, SWRMutationResponse } from 'swr/mutation'
import { apiRequest, apiRequestRaw } from '@/helpers/request'

// Shared fetcher: return the API response envelope (data, meta, etc.) to match existing consumers
export const fetcher = async <T>(url: string): Promise<T> => {
  return apiRequestRaw.get<T>(url)
}

// Helpers for typed SWR usage
export function useApiSWR<T = any>(
  key: string | null,
  config?: SWRConfiguration<T>
): SWRResponse<T> {
  return useSWR<T>(key, fetcher<T>, config)
}

// Mutation helpers (use helpers to get unwrapped data)
export async function postFetcher<T = any>(url: string, { arg }: { arg?: any }): Promise<T> {
  return apiRequest.post<T>(url, arg)
}

export async function putFetcher<T = any>(url: string, { arg }: { arg?: any }): Promise<T> {
  return apiRequest.put<T>(url, arg)
}

export async function patchFetcher<T = any>(url: string, { arg }: { arg?: any }): Promise<T> {
  return apiRequest.patch<T>(url, arg)
}

export async function deleteFetcher<T = any>(url: string): Promise<T> {
  return apiRequest.delete<T>(url)
}

export function useApiMutation<T = any, A = any>(
  url: string | null,
  fetcherFn: (url: string, opts: { arg: A }) => Promise<T>,
  config?: SWRMutationConfiguration<T, any, string, A>
): SWRMutationResponse<T, any, string, A> {
  return useSWRMutation<T, any, string, A>(url as string, fetcherFn, config)
}
