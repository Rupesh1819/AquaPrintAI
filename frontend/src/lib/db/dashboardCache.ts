import { db, isCacheValid } from './database';

const DASHBOARD_TTL = 5 * 60 * 1000; // 5 minutes

export async function cacheDashboardData(key: string, data: any): Promise<void> {
  await db.dashboard.put({ key, data, cachedAt: Date.now() });
}

export async function getCachedDashboardData(key: string): Promise<any | null> {
  const cached = await db.dashboard.get(key);
  if (cached && isCacheValid(cached.cachedAt, DASHBOARD_TTL)) {
    return cached.data;
  }
  return null;
}

export async function clearDashboardCache(): Promise<void> {
  await db.dashboard.clear();
}

// ─── Profile Cache ───────────────────────────────────────────
export async function cacheProfile(id: string, data: any): Promise<void> {
  await db.profile.put({ id, data, cachedAt: Date.now() });
}

export async function getCachedProfile(id: string): Promise<any | null> {
  const cached = await db.profile.get(id);
  if (cached && isCacheValid(cached.cachedAt, 10 * 60 * 1000)) {
    return cached.data;
  }
  return null;
}

// ─── Settings Cache ──────────────────────────────────────────
export async function cacheSetting(key: string, value: any): Promise<void> {
  await db.settings.put({ key, value, cachedAt: Date.now() });
}

export async function getCachedSetting(key: string): Promise<any | null> {
  const cached = await db.settings.get(key);
  return cached?.value ?? null;
}

// ─── AI Conversation Cache ───────────────────────────────────
export async function cacheAIConversation(id: string, messages: any[]): Promise<void> {
  await db.aiConversations.put({ id, messages, cachedAt: Date.now() });
}

export async function getCachedAIConversation(id: string): Promise<any[] | null> {
  const cached = await db.aiConversations.get(id);
  return cached?.messages ?? null;
}

export async function getAllCachedConversations(): Promise<any[]> {
  return db.aiConversations.toArray();
}

// ─── Search Cache ────────────────────────────────────────────
export async function cacheSearchResults(query: string, results: any[]): Promise<void> {
  const id = `search-${query.toLowerCase().trim()}`;
  await db.searches.put({ id, query: query.toLowerCase().trim(), results, cachedAt: Date.now() });
}

export async function getCachedSearchResults(query: string): Promise<any[] | null> {
  const id = `search-${query.toLowerCase().trim()}`;
  const cached = await db.searches.get(id);
  if (cached && isCacheValid(cached.cachedAt, 15 * 60 * 1000)) {
    return cached.results;
  }
  return null;
}

// ─── Scan History Cache ──────────────────────────────────────
export async function cacheScan(id: string, data: any): Promise<void> {
  await db.scans.put({ id, data, timestamp: Date.now() });
}

export async function getRecentScans(limit: number = 50): Promise<any[]> {
  const scans = await db.scans.orderBy('timestamp').reverse().limit(limit).toArray();
  return scans.map(s => s.data);
}
