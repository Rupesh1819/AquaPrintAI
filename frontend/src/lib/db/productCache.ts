import { db, isCacheValid } from './database';

const PRODUCT_TTL = 30 * 60 * 1000; // 30 minutes

export async function cacheProduct(id: string, data: any): Promise<void> {
  await db.products.put({ id, data, cachedAt: Date.now() });
}

export async function getCachedProduct(id: string): Promise<any | null> {
  const cached = await db.products.get(id);
  if (cached && isCacheValid(cached.cachedAt, PRODUCT_TTL)) {
    return cached.data;
  }
  return null;
}

export async function searchCachedProducts(query: string): Promise<any[]> {
  const allProducts = await db.products.toArray();
  const lowerQuery = query.toLowerCase();

  return allProducts
    .filter(p => {
      const d = p.data;
      return (
        d?.name?.toLowerCase().includes(lowerQuery) ||
        d?.brand?.toLowerCase().includes(lowerQuery) ||
        d?.description?.toLowerCase().includes(lowerQuery) ||
        d?.category?.toLowerCase().includes(lowerQuery)
      );
    })
    .map(p => p.data);
}

export async function getAllCachedProducts(): Promise<any[]> {
  const all = await db.products.toArray();
  return all.map(p => p.data);
}

export async function clearProductCache(): Promise<void> {
  await db.products.clear();
}
