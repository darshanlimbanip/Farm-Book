"use client";

import { useOfflineStore } from "./store";
import {
  getOfflineQueue,
  removeFromQueue,
  incrementRetry,
} from "./db";

import type { OfflineActionType } from "@/lib/types";

type SyncHandler = (item: {
  type: OfflineActionType;
  action: "create" | "update" | "delete";
  payload: Record<string, unknown>;
}) => Promise<{ success: boolean; error?: string }>;

let syncHandler: SyncHandler | null = null;

export function registerSyncHandler(handler: SyncHandler) {
  syncHandler = handler;
}

export async function flushOfflineQueue(): Promise<void> {
  if (!navigator.onLine || !syncHandler) return;

  const store = useOfflineStore.getState();
  if (store.isSyncing) return;

  store.setSyncing(true);
  const items = await getOfflineQueue();
  store.setPendingItems(items);

  for (const item of items) {
    try {
      const result = await syncHandler({
        type: item.type,
        action: item.action,
        payload: item.payload,
      });
      if (result.success) {
        await removeFromQueue(item.id);
      } else if (item.retries < 3) {
        await incrementRetry(item.id);
      }
    } catch {
      if (item.retries < 3) {
        await incrementRetry(item.id);
      }
    }
  }

  const remaining = await getOfflineQueue();
  store.setPendingItems(remaining);
  store.setSyncing(false);
}

export function initOfflineSync() {
  const store = useOfflineStore.getState();

  const handleOnline = () => {
    store.setOnline(true);
    flushOfflineQueue();
  };

  const handleOffline = () => {
    store.setOnline(false);
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  store.setOnline(navigator.onLine);

  getOfflineQueue().then((items) => {
    store.setPendingItems(items);
    if (navigator.onLine) flushOfflineQueue();
  });

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
