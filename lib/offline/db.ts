import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { OfflineQueueItem } from "@/lib/types";

interface FarmBookDB extends DBSchema {
  offline_queue: {
    key: string;
    value: OfflineQueueItem;
    indexes: { "by-created": number };
  };
  cache: {
    key: string;
    value: { key: string; data: unknown; updatedAt: number };
  };
}

const DB_NAME = "farm-book";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FarmBookDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FarmBookDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const queueStore = db.createObjectStore("offline_queue", {
          keyPath: "id",
        });
        queueStore.createIndex("by-created", "createdAt");

        db.createObjectStore("cache", { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

export async function enqueueOfflineAction(
  item: Omit<OfflineQueueItem, "createdAt" | "retries">
): Promise<void> {
  const db = await getDB();
  await db.put("offline_queue", {
    ...item,
    createdAt: Date.now(),
    retries: 0,
  });
}

export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex("offline_queue", "by-created");
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("offline_queue", id);
}

export async function incrementRetry(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get("offline_queue", id);
  if (item) {
    await db.put("offline_queue", { ...item, retries: item.retries + 1 });
  }
}

export async function setCache(key: string, data: unknown): Promise<void> {
  const db = await getDB();
  await db.put("cache", { key, data, updatedAt: Date.now() });
}

export async function getCache<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const entry = await db.get("cache", key);
  return entry ? (entry.data as T) : null;
}

export async function clearCache(key: string): Promise<void> {
  const db = await getDB();
  await db.delete("cache", key);
}
