import { Bell, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
import type { Page } from "./components/BottomNav";
import { WeatherBackground } from "./components/WeatherBackground";
import { Toaster } from "./components/ui/sonner";
import { useUserProfile } from "./hooks/useUserProfile";
import { getWeatherCondition, useWeather } from "./hooks/useWeather";
import type { Location } from "./hooks/useWeather";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StudioPage } from "./pages/StudioPage";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [isAlertState, setIsAlertState] = useState(false);

  const {
    profile,
    updateProfile,
    unlockEasterEgg,
    convertTemp,
    convertWind,
    tempUnit,
    windUnit,
  } = useUserProfile();

  const {
    weatherData,
    isLoading,
    isOffline,
    error,
    searchCity,
    useMyLocation,
    switchToCity,
  } = useWeather();

  const lang = profile.language;

  const getEffectiveTheme = (): "dark" | "light" => {
    if (profile.theme === "dark") return "dark";
    if (profile.theme === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const isDark = getEffectiveTheme() === "dark";
  const themeClass = isDark ? "dark" : "";
  const alertClass = isAlertState ? "alert-state" : "";

  const currentWeatherCode = weatherData?.current?.weatherCode ?? 0;
  const weatherType = getWeatherCondition(currentWeatherCode).type;

  const handleSwitchCity = (city: {
    name: string;
    lat: number;
    lon: number;
  }) => {
    const loc: Location = { ...city };
    switchToCity(loc);
    setPage("dashboard");
  };

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    updateProfile({ theme: next });
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  return (
    <div className={`${themeClass} ${alertClass} min-h-screen`}>
      <WeatherBackground
        weatherType={weatherType}
        isAlertState={isAlertState}
        isDark={isDark}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* App Header */}
        <header className="relative flex items-center justify-center px-4 pt-5 pb-3 shrink-0">
          {/* Centered branding */}
          <div className="text-center">
            <h1
              className="text-2xl font-display font-extrabold tracking-tight leading-none"
              style={{ color: "oklch(var(--foreground))" }}
            >
              TRUE TEMP
            </h1>
            <p
              className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase mt-0.5"
              style={{ color: "oklch(var(--primary))" }}
            >
              Real Weather, Right Now
            </p>
          </div>

          {/* Icon buttons — top right */}
          <div className="absolute right-4 top-5 flex items-center gap-2">
            <button
              type="button"
              data-ocid="app.notification_button"
              aria-label="Notifications"
              className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center transition-all hover:bg-primary/10 active:scale-95"
              style={{ background: "oklch(var(--card))" }}
              onClick={requestNotificationPermission}
            >
              <Bell
                className="w-4 h-4"
                style={{ color: "oklch(var(--foreground))" }}
              />
            </button>
            <button
              type="button"
              data-ocid="app.theme_toggle"
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center transition-all hover:bg-primary/10 active:scale-95"
              style={{ background: "oklch(var(--card))" }}
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun
                  className="w-4 h-4"
                  style={{ color: "oklch(var(--foreground))" }}
                />
              ) : (
                <Moon
                  className="w-4 h-4"
                  style={{ color: "oklch(var(--foreground))" }}
                />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {page === "dashboard" && (
            <DashboardPage
              weatherData={weatherData}
              isLoading={isLoading}
              isOffline={isOffline}
              error={error}
              onSearch={searchCity}
              onUseLocation={useMyLocation}
              profile={profile}
              convertTemp={convertTemp}
              convertWind={convertWind}
              tempUnit={tempUnit}
              windUnit={windUnit}
              lang={lang}
              onUnlockEasterEgg={unlockEasterEgg}
              isAlertState={isAlertState}
              onAlertStateChange={setIsAlertState}
            />
          )}

          {page === "studio" && (
            <StudioPage
              profile={profile}
              weatherData={weatherData}
              convertTemp={convertTemp}
              tempUnit={tempUnit}
              lang={lang}
            />
          )}

          {page === "profile" && (
            <ProfilePage
              profile={profile}
              onUpdate={updateProfile}
              lang={lang}
              onSwitchCity={handleSwitchCity}
            />
          )}
        </main>
      </div>

      <BottomNav page={page} onNavigate={setPage} lang={lang} />
      <Toaster />
    </div>
  );
}
