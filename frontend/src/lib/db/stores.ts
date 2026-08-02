// Re-export all database modules for clean imports
export { db, isCacheValid } from './database';
export type {
  CachedProduct,
  CachedDashboard,
  CachedProfile,
  CachedFavorite,
  CachedLeaderboard,
  CachedChallenge,
  CachedScan,
  CachedComparison,
  CachedAIConversation,
  CachedSearch,
  CachedSettings,
  CachedNotification,
  OfflineQueueItem,
} from './database';

export {
  enqueueOfflineRequest,
  updateQueueItemStatus,
  incrementRetry,
  getQueuedItems,
  getPendingCount,
  clearCompletedItems,
  cancelQueueItem,
} from './offlineQueue';

export {
  cacheProduct,
  getCachedProduct,
  searchCachedProducts,
  getAllCachedProducts,
  clearProductCache,
} from './productCache';

export {
  cacheDashboardData,
  getCachedDashboardData,
  clearDashboardCache,
  cacheProfile,
  getCachedProfile,
  cacheSetting,
  getCachedSetting,
  cacheAIConversation,
  getCachedAIConversation,
  getAllCachedConversations,
  cacheSearchResults,
  getCachedSearchResults,
  cacheScan,
  getRecentScans,
} from './dashboardCache';
