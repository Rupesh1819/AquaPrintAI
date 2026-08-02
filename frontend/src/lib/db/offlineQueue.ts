import { db, type OfflineQueueItem } from './database';
import { v4 as uuidv4 } from 'uuid';

// ─── Queue Operations ────────────────────────────────────────

export async function enqueueOfflineRequest(
  type: OfflineQueueItem['type'],
  payload: any,
  maxRetries: number = 3
): Promise<string> {
  const id = uuidv4();
  const now = Date.now();

  await db.offlineQueue.add({
    id,
    type,
    status: 'queued',
    payload,
    retryCount: 0,
    maxRetries,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateQueueItemStatus(
  id: string,
  status: OfflineQueueItem['status'],
  error?: string
): Promise<void> {
  await db.offlineQueue.update(id, {
    status,
    updatedAt: Date.now(),
    ...(error ? { error } : {}),
  });
}

export async function incrementRetry(id: string): Promise<void> {
  const item = await db.offlineQueue.get(id);
  if (!item) return;

  if (item.retryCount + 1 >= item.maxRetries) {
    await updateQueueItemStatus(id, 'failed', 'Max retries exceeded');
  } else {
    await db.offlineQueue.update(id, {
      retryCount: item.retryCount + 1,
      status: 'retrying',
      updatedAt: Date.now(),
    });
  }
}

export async function getQueuedItems(
  type?: OfflineQueueItem['type']
): Promise<OfflineQueueItem[]> {
  if (type) {
    return db.offlineQueue
      .where('type').equals(type)
      .and(item => item.status === 'queued' || item.status === 'retrying')
      .toArray();
  }
  return db.offlineQueue
    .where('status').anyOf('queued', 'retrying')
    .toArray();
}

export async function getPendingCount(): Promise<number> {
  return db.offlineQueue
    .where('status').anyOf('queued', 'retrying', 'uploading', 'processing')
    .count();
}

export async function clearCompletedItems(): Promise<void> {
  await db.offlineQueue
    .where('status').anyOf('completed', 'synced', 'cancelled')
    .delete();
}

export async function cancelQueueItem(id: string): Promise<void> {
  await updateQueueItemStatus(id, 'cancelled');
}
