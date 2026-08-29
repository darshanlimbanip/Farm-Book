"use client";

import { useEffect } from "react";
import { registerSyncHandler, initOfflineSync } from "@/lib/offline/sync";
import { syncOfflineAction } from "@/lib/offline/actions";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerSyncHandler(syncOfflineAction);
    return initOfflineSync();
  }, []);

  return <>{children}</>;
}
