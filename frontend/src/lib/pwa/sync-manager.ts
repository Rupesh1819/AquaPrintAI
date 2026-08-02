import { getQueuedItems, updateQueueItemStatus, incrementRetry } from '@/lib/db/offlineQueue';
import type { OfflineQueueItem } from '@/lib/db/database';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ─── Sync Processor ──────────────────────────────────────────

async function processQueueItem(item: OfflineQueueItem, token?: string): Promise<boolean> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    await updateQueueItemStatus(item.id, 'uploading');

    let response: Response;

    switch (item.type) {
      case 'scan': {
        const formData = new FormData();
        // Convert base64 back to blob
        const blob = await fetch(item.payload.imageData).then(r => r.blob());
        formData.append('image', blob, 'scan.jpg');
        response = await fetch(`${API_URL}/scanner/process-image`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        break;
      }
      case 'favorite':
        response = await fetch(`${API_URL}/users/favorites`, {
          method: item.payload.action === 'remove' ? 'DELETE' : 'POST',
          headers,
          body: JSON.stringify({ product_id: item.payload.productId }),
        });
        break;
      case 'profile':
        response = await fetch(`${API_URL}/auth/profile`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(item.payload),
        });
        break;
      case 'challenge':
        response = await fetch(`${API_URL}/gamification/challenges/${item.payload.challengeId}/progress`, {
          method: 'POST',
          headers,
          body: JSON.stringify(item.payload),
        });
        break;
      case 'comparison':
        response = await fetch(`${API_URL}/comparison/save`, {
          method: 'POST',
          headers,
          body: JSON.stringify(item.payload),
        });
        break;
      case 'ai':
        response = await fetch(`${API_URL}/ai/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify(item.payload),
        });
        break;
      default:
        await updateQueueItemStatus(item.id, 'failed', `Unknown type: ${item.type}`);
        return false;
    }

    if (response.ok) {
      await updateQueueItemStatus(item.id, 'synced');
      return true;
    } else {
      await incrementRetry(item.id);
      return false;
    }
  } catch (_) {
    await incrementRetry(item.id);
    return false;
  }
}

// ─── Background Sync ─────────────────────────────────────────

export async function processOfflineQueue(token?: string): Promise<{ success: number; failed: number }> {
  const items = await getQueuedItems();
  let success = 0;
  let failed = 0;

  for (const item of items) {
    const result = await processQueueItem(item, token);
    if (result) success++;
    else failed++;
  }

  return { success, failed };
}

// ─── Online/Offline Event Listener ───────────────────────────

let syncInProgress = false;

export function initBackgroundSync(getToken: () => string | undefined): void {
  if (typeof window === 'undefined') return;

  const handleOnline = async () => {
    if (syncInProgress) return;
    syncInProgress = true;

    try {
      const token = getToken();
      const result = await processOfflineQueue(token);
      if (result.success > 0) {
        console.log(`[Sync] Processed ${result.success} queued items.`);
      }
    } finally {
      syncInProgress = false;
    }
  };

  window.addEventListener('online', handleOnline);

  // Also run on init if already online
  if (navigator.onLine) {
    handleOnline();
  }
}
