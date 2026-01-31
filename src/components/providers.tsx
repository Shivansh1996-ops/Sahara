"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/stores/theme-store";

interface ProvidersProps {
  children: ReactNode;
}

function ThemeInitializer() {
  const initialize = useThemeStore((state) => state.initialize);
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  return null;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      {children}
    </QueryClientProvider>
  );
}
