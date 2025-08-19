"use client";

import * as React from "react";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const initialized = useAuthStore((s) => s.initialized);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  return <>{children}</>;
}

