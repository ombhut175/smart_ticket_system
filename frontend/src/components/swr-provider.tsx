"use client"

import React from 'react'
import { SWRConfig } from 'swr'
import { handleError } from '@/helpers/errors'
import { fetcher } from '@/lib/swr/fetchers'

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        // Default fetcher uses helpers/apiRequest to return unwrapped data
        fetcher,
        revalidateOnFocus: true,
        shouldRetryOnError: true,
        errorRetryCount: 2,
        dedupingInterval: 2000,
        onError: (error) => handleError(error),
      }}
    >
      {children}
    </SWRConfig>
  )
}

