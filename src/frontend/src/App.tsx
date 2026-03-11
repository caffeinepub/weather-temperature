import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Droplets,
  Eye,
  MapPin,
  Search,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Weather } from "./backend";
import { useGetWeather } from "./hooks/useQueries";

const queryClient = new QueryClient();

function getWeatherCondition(code: bigint): string {
  const c = Number(code);
  if (c === 0) return "Clear Sky";
  if (c >= 1 && c <= 3) return "Partly Cloudy";
  if (c === 45 || c === 48) return "Foggy";
  if (c >= 51 && c <= 55) return "Drizzle";
  if (c >= 61 && c <= 65) return "Rainy";
  if (c >= 71 && c <= 75) return "Snowy";
  if (c >= 80 && c <= 82) return "Rain Showers";
  if (c === 95) return "Thunderstorm";
  return "Cloudy";
}

function WeatherIcon({ code, size = 48 }: { code: bigint; size?: number }) {
  const c = Number(code);
  const cls = `w-[${size}px] h-[${size}px]`;
  if (c === 0)
    return <Sun className={cls} style={{ width: size, height: size }} />;
  if (c >= 1 && c <= 3)
    return <Cloud className={cls} style={{ width: size, height: size }} />;
  if (c === 45 || c === 48)
    return <CloudFog className={cls} style={{ width: size, height: size }} />;
  if (c >= 51 && c <= 55)
    return (
      <CloudDrizzle className={cls} style={{ width: size, height: size }} />
    );
  if (c >= 61 && c <= 65)
    return <CloudRain className={cls} style={{ width: size, height: size }} />;
  if (c >= 71 && c <= 75)
    return <CloudSnow className={cls} style={{ width: size, height: size }} />;
  if (c >= 80 && c <= 82)
    return <CloudRain className={cls} style={{ width: size, height: size }} />;
  if (c === 95)
    return (
      <CloudLightning className={cls} style={{ width: size, height: size }} />
    );
  return <Cloud className={cls} style={{ width: size, height: size }} />;
}

function LoadingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center weather-bg"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      data-ocid="app.loading_state"
    >
      {/* Background orbs */}
      <div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.45 0.2 220 / 0.35) 0%, transparent 70%)",
          top: "15%",
          left: "20%",
          filter: "blur(40px)",
          animation: "orb-pulse 3s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.42 0.18 280 / 0.3) 0%, transparent 70%)",
          bottom: "15%",
          right: "15%",
          filter: "blur(50px)",
          animation: "orb-pulse 3.5s ease-in-out infinite 0.5s",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated weather icon cluster */}
        <motion.div
          className="relative"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle, oklch(0.38 0.16 220 / 0.6) 0%, oklch(0.25 0.1 260 / 0.4) 100%)",
              border: "1px solid oklch(0.55 0.15 200 / 0.4)",
              boxShadow:
                "0 0 60px oklch(0.55 0.2 200 / 0.4), inset 0 1px 0 oklch(0.7 0.1 200 / 0.2)",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <Sun
                style={{
                  width: 56,
                  height: 56,
                  color: "oklch(0.9 0.12 70)",
                  filter: "drop-shadow(0 0 12px oklch(0.8 0.15 60 / 0.8))",
                }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* App name */}
        <div className="text-center">
          <motion.h1
            className="font-fraunces text-5xl font-bold tracking-tight"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.9 0.06 200), oklch(0.85 0.1 60), oklch(0.9 0.06 200))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Skyveil
          </motion.h1>
          <motion.p
            className="text-sm mt-2 font-sora tracking-[0.25em] uppercase"
            style={{ color: "oklch(0.6 0.08 220)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Weather Intelligence
          </motion.p>
        </div>

        {/* Loading dots */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "oklch(0.65 0.15 200)" }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function WeatherDetail({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="glass-card rounded-2xl p-4 flex flex-col gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      <div
        className="flex items-center gap-2"
        style={{ color: "oklch(0.62 0.1 220)" }}
      >
        {icon}
        <span className="text-xs font-sora uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div
        className="text-xl font-fraunces font-semibold"
        style={{ color: "oklch(0.92 0.04 220)" }}
      >
        {value}
      </div>
    </motion.div>
  );
}

function WeatherDashboard({ weather }: { weather: Weather }) {
  const condition = getWeatherCondition(weather.weatherCode);

  return (
    <motion.div
      className="w-full max-w-2xl"
      data-ocid="weather.card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero temperature section */}
      <div className="glass-card rounded-3xl p-8 mb-4 relative overflow-hidden">
        {/* Background blur orb */}
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.45 0.2 220 / 0.2) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        <div className="relative z-10">
          {/* City & condition row */}
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <MapPin
                style={{
                  width: 18,
                  height: 18,
                  color: "oklch(0.72 0.18 200)",
                }}
              />
              <span
                className="font-fraunces text-2xl font-semibold"
                style={{ color: "oklch(0.94 0.04 220)" }}
              >
                {weather.cityName}
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "oklch(0.28 0.08 220 / 0.5)",
                border: "1px solid oklch(0.45 0.12 220 / 0.3)",
              }}
            >
              <WeatherIcon code={weather.weatherCode} size={18} />
              <span
                className="text-sm font-sora"
                style={{ color: "oklch(0.82 0.08 220)" }}
              >
                {condition}
              </span>
            </div>
          </motion.div>

          {/* Big temperature */}
          <motion.div
            className="flex items-start gap-4 mb-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-start">
              <span
                className="font-fraunces leading-none select-none"
                style={{
                  fontSize: "clamp(6rem, 18vw, 9rem)",
                  background:
                    "linear-gradient(160deg, oklch(0.95 0.04 200) 0%, oklch(0.88 0.1 60) 50%, oklch(0.85 0.08 200) 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                }}
              >
                {Math.round(weather.currentTemp)}
              </span>
              <span
                className="font-fraunces font-light mt-4"
                style={{
                  fontSize: "clamp(2rem, 6vw, 3.5rem)",
                  color: "oklch(0.7 0.08 200)",
                }}
              >
                °C
              </span>
            </div>
            <div
              className="flex flex-col gap-1 mt-6 ml-2"
              style={{ color: "oklch(0.58 0.08 220)" }}
            >
              <span className="text-sm font-sora">
                ↑ {Math.round(weather.tempMax)}°
              </span>
              <span className="text-sm font-sora">
                ↓ {Math.round(weather.tempMin)}°
              </span>
            </div>
          </motion.div>

          {/* Feels like */}
          <motion.p
            className="text-sm font-sora"
            style={{ color: "oklch(0.6 0.08 220)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Feels like{" "}
            <span style={{ color: "oklch(0.8 0.08 60)" }}>
              {Math.round(weather.feelsLike)}°C
            </span>
          </motion.p>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <WeatherDetail
          icon={<Droplets style={{ width: 16, height: 16 }} />}
          label="Humidity"
          value={`${weather.humidity}%`}
          delay={0.3}
        />
        <WeatherDetail
          icon={<Wind style={{ width: 16, height: 16 }} />}
          label="Wind"
          value={`${Math.round(weather.windSpeed)} km/h`}
          delay={0.38}
        />
        <WeatherDetail
          icon={<Thermometer style={{ width: 16, height: 16 }} />}
          label="Max"
          value={`${Math.round(weather.tempMax)}°C`}
          delay={0.46}
        />
        <WeatherDetail
          icon={<Eye style={{ width: 16, height: 16 }} />}
          label="Min"
          value={`${Math.round(weather.tempMin)}°C`}
          delay={0.54}
        />
      </div>

      {/* Timezone */}
      <motion.p
        className="text-center text-xs mt-4 font-sora tracking-wider uppercase"
        style={{ color: "oklch(0.45 0.06 220)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        {weather.timezone}
      </motion.p>
    </motion.div>
  );
}

function WeatherApp() {
  const [showLoading, setShowLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("London");
  const [activeCity, setActiveCity] = useState("London");

  const {
    data: weather,
    isLoading,
    isError,
    error,
  } = useGetWeather(activeCity);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) setActiveCity(trimmed);
  };

  return (
    <div
      className="min-h-screen weather-bg flex flex-col"
      style={{ fontFamily: "Sora, sans-serif" }}
    >
      <AnimatePresence>
        {showLoading && <LoadingScreen onDone={() => setShowLoading(false)} />}
      </AnimatePresence>

      <main className="flex-1 flex flex-col items-center px-4 py-12">
        {/* Header */}
        <motion.header
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1
            className="font-fraunces text-4xl font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.92 0.04 200), oklch(0.88 0.1 60))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Skyveil
          </h1>
          <p
            className="text-xs mt-1 tracking-[0.3em] uppercase font-sora"
            style={{ color: "oklch(0.5 0.08 220)" }}
          >
            Live weather conditions
          </p>
        </motion.header>

        {/* Search */}
        <motion.form
          className="w-full max-w-lg mb-10"
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{
                  width: 16,
                  height: 16,
                  color: "oklch(0.58 0.12 220)",
                }}
              />
              <Input
                data-ocid="search.search_input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter city name…"
                className="pl-9 h-12 font-sora text-sm"
                style={{
                  background: "oklch(0.18 0.04 265 / 0.6)",
                  border: "1px solid oklch(0.35 0.06 265 / 0.4)",
                  backdropFilter: "blur(10px)",
                  color: "oklch(0.92 0.04 220)",
                }}
              />
            </div>
            <Button
              data-ocid="search.submit_button"
              type="submit"
              disabled={isLoading}
              className="h-12 px-5 font-sora text-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.18 220), oklch(0.48 0.2 260))",
                border: "none",
                boxShadow: "0 4px 20px oklch(0.55 0.18 220 / 0.35)",
              }}
            >
              <Search style={{ width: 16, height: 16, marginRight: 6 }} />
              Search
            </Button>
          </div>
        </motion.form>

        {/* Content area */}
        <div className="w-full flex justify-center">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                data-ocid="weather.loading_state"
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="w-16 h-16 rounded-full border-2 border-t-transparent animate-spin"
                  style={{
                    borderColor: "oklch(0.6 0.15 220 / 0.3)",
                    borderTopColor: "transparent",
                  }}
                />
                <div
                  className="w-3 h-3 rounded-full animate-spin"
                  style={{
                    borderTop: "2px solid oklch(0.72 0.18 200)",
                    position: "absolute",
                  }}
                />
                <p
                  className="text-sm font-sora"
                  style={{ color: "oklch(0.58 0.08 220)" }}
                >
                  Fetching weather data…
                </p>
              </motion.div>
            )}

            {isError && !isLoading && (
              <motion.div
                key="error"
                data-ocid="weather.error_state"
                className="glass-card rounded-2xl p-8 max-w-md text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <CloudRain
                  style={{
                    width: 48,
                    height: 48,
                    margin: "0 auto 16px",
                    color: "oklch(0.55 0.18 25)",
                  }}
                />
                <h3
                  className="font-fraunces text-xl mb-2"
                  style={{ color: "oklch(0.88 0.04 220)" }}
                >
                  City not found
                </h3>
                <p
                  className="text-sm font-sora"
                  style={{ color: "oklch(0.58 0.08 220)" }}
                >
                  {error instanceof Error
                    ? error.message
                    : "We couldn't find weather data for that city. Check the name and try again."}
                </p>
              </motion.div>
            )}

            {weather && !isLoading && (
              <WeatherDashboard key={weather.cityName} weather={weather} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p
          className="text-xs font-sora"
          style={{ color: "oklch(0.4 0.06 220)" }}
        >
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "oklch(0.58 0.1 220)" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherApp />
    </QueryClientProvider>
  );
}
