// providers.tsx
"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
       {/* Add DevTools here */}
      <ReactQueryDevtools 
        initialIsOpen={false} 
      />
    </QueryClientProvider>
  )
}