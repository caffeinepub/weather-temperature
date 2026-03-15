import {
  ArrowDown,
  ArrowUp,
  Droplets,
  MapPin,
  Navigation,
  Search,
  Wind,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AdBanner } from "../components/AdBanner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import type { UserProfile } from "../hooks/useUserProfile";
import type { WeatherData } from "../hooks/useWeather";
import {
  getMoonPhase,
  getWeatherCondition,
  parseRainPredictor,
} from "../hooks/useWeather";
import { t } from "../i18n";
import type { Language } from "../i18n";

interface DashboardPageProps {
  weatherData: WeatherData | null;
  isLoading: boolean;
  isOffline: boolean;
  error: string | null;
  onSearch: (city: string) => void;
  onUseLocation: () => void;
  profile: UserProfile;
  convertTemp: (c: number) => number;
  convertWind: (kmh: number) => number;
  tempUnit: string;
  windUnit: string;
  lang: Language;
  onUnlockEasterEgg: (egg: "snowman" | "sun") => void;
  isAlertState: boolean;
  onAlertStateChange: (v: boolean) => void;
}

function haptic(pattern: number | number[]) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function formatTime(isoOrTime: string): string {
  try {
    const d = new Date(isoOrTime);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  } catch {
    // ignore
  }
  return isoOrTime;
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { weekday: "short" });
}

function getUVColor(uv: number): string {
  if (uv <= 2) return "oklch(0.6 0.17 145)";
  if (uv <= 4) return "oklch(0.72 0.18 85)";
  if (uv <= 6) return "oklch(0.72 0.2 60)";
  if (uv <= 8) return "oklch(0.68 0.22 40)";
  return "oklch(0.6 0.26 25)";
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "oklch(0.6 0.17 145)";
  if (aqi <= 100) return "oklch(0.72 0.18 85)";
  if (aqi <= 150) return "oklch(0.72 0.2 60)";
  if (aqi <= 200) return "oklch(0.68 0.22 40)";
  return "oklch(0.6 0.26 25)";
}

function getAQILabel(aqi: number, lang: Language): string {
  if (aqi <= 50) return t(lang, "good");
  if (aqi <= 100) return t(lang, "moderate");
  if (aqi <= 150) return t(lang, "unhealthy");
  if (aqi <= 200) return t(lang, "veryUnhealthy");
  return t(lang, "hazardous");
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};
export function DashboardPage({
  weatherData,
  isLoading,
  isOffline,
  error,
  onSearch,
  onUseLocation,
  profile,
  convertTemp,
  convertWind,
  tempUnit,
  windUnit,
  lang,
  onUnlockEasterEgg,
  isAlertState,
  onAlertStateChange,
}: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [aqiExpanded, setAqiExpanded] = useState(false);
  const hourlyScrollRef = useRef<HTMLDivElement>(null);

  const current = weatherData?.current;
  const hourly = weatherData?.hourly;
  const daily = weatherData?.daily;
  const aqi = weatherData?.aqi;
  const loc = weatherData?.location;
  const minutely = weatherData?.minutely ?? null;
  const historical = weatherData?.historical;

  const condition = current ? getWeatherCondition(current.weatherCode) : null;
  const moonPhase = getMoonPhase(new Date());

  useEffect(() => {
    if (!current) return;
    const isExtreme = current.temperature > 42 || current.weatherCode >= 95;
    onAlertStateChange(isExtreme);
    if (current.temperature <= 0) onUnlockEasterEgg("snowman");
    if (current.temperature >= 40) onUnlockEasterEgg("sun");
  }, [current, onAlertStateChange, onUnlockEasterEgg]);

  useEffect(() => {
    if (!isAlertState || !profile.notifications.severe) return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted" && current) {
          new Notification("TRUE TEMP Alert", {
            body:
              current.temperature > 42
                ? "Extreme heat detected! Stay safe."
                : "Severe weather alert for your area.",
            icon: "/favicon.ico",
          });
        }
      });
    }
    haptic([200, 100, 200]);
  }, [isAlertState, profile.notifications.severe, current]);

  const rainText = (() => {
    const result = parseRainPredictor(minutely);
    if (result === "noRain") return t(lang, "noRain");
    if (result.startsWith("rainNow:")) {
      const dur = result.split(":")[1];
      return `Rain now, ${t(lang, "lasting")} ${dur} ${t(lang, "minutes")}`;
    }
    if (result.startsWith("rainIn:")) {
      const [, start, dur] = result.split(":");
      return `${t(lang, "rainIn")} ${start} ${t(lang, "minutes")}, ${t(lang, "lasting")} ${dur} min`;
    }
    return t(lang, "noRain");
  })();

  const isRaining =
    minutely && !parseRainPredictor(minutely).startsWith("noRain");
  const rainIcon = isRaining ? "🌧️" : "☀️";

  const clothingSuggestion = (() => {
    if (!current) return null;
    const temp = current.temperature;
    const isRainy = current.weatherCode >= 51 && current.weatherCode <= 82;
    const isSunny = current.weatherCode === 0 && current.uvIndex > 5;
    if (temp < 10) return { icon: "🧥", text: t(lang, "heavyCoat") };
    if (temp < 18) return { icon: "🧥", text: t(lang, "lightJacket") };
    if (isRainy) return { icon: "☂️", text: t(lang, "umbrella") };
    if (isSunny) return { icon: "🕶️", text: t(lang, "sunglasses") };
    return { icon: "👕", text: t(lang, "lightClothing") };
  })();

  const commuteWarnings = (() => {
    if (!current) return [];
    const warnings: string[] = [];
    if (current.weatherCode >= 45 && current.weatherCode <= 48)
      warnings.push(t(lang, "fogWarning"));
    if (current.weatherCode >= 65 && current.weatherCode <= 82)
      warnings.push(t(lang, "heavyRainWarning"));
    if (current.windSpeed > 50) warnings.push(t(lang, "windWarning"));
    const pressure = current.pressure;
    if (weatherData?.daily?.time?.length && pressure < 1000)
      warnings.push(t(lang, "stormWarning"));
    return warnings;
  })();

  const currentHourIndex = (() => {
    if (!hourly?.time) return 0;
    const now = new Date();
    return hourly.time.findIndex((t) => new Date(t) >= now) || 0;
  })();

  const hourlySlice = {
    time: hourly?.time?.slice(currentHourIndex, currentHourIndex + 24) ?? [],
    temperature:
      hourly?.temperature?.slice(currentHourIndex, currentHourIndex + 24) ?? [],
    precipitationProbability:
      hourly?.precipitationProbability?.slice(
        currentHourIndex,
        currentHourIndex + 24,
      ) ?? [],
    weatherCode:
      hourly?.weatherCode?.slice(currentHourIndex, currentHourIndex + 24) ?? [],
  };

  const todayTempMax = daily?.tempMax?.[0] ?? current?.temperature ?? 0;
  const todayTempMin = daily?.tempMin?.[0] ?? current?.temperature ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) onSearch(searchQuery.trim());
  };

  const agr = weatherData?.agriculture;
  const currentHour = new Date().getHours();

  return (
    <div className="pb-24">
      {/* Top Ad */}
      <AdBanner />

      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-warning/20 border-b border-warning/30 px-4 py-2 text-center"
          >
            <span
              className="text-xs font-body"
              style={{ color: "oklch(var(--warning-foreground))" }}
            >
              {t(lang, "offline")}{" "}
              {weatherData?.fetchedAt ? formatTime(weatherData.fetchedAt) : ""}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Banner */}
      <AnimatePresence>
        {isAlertState && !alertDismissed && current && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="animate-pulse-alert px-4 py-3 flex items-start gap-3 border-b"
            style={{
              background: "oklch(0.22 0.08 25 / 0.9)",
              borderColor: "oklch(0.62 0.26 25 / 0.4)",
            }}
          >
            <div className="flex-1">
              <p
                className="text-sm font-display font-bold"
                style={{ color: "oklch(0.9 0.1 30)" }}
              >
                {current.temperature > 42
                  ? t(lang, "heatAlert")
                  : t(lang, "thunderAlert")}
              </p>
              <p
                className="text-xs mt-0.5 opacity-90"
                style={{ color: "oklch(0.85 0.06 30)" }}
              >
                {current.temperature > 42
                  ? t(lang, "heatWarning")
                  : t(lang, "thunderWarning")}
              </p>
            </div>
            <button
              type="button"
              className="text-xs opacity-70 hover:opacity-100 shrink-0"
              style={{ color: "oklch(0.9 0.1 30)" }}
              onClick={() => setAlertDismissed(true)}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="px-4 pt-2 pb-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              data-ocid="dashboard.search_input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(lang, "searchCity")}
              className="font-body text-sm pr-3 rounded-xl border-border/60"
              style={{ background: "oklch(var(--card))" }}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="shrink-0 gap-1.5 rounded-xl font-body font-semibold px-4"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </Button>
          <Button
            type="button"
            data-ocid="dashboard.location_button"
            size="sm"
            variant="outline"
            className="shrink-0 w-9 rounded-xl border-border/60"
            style={{ background: "oklch(var(--card))" }}
            onClick={() => {
              haptic(10);
              onUseLocation();
            }}
            aria-label="Use my location"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Content */}
      {isLoading ? (
        <div
          data-ocid="dashboard.loading_state"
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground font-body text-sm">
            {t(lang, "loading")}
          </p>
        </div>
      ) : error ? (
        <div
          data-ocid="dashboard.error_state"
          className="flex flex-col items-center justify-center py-20 gap-4 px-6"
        >
          <p className="text-4xl">⚠️</p>
          <p className="text-foreground font-body text-center">{error}</p>
          <Button
            variant="default"
            size="sm"
            onClick={() => onSearch("Mumbai")}
          >
            Try Mumbai
          </Button>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="px-4 pb-4 flex flex-col gap-3"
        >
          {/* Rain Predictor */}
          <motion.div
            variants={cardVariants}
            className="glass-card px-4 py-3 flex items-center gap-3"
          >
            <span className="text-2xl">{rainIcon}</span>
            <div>
              <p className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                Rain Predictor
              </p>
              <p className="text-sm font-body font-medium">{rainText}</p>
            </div>
          </motion.div>

          {/* Main Weather Card */}
          <motion.div
            variants={cardVariants}
            className="glass-card p-5 relative overflow-hidden"
          >
            {/* Easter Egg: Pixel Snowman */}
            {current && current.temperature <= 0 && (
              <div
                className="absolute bottom-3 right-3 text-3xl animate-float"
                title="Easter Egg unlocked!"
              >
                ⛄
              </div>
            )}
            {/* Easter Egg: Melting Sun */}
            {current && current.temperature >= 40 && (
              <div
                className="absolute bottom-3 right-3 text-3xl animate-spin-slow"
                title="Easter Egg unlocked!"
              >
                🌞
              </div>
            )}

            {/* City + Condition row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "oklch(var(--primary))" }}
                />
                <span className="text-sm font-display font-bold text-foreground">
                  {loc?.name ?? "--"}
                  {loc?.admin1 ? `, ${loc.admin1}` : ""}
                </span>
              </div>
              {condition && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-body font-semibold"
                  style={{
                    borderColor: "oklch(var(--primary) / 0.3)",
                    color: "oklch(var(--primary))",
                    background: "oklch(var(--primary) / 0.08)",
                  }}
                >
                  <span>{condition.emoji}</span>
                  <span>{t(lang, condition.label)}</span>
                </div>
              )}
            </div>

            {/* Temperature row */}
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-end gap-1">
                  <span
                    className="text-7xl font-display font-extrabold leading-none"
                    style={{
                      color: isAlertState
                        ? "oklch(0.9 0.1 30)"
                        : "oklch(var(--foreground))",
                    }}
                  >
                    {current ? convertTemp(current.temperature) : "--"}
                  </span>
                  <span
                    className="text-3xl font-display font-light mb-1"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    {tempUnit}
                  </span>
                </div>
                <p
                  className="text-sm font-body mt-1"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  {t(lang, "feelsLike")}{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "oklch(var(--primary))" }}
                  >
                    {current ? convertTemp(current.feelsLike) : "--"}
                    {tempUnit}
                  </span>
                </p>
              </div>
              {/* ↑↓ min/max */}
              <div className="text-right flex flex-col gap-1 mb-1">
                <div className="flex items-center gap-1 justify-end">
                  <ArrowUp
                    className="w-3 h-3"
                    style={{ color: "oklch(0.6 0.2 40)" }}
                  />
                  <span
                    className="text-sm font-body font-semibold"
                    style={{ color: "oklch(0.6 0.2 40)" }}
                  >
                    {current ? convertTemp(todayTempMax) : "--"}
                    {tempUnit}
                  </span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <ArrowDown
                    className="w-3 h-3"
                    style={{ color: "oklch(0.55 0.14 252)" }}
                  />
                  <span
                    className="text-sm font-body font-semibold"
                    style={{ color: "oklch(0.55 0.14 252)" }}
                  >
                    {current ? convertTemp(todayTempMin) : "--"}
                    {tempUnit}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Grid: 2x2 */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="metric-tile">
                <div className="flex items-center gap-1">
                  <Droplets
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(var(--primary))" }}
                  />
                  <span className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                    {t(lang, "humidity")}
                  </span>
                </div>
                <span className="text-lg font-display font-bold">
                  {current?.humidity ?? "--"}%
                </span>
              </div>
              <div className="metric-tile">
                <div className="flex items-center gap-1">
                  <Wind
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(var(--primary))" }}
                  />
                  <span className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                    {t(lang, "wind")}
                  </span>
                </div>
                <span className="text-lg font-display font-bold">
                  {current ? convertWind(current.windSpeed) : "--"}
                  <span className="text-xs font-normal ml-0.5">{windUnit}</span>
                </span>
              </div>
              <div className="metric-tile">
                <div className="flex items-center gap-1">
                  <ArrowUp
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.6 0.2 40)" }}
                  />
                  <span className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                    Max
                  </span>
                </div>
                <span className="text-lg font-display font-bold">
                  {current ? convertTemp(todayTempMax) : "--"}
                  {tempUnit}
                </span>
              </div>
              <div className="metric-tile">
                <div className="flex items-center gap-1">
                  <ArrowDown
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.55 0.14 252)" }}
                  />
                  <span className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                    Min
                  </span>
                </div>
                <span className="text-lg font-display font-bold">
                  {current ? convertTemp(todayTempMin) : "--"}
                  {tempUnit}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Clothing & Commute */}
          {(clothingSuggestion || commuteWarnings.length > 0) && (
            <motion.div
              variants={cardVariants}
              className="glass-card px-4 py-3 flex flex-col gap-2"
            >
              {clothingSuggestion && (
                <div className="flex items-center gap-2">
                  <span className="text-xl">{clothingSuggestion.icon}</span>
                  <div>
                    <p className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                      {t(lang, "clothingSuggestion")}
                    </p>
                    <p className="text-sm font-body">
                      {clothingSuggestion.text}
                    </p>
                  </div>
                </div>
              )}
              {commuteWarnings.map((w) => (
                <div key={w} className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <p
                    className="text-xs font-body"
                    style={{ color: "oklch(var(--warning-foreground))" }}
                  >
                    {w}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Hourly Forecast */}
          <motion.div variants={cardVariants} className="glass-card p-4">
            <h3 className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {t(lang, "hourlyForecast")}
            </h3>
            <div
              ref={hourlyScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-thin pb-1"
              onScroll={() => haptic(10)}
            >
              {hourlySlice.time.map((time, i) => {
                const cond = getWeatherCondition(
                  hourlySlice.weatherCode[i] ?? 0,
                );
                return (
                  <div
                    key={time}
                    className="flex flex-col items-center gap-1 shrink-0"
                  >
                    <p className="text-[10px] font-body text-muted-foreground">
                      {i === 0
                        ? "Now"
                        : formatTime(time)
                            .replace(" AM", "a")
                            .replace(" PM", "p")}
                    </p>
                    <span className="text-lg">{cond.emoji}</span>
                    <p className="text-sm font-display font-semibold">
                      {convertTemp(hourlySlice.temperature[i] ?? 0)}
                      {tempUnit}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {hourlySlice.precipitationProbability[i] ?? 0}%
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* 7-Day Forecast */}
          <motion.div variants={cardVariants} className="glass-card p-4">
            <h3 className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {t(lang, "weeklyForecast")}
            </h3>
            <div className="flex flex-col gap-2">
              {daily?.time?.map((date, i) => {
                const cond = getWeatherCondition(daily.weatherCode[i] ?? 0);
                const max = convertTemp(daily.tempMax[i] ?? 0);
                const min = convertTemp(daily.tempMin[i] ?? 0);
                const range = max - min;
                const totalRange =
                  convertTemp(todayTempMax) - convertTemp(todayTempMin);
                const pct =
                  totalRange > 0
                    ? Math.max(20, (range / totalRange) * 100)
                    : 60;
                return (
                  <div key={date} className="flex items-center gap-2">
                    <span className="w-10 text-xs font-body text-muted-foreground shrink-0">
                      {i === 0 ? "Today" : formatDay(date)}
                    </span>
                    <span className="text-base shrink-0">{cond.emoji}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-body w-10 text-right text-muted-foreground">
                        {min}°
                      </span>
                      <div
                        className="flex-1 h-2 rounded-full overflow-hidden"
                        style={{ background: "oklch(var(--muted))" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background:
                              "linear-gradient(to right, oklch(0.65 0.12 252), oklch(0.68 0.18 40))",
                          }}
                        />
                      </div>
                      <span className="text-xs font-body w-10 font-semibold">
                        {max}°
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8 text-right shrink-0">
                      {daily.precipitationSum[i]?.toFixed(1) ?? 0}mm
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* UV Index Card */}
          <motion.div variants={cardVariants} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                {t(lang, "uvIndex")}
              </h3>
              <span
                className="text-lg font-display font-bold"
                style={{ color: getUVColor(current?.uvIndex ?? 0) }}
              >
                {current?.uvIndex?.toFixed(1) ?? "--"} / 11+
              </span>
            </div>
            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((seg) => (
                <div
                  key={seg}
                  className="h-2.5 flex-1 rounded-sm transition-all"
                  style={{
                    background:
                      seg <= (current?.uvIndex ?? 0)
                        ? getUVColor(seg)
                        : "oklch(var(--muted))",
                    opacity: seg <= (current?.uvIndex ?? 0) ? 1 : 0.35,
                  }}
                />
              ))}
            </div>
            <p className="text-xs font-body text-muted-foreground">
              {(current?.uvIndex ?? 0) <= 2
                ? t(lang, "safeToGoOut")
                : (current?.uvIndex ?? 0) <= 5
                  ? t(lang, "wearSunscreen")
                  : (current?.uvIndex ?? 0) <= 7
                    ? t(lang, "avoidDirectSun")
                    : t(lang, "extremeUV")}
            </p>
          </motion.div>

          {/* AQI Card */}
          {aqi && (
            <motion.div variants={cardVariants} className="glass-card p-4">
              <button
                type="button"
                className="flex items-center justify-between cursor-pointer w-full"
                onClick={() => setAqiExpanded(!aqiExpanded)}
              >
                <div>
                  <h3 className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                    {t(lang, "airQuality")}
                  </h3>
                  <p
                    className="text-3xl font-display font-bold mt-0.5"
                    style={{ color: getAQIColor(aqi.aqi) }}
                  >
                    {aqi.aqi}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    style={{ background: getAQIColor(aqi.aqi), color: "white" }}
                  >
                    {getAQILabel(aqi.aqi, lang)}
                  </Badge>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {aqiExpanded ? "▲" : "▼"} Details
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {aqiExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">PM2.5</p>
                        <p className="text-sm font-display font-bold">
                          {aqi.pm25.toFixed(1)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          μg/m³
                        </p>
                      </div>
                      <div className="text-center border-x border-border/30">
                        <p className="text-xs text-muted-foreground">PM10</p>
                        <p className="text-sm font-display font-bold">
                          {aqi.pm10.toFixed(1)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          μg/m³
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Ozone</p>
                        <p className="text-sm font-display font-bold">
                          {aqi.ozone.toFixed(1)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          μg/m³
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/30">
                      <p className="text-xs font-body">
                        {aqi.pm25 > 35
                          ? "⚠️ PM2.5 is high: Wear an N95 mask if commuting"
                          : aqi.pm10 > 50
                            ? "⚠️ PM10 elevated: Limit outdoor activity"
                            : aqi.ozone > 100
                              ? "⚠️ Ozone levels elevated: Avoid strenuous outdoor exercise"
                              : "✅ Air is safe. OK to open windows for ventilation."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Dew Point + Pressure */}
          <motion.div
            variants={cardVariants}
            className="grid grid-cols-2 gap-3"
          >
            <div className="glass-card p-4">
              <p className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                {t(lang, "dewPoint")}
              </p>
              <p className="text-2xl font-display font-bold mt-2">
                {current ? convertTemp(current.dewPoint) : "--"}
                {tempUnit}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {current && current.dewPoint > 20
                  ? "💦 Muggy"
                  : current && current.dewPoint < 10
                    ? "🏜️ Dry"
                    : "😊 Comfortable"}
              </p>
            </div>
            <div className="glass-card p-4">
              <p className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                {t(lang, "pressure")}
              </p>
              <p className="text-2xl font-display font-bold mt-2">
                {current?.pressure?.toFixed(0) ?? "--"}
                <span className="text-xs font-normal ml-1">hPa</span>
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                {current && current.pressure < 1005
                  ? "↓ Storm possible"
                  : current && current.pressure > 1020
                    ? "↑ Stable"
                    : "→ Normal"}
              </p>
            </div>
          </motion.div>

          {/* Sun & Moon Card */}
          {daily && daily.sunrise?.length > 0 && (
            <motion.div variants={cardVariants} className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(lang, "sunrise")} / {t(lang, "sunset")}
                </h3>
                <span className="text-lg">{moonPhase.emoji}</span>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <p className="text-xl">🌅</p>
                  <p className="text-sm font-display font-semibold">
                    {formatTime(daily.sunrise[0])}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t(lang, "sunrise")}
                  </p>
                </div>
                <div className="flex-1 relative h-8">
                  <svg
                    viewBox="0 0 100 50"
                    className="w-full h-full"
                    role="img"
                    aria-label="Sun arc"
                  >
                    <title>Sun position arc</title>
                    <path
                      d="M 5 45 Q 50 5 95 45"
                      fill="none"
                      stroke="oklch(0.8 0.18 85 / 0.5)"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                    {(() => {
                      const now = new Date();
                      const rise = new Date(daily.sunrise[0]);
                      const set = new Date(daily.sunset[0]);
                      const total = set.getTime() - rise.getTime();
                      const elapsed = Math.max(
                        0,
                        Math.min(1, (now.getTime() - rise.getTime()) / total),
                      );
                      const x = 5 + elapsed * 90;
                      const arcY = 45 - 40 * Math.sin(elapsed * Math.PI);
                      return (
                        <circle
                          cx={x}
                          cy={arcY}
                          r="4"
                          fill="oklch(0.85 0.2 85)"
                        />
                      );
                    })()}
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xl">🌇</p>
                  <p className="text-sm font-display font-semibold">
                    {formatTime(daily.sunset[0])}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t(lang, "sunset")}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  {t(lang, "moonPhase")}
                </p>
                <p className="text-sm font-body">
                  {moonPhase.emoji} {moonPhase.phase} ({moonPhase.illumination}
                  %)
                </p>
              </div>
            </motion.div>
          )}

          {/* Historical Trivia */}
          {historical?.tempSameDay !== null &&
            historical?.tempSameDay !== undefined &&
            current && (
              <motion.div
                variants={cardVariants}
                className="glass-card px-4 py-3 flex items-center gap-3"
              >
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground">
                    {t(lang, "lastYear")}
                  </p>
                  <p className="text-sm font-body">
                    {Math.abs(
                      Math.round(current.temperature - historical.tempSameDay),
                    )}
                    °C{" "}
                    {current.temperature > historical.tempSameDay
                      ? t(lang, "warmer")
                      : t(lang, "cooler")}{" "}
                    than same day last year (
                    {convertTemp(historical.tempSameDay)}
                    {tempUnit} avg)
                  </p>
                </div>
              </motion.div>
            )}

          {/* Location Map */}
          {loc && (
            <motion.div
              variants={cardVariants}
              className="glass-card overflow-hidden"
            >
              <div className="p-3 border-b border-border/30">
                <p className="text-xs font-body font-medium">
                  📍 {loc.name}
                  {loc.admin1 ? `, ${loc.admin1}` : ""}
                  {loc.country ? `, ${loc.country}` : ""}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}
                </p>
              </div>
              <iframe
                title="Location Map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${loc.lon - 0.1},${loc.lat - 0.1},${loc.lon + 0.1},${loc.lat + 0.1}&layer=mapnik&marker=${loc.lat},${loc.lon}`}
                className="w-full h-44 border-0"
                loading="lazy"
              />
            </motion.div>
          )}

          {/* Agriculture Metrics */}
          {profile.agrMetrics && agr && (
            <motion.div variants={cardVariants} className="glass-card p-4">
              <h3 className="text-[10px] font-body font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {t(lang, "agriculture")} 🌾
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xl">💧</p>
                  <p className="text-xs text-muted-foreground">
                    {t(lang, "soilMoisture")}
                  </p>
                  <p className="text-sm font-display font-semibold">
                    {((agr.soilMoisture[currentHour] ?? 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl">🌿</p>
                  <p className="text-xs text-muted-foreground">
                    {t(lang, "evapotranspiration")}
                  </p>
                  <p className="text-sm font-display font-semibold">
                    {(agr.et0[currentHour] ?? 0).toFixed(2)} mm
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl">☀️</p>
                  <p className="text-xs text-muted-foreground">
                    {t(lang, "solarRadiation")}
                  </p>
                  <p className="text-sm font-display font-semibold">
                    {(agr.solarRadiation[currentHour] ?? 0).toFixed(0)} W/m²
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bottom Ad */}
          <motion.div variants={cardVariants}>
            <AdBanner />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
