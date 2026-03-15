import { useCallback, useEffect, useState } from "react";
import type { Language } from "../i18n";

export interface UserProfile {
  nickname: string;
  avatar: string;
  units: { temp: "C" | "F"; wind: "kmh" | "mph" };
  theme: "light" | "dark" | "system";
  notifications: { morning: boolean; afternoon: boolean; severe: boolean };
  language: Language;
  savedCities: { name: string; lat: number; lon: number }[];
  streak: {
    current: number;
    longest: number;
    totalDays: number;
    lastVisit: string;
  };
  easterEggs: { snowman: boolean; sun: boolean };
  agrMetrics: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  nickname: "",
  avatar: "snowman",
  units: { temp: "C", wind: "kmh" },
  theme: "system",
  notifications: { morning: true, afternoon: true, severe: true },
  language: "en",
  savedCities: [],
  streak: { current: 0, longest: 0, totalDays: 0, lastVisit: "" },
  easterEggs: { snowman: false, sun: false },
  agrMetrics: false,
};

const STORAGE_KEY = "truetemp_user_profile";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PROFILE, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  // Update streak on mount
  useEffect(() => {
    const today = new Date().toDateString();
    setProfile((prev) => {
      const streak = { ...prev.streak };
      if (streak.lastVisit === today) return prev;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = streak.lastVisit === yesterday.toDateString();

      streak.current = wasYesterday ? streak.current + 1 : 1;
      streak.longest = Math.max(streak.longest, streak.current);
      streak.totalDays = streak.totalDays + 1;
      streak.lastVisit = today;

      return { ...prev, streak };
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore quota errors
    }
  }, [profile]);

  const unlockEasterEgg = useCallback((egg: "snowman" | "sun") => {
    setProfile((prev) => {
      if (prev.easterEggs[egg]) return prev;
      return { ...prev, easterEggs: { ...prev.easterEggs, [egg]: true } };
    });
  }, []);

  const convertTemp = useCallback(
    (celsius: number): number => {
      if (profile.units.temp === "F") return Math.round((celsius * 9) / 5 + 32);
      return Math.round(celsius);
    },
    [profile.units.temp],
  );

  const convertWind = useCallback(
    (kmh: number): number => {
      if (profile.units.wind === "mph") return Math.round(kmh * 0.621371);
      return Math.round(kmh);
    },
    [profile.units.wind],
  );

  const tempUnit = profile.units.temp === "C" ? "°C" : "°F";
  const windUnit = profile.units.wind === "kmh" ? "km/h" : "mph";

  return {
    profile,
    updateProfile,
    unlockEasterEgg,
    convertTemp,
    convertWind,
    tempUnit,
    windUnit,
  };
}
