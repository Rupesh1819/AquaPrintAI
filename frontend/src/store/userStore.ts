import { create } from 'zustand'

export interface UserProfileData {
  id: string;
  full_name?: string;
  avatar_url?: string;
  region_code?: string;
  country?: string;
  language: string;
  level: number;
  total_points: number;
  water_saving_goal: number;
  role: string;
  account_status: string;
  notification_preferences: any;
  joined_date: string;
  last_login?: string;
  settings?: UserSettingsData;
}

export interface UserSettingsData {
  theme: string;
  preferred_language: string;
  daily_hydration_goal_ml: number;
  dietary_preference?: string;
}

interface UserState {
  profile: UserProfileData | null;
  setProfile: (profile: UserProfileData | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearUser: () => set({ profile: null }),
}))
