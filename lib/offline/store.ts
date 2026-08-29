"use client";

import { create } from "zustand";
import type { OfflineQueueItem } from "@/lib/types";

interface OfflineStore {
  isOnline: boolean;
  isSyncing: boolean;
  queueCount: number;
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setQueueCount: (count: number) => void;
  pendingItems: OfflineQueueItem[];
  setPendingItems: (items: OfflineQueueItem[]) => void;
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isSyncing: false,
  queueCount: 0,
  setOnline: (online) => set({ isOnline: online }),
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setQueueCount: (count) => set({ queueCount: count }),
  pendingItems: [],
  setPendingItems: (items) =>
    set({ pendingItems: items, queueCount: items.length }),
}));
