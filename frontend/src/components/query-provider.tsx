"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, useEffect } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  }));

  const [persister, setPersister] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const syncStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
        key: 'AQUAPRINT_QUERY_OFFLINE_CACHE'
      });
      setPersister(syncStoragePersister);
    }
  }, []);

  if (!persister) {
    return null; // or a loading state if preferred, but usually fast enough
  }

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      {children}
    </PersistQueryClientProvider>
  );
}
