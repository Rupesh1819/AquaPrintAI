import Dexie, { type EntityTable } from 'dexie';

// ─── Entity Interfaces ───────────────────────────────────────
export interface CachedProduct {
  id: string;
  data: any;
  cachedAt: number;
}

export interface CachedDashboard {
  key: string; // 'summary' | 'charts' | 'activity' | 'insights' | 'recommendations' | 'recent-scans' | 'goals'
  data: any;
  cachedAt: number;
}

export interface CachedProfile {
  id: string;
  data: any;
  cachedAt: number;
}

export interface CachedFavorite {
  id: string;
  productId: string;
  data: any;
  cachedAt: number;
}

export interface CachedLeaderboard {
  key: string;
  data: any;
  cachedAt: number;
}

export interface CachedChallenge {
  id: string;
  data: any;
  cachedAt: number;
}

export interface CachedScan {
  id: string;
  data: any;
  timestamp: number;
}

export interface CachedComparison {
  id: string;
  productIds: string[];
  data: any;
  cachedAt: number;
}

export interface CachedAIConversation {
  id: string;
  messages: any[];
  cachedAt: number;
}

export interface CachedSearch {
  id: string;
  query: string;
  results: any[];
  cachedAt: number;
}

export interface CachedSettings {
  key: string;
  value: any;
  cachedAt: number;
}

export interface CachedNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: number;
}

export interface OfflineQueueItem {
  id: string;
  type: 'scan' | 'favorite' | 'profile' | 'challenge' | 'comparison' | 'ai';
  status: 'queued' | 'uploading' | 'processing' | 'retrying' | 'completed' | 'failed' | 'cancelled' | 'synced';
  payload: any;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  updatedAt: number;
  error?: string;
}

// ─── Database Class ──────────────────────────────────────────
const DB_VERSION = 1;
const DB_NAME = 'AquaPrintAI';

class AquaPrintDB extends Dexie {
  products!: EntityTable<CachedProduct, 'id'>;
  dashboard!: EntityTable<CachedDashboard, 'key'>;
  profile!: EntityTable<CachedProfile, 'id'>;
  favorites!: EntityTable<CachedFavorite, 'id'>;
  leaderboard!: EntityTable<CachedLeaderboard, 'key'>;
  challenges!: EntityTable<CachedChallenge, 'id'>;
  scans!: EntityTable<CachedScan, 'id'>;
  comparisons!: EntityTable<CachedComparison, 'id'>;
  aiConversations!: EntityTable<CachedAIConversation, 'id'>;
  searches!: EntityTable<CachedSearch, 'id'>;
  settings!: EntityTable<CachedSettings, 'key'>;
  notifications!: EntityTable<CachedNotification, 'id'>;
  offlineQueue!: EntityTable<OfflineQueueItem, 'id'>;

  constructor() {
    super(DB_NAME);

    this.version(DB_VERSION).stores({
      products: 'id, cachedAt',
      dashboard: 'key, cachedAt',
      profile: 'id, cachedAt',
      favorites: 'id, productId, cachedAt',
      leaderboard: 'key, cachedAt',
      challenges: 'id, cachedAt',
      scans: 'id, timestamp',
      comparisons: 'id, cachedAt',
      aiConversations: 'id, cachedAt',
      searches: 'id, query, cachedAt',
      settings: 'key, cachedAt',
      notifications: 'id, type, read, createdAt',
      offlineQueue: 'id, type, status, createdAt, updatedAt',
    });
  }
}

export const db = new AquaPrintDB();

// ─── Cache TTL Helper ────────────────────────────────────────
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function isCacheValid(cachedAt: number, ttl: number = DEFAULT_TTL): boolean {
  return Date.now() - cachedAt < ttl;
}
