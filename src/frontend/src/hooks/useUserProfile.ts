import { useCallback, useEffect, useState } from "react";

export type AvatarId = "snowman" | "sun" | "fire" | "diamond" | "crown";
export type TempUnit = "C" | "F";
export type WindUnit = "kmh" | "mph";
export type ThemePref = "light" | "dark" | "system";
export type Lang = "en" | "hi" | "mr" | "ta";

export interface SavedCity {
  name: string;
  lat: number;
  lon: number;
}

export interface UserProfile {
  nickname: string;
  avatarId: AvatarId;
  unitPreferences: { temp: TempUnit; wind: WindUnit };
  themePreference: ThemePref;
  notifications: { morning: boolean; afternoon: boolean; severe: boolean };
  savedCities: SavedCity[];
  longestStreak: number;
  totalDaysActive: number;
  discoveredEasterEggs: string[];
  language: Lang;
  showAgricultureData: boolean;
}

const PROFILE_KEY = "truetemp_user_profile";

const DEFAULT_PROFILE: UserProfile = {
  nickname: "",
  avatarId: "snowman",
  unitPreferences: { temp: "C", wind: "kmh" },
  themePreference: "dark",
  notifications: { morning: false, afternoon: false, severe: true },
  savedCities: [],
  longestStreak: 0,
  totalDaysActive: 0,
  discoveredEasterEggs: [],
  language: "en",
  showAgricultureData: false,
};

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserProfile>;
      return { ...DEFAULT_PROFILE, ...parsed };
    }
    // Migrate from old keys
    const theme = localStorage.getItem("truetemp-theme") as ThemePref | null;
    const streakCount = Number.parseInt(
      localStorage.getItem("truetemp_streak_count") || "0",
      10,
    );
    const migrated: UserProfile = {
      ...DEFAULT_PROFILE,
      themePreference: theme === "light" ? "light" : "dark",
      longestStreak: streakCount,
      totalDaysActive: streakCount,
    };
    return migrated;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveProfile(profile: UserProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // quota exceeded — ignore
  }
}

export function useUserProfile() {
  const [profile, setProfileState] = useState<UserProfile>(loadProfile);

  // Sync streak stats from old keys into profile
  useEffect(() => {
    try {
      const streakCount = Number.parseInt(
        localStorage.getItem("truetemp_streak_count") || "0",
        10,
      );
      if (streakCount > 0) {
        setProfileState((prev) => {
          const updated = {
            ...prev,
            longestStreak: Math.max(prev.longestStreak, streakCount),
            totalDaysActive: Math.max(prev.totalDaysActive, streakCount),
          };
          saveProfile(updated);
          return updated;
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const updated = { ...prev, ...updates };
      saveProfile(updated);
      return updated;
    });
  }, []);

  const addSavedCity = useCallback((city: SavedCity) => {
    setProfileState((prev) => {
      if (prev.savedCities.some((c) => c.name === city.name)) return prev;
      const updated = {
        ...prev,
        savedCities: [...prev.savedCities, city],
      };
      saveProfile(updated);
      return updated;
    });
  }, []);

  const removeSavedCity = useCallback((name: string) => {
    setProfileState((prev) => {
      const updated = {
        ...prev,
        savedCities: prev.savedCities.filter((c) => c.name !== name),
      };
      saveProfile(updated);
      return updated;
    });
  }, []);

  const discoverEasterEgg = useCallback((eggId: string) => {
    setProfileState((prev) => {
      if (prev.discoveredEasterEggs.includes(eggId)) return prev;
      const updated = {
        ...prev,
        discoveredEasterEggs: [...prev.discoveredEasterEggs, eggId],
      };
      saveProfile(updated);
      return updated;
    });
  }, []);

  return {
    profile,
    updateProfile,
    addSavedCity,
    removeSavedCity,
    discoverEasterEgg,
  };
}
