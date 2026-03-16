'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,                    // Don't auto-retry failed requests (saves rate limit)
        refetchOnWindowFocus: false,     // Don't refetch when switching tabs
        staleTime: 30 * 1000,            // Data is fresh for 30s — prevents duplicate fetches
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
