import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface QueuedScan {
  id: string;
  type: 'barcode' | 'image';
  payload: any; // e.g. barcode string or base64 image
  timestamp: number;
}

export interface OfflineState {
  recentProducts: Record<string, any>;
  scanHistory: Record<string, any>[]; // Successful scans
  scanQueue: QueuedScan[]; // Pending scans to be processed when online
  categories: any[];
  manufacturers: any[];
  
  // Actions
  addRecentProduct: (product: any) => void;
  addScanToHistory: (scan: any) => void;
  queueScan: (scan: QueuedScan) => void;
  removeQueuedScan: (id: string) => void;
  setCategories: (categories: any[]) => void;
  setManufacturers: (manufacturers: any[]) => void;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      recentProducts: {},
      scanHistory: [],
      scanQueue: [],
      categories: [],
      manufacturers: [],

      addRecentProduct: (product) => set((state) => ({
        recentProducts: {
          ...state.recentProducts,
          [product.id]: product
        }
      })),
      
      addScanToHistory: (scan) => set((state) => ({
        // Keep last 50 scans
        scanHistory: [scan, ...state.scanHistory].slice(0, 50)
      })),
      
      queueScan: (scan) => set((state) => ({
        scanQueue: [...state.scanQueue, scan]
      })),
      
      removeQueuedScan: (id) => set((state) => ({
        scanQueue: state.scanQueue.filter(scan => scan.id !== id)
      })),
      
      setCategories: (categories) => set({ categories }),
      
      setManufacturers: (manufacturers) => set({ manufacturers }),
      
      clearQueue: () => set({ scanQueue: [] })
    }),
    {
      name: 'aquaprint-offline-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ 
        recentProducts: state.recentProducts,
        scanHistory: state.scanHistory,
        scanQueue: state.scanQueue,
        categories: state.categories,
        manufacturers: state.manufacturers,
      }),
    }
  )
);
