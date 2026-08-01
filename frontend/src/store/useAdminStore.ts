import { create } from 'zustand';

export interface AdminState {
  dashboardStats: any | null;
  users: any[];
  usersTotal: number;
  products: any[];
  productsTotal: number;
  
  setDashboardStats: (stats: any) => void;
  setUsers: (users: any[], total: number) => void;
  setProducts: (products: any[], total: number) => void;
  updateUserStatus: (userId: string, status: string) => void;
  removeProduct: (productId: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  dashboardStats: null,
  users: [],
  usersTotal: 0,
  products: [],
  productsTotal: 0,
  
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  
  setUsers: (users, total) => set({ users, usersTotal: total }),
  
  setProducts: (products, total) => set({ products, productsTotal: total }),
  
  updateUserStatus: (id, status) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, status } : u)
  })),
  
  removeProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id),
    productsTotal: state.productsTotal - 1
  }))
}));
