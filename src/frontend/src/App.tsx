import { AdBanner, AdBannerBottom } from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AlertTriangle,
  Camera,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Droplets,
  Eye,
  Gauge,
  Loader2,
  LocateFixed,
  MapPin,
  Moon,
  Search,
  Share2,
  Sun,
  Thermometer,
  Thermometer as ThermometerIcon,
  WifiOff,
  Wind,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { type Weather, useGetWeather } from "./hooks/useQueries";

const queryClient = new QueryClient();

type Theme = "dark" | "light";

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem("truetemp-theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      // ignore
    }
    return "dark";
  });

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("truetemp-theme", next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}

// ─── Haptic Feedback ──────────────────────────────────────────────────────────

function haptic(pattern: number | number[]) {
  try {
    if (navigator && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // graceful no-op
  }
}

// ─── Daily Visit Streak ───────────────────────────────────────────────────────

function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem("truetemp_streak_last_date");
      const count = Number.parseInt(
        localStorage.getItem("truetemp_streak_count") || "0",
        10,
      );

      let newCount = count;
      if (!lastDate) {
        newCount = 1;
      } else if (lastDate === today) {
        newCount = count || 1;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
          newCount = count + 1;
        } else {
          newCount = 1;
        }
      }

      localStorage.setItem("truetemp_streak_count", String(newCount));
      localStorage.setItem("truetemp_streak_last_date", today);
      setStreak(newCount);

      // Milestone celebration
      const milestones: Record<number, string> = {
        3: "Bronze",
        7: "Silver",
        14: "Gold",
        30: "Diamond",
      };
      const badge = milestones[newCount];
      if (badge) {
        const seenKey = `truetemp_milestone_${newCount}`;
        const seen = localStorage.getItem(seenKey);
        if (!seen) {
          localStorage.setItem(seenKey, "1");
          setTimeout(() => {
            toast.success(
              `🏅 ${badge} Badge Unlocked! ${newCount}-day streak!`,
              {
                duration: 5000,
              },
            );
          }, 2000);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return streak;
}

// ─── Offline Mode ─────────────────────────────────────────────────────────────

function useOfflineMode() {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" && !navigator.onLine,
  );

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return isOffline;
}

function getCachedWeather(): {
  weather: import("./hooks/useQueries").Weather | null;
  time: string | null;
} {
  try {
    const raw = localStorage.getItem("truetemp_cache");
    const time = localStorage.getItem("truetemp_cache_time");
    if (!raw) return { weather: null, time: null };
    const parsed = JSON.parse(raw);
    parsed.weatherCode = BigInt(parsed.weatherCode);
    return { weather: parsed, time };
  } catch {
    return { weather: null, time: null };
  }
}

const T = {
  dark: {
    text: "oklch(0.92 0.04 220)",
    textMuted: "oklch(0.58 0.08 220)",
    textSubtle: "oklch(0.45 0.06 220)",
    textDim: "oklch(0.4 0.06 220)",
    iconAccent: "oklch(0.72 0.18 200)",
    iconMuted: "oklch(0.62 0.1 220)",
    mapPin: "oklch(0.72 0.18 200)",
    pillBg: "oklch(0.28 0.08 220 / 0.5)",
    pillBorder: "1px solid oklch(0.45 0.12 220 / 0.3)",
    pillText: "oklch(0.82 0.08 220)",
    inputBg: "oklch(0.18 0.04 265 / 0.6)",
    inputBorder: "1px solid oklch(0.35 0.06 265 / 0.4)",
    inputText: "oklch(0.92 0.04 220)",
    searchBtn:
      "linear-gradient(135deg, oklch(0.55 0.18 220), oklch(0.48 0.2 260))",
    locBtnBg: "oklch(0.22 0.06 200 / 0.55)",
    locBtnBgActive: "oklch(0.22 0.06 200 / 0.7)",
    locBtnBorder: "1px solid oklch(0.45 0.14 200 / 0.45)",
    locBtnText: "oklch(0.78 0.14 200)",
    spinnerBorder: "oklch(0.6 0.15 220 / 0.3)",
    feelsLike: "oklch(0.8 0.08 60)",
    errorIcon: "oklch(0.55 0.18 25)",
    errorTitle: "oklch(0.88 0.04 220)",
    footerLink: "oklch(0.58 0.1 220)",
    toggleBg: "oklch(0.2 0.06 265 / 0.7)",
    toggleBorder: "1px solid oklch(0.38 0.08 265 / 0.5)",
    toggleColor: "oklch(0.82 0.1 60)",
  },
  light: {
    text: "oklch(0.2 0.06 265)",
    textMuted: "oklch(0.45 0.08 240)",
    textSubtle: "oklch(0.5 0.06 240)",
    textDim: "oklch(0.55 0.06 220)",
    iconAccent: "oklch(0.45 0.16 220)",
    iconMuted: "oklch(0.4 0.1 230)",
    mapPin: "oklch(0.42 0.16 220)",
    pillBg: "oklch(0.92 0.04 220 / 0.6)",
    pillBorder: "1px solid oklch(0.75 0.08 220 / 0.6)",
    pillText: "oklch(0.3 0.1 240)",
    inputBg: "oklch(1 0 0 / 0.8)",
    inputBorder: "1px solid oklch(0.82 0.06 220 / 0.7)",
    inputText: "oklch(0.2 0.06 265)",
    searchBtn:
      "linear-gradient(135deg, oklch(0.5 0.18 220), oklch(0.44 0.2 260))",
    locBtnBg: "oklch(0.88 0.06 220 / 0.8)",
    locBtnBgActive: "oklch(0.82 0.08 220 / 0.9)",
    locBtnBorder: "1px solid oklch(0.72 0.1 220 / 0.6)",
    locBtnText: "oklch(0.3 0.1 220)",
    spinnerBorder: "oklch(0.55 0.12 220 / 0.3)",
    feelsLike: "oklch(0.45 0.14 60)",
    errorIcon: "oklch(0.5 0.18 25)",
    errorTitle: "oklch(0.2 0.06 265)",
    footerLink: "oklch(0.42 0.1 220)",
    toggleBg: "oklch(0.96 0.02 220 / 0.85)",
    toggleBorder: "1px solid oklch(0.82 0.06 220 / 0.7)",
    toggleColor: "oklch(0.4 0.14 240)",
  },
} as const;

function getUvLevel(uvRaw: number): {
  scale: number;
  color: string;
  glow: string;
  label: string;
  advice: string;
} {
  const scale = Math.min(10, Math.max(1, Math.round(uvRaw) || 1));
  if (scale <= 3) {
    return {
      scale,
      color: "oklch(0.72 0.22 145)",
      glow: "oklch(0.72 0.22 145 / 0.4)",
      label: "Low",
      advice: "Safe to go out",
    };
  }
  if (scale <= 5) {
    return {
      scale,
      color: "oklch(0.85 0.2 95)",
      glow: "oklch(0.85 0.2 95 / 0.4)",
      label: "Moderate",
      advice: "Use sunscreen",
    };
  }
  if (scale <= 7) {
    return {
      scale,
      color: "oklch(0.75 0.22 55)",
      glow: "oklch(0.75 0.22 55 / 0.4)",
      label: "High",
      advice: "Limit time outside",
    };
  }
  return {
    scale,
    color: "oklch(0.62 0.24 25)",
    glow: "oklch(0.62 0.24 25 / 0.4)",
    label: "Danger",
    advice: "Avoid going outside",
  };
}

function getAqiLevel(aqi: number): {
  label: string;
  color: string;
  glow: string;
  advice: string;
} {
  if (aqi <= 20)
    return {
      label: "Good",
      color: "oklch(0.72 0.22 145)",
      glow: "oklch(0.72 0.22 145 / 0.4)",
      advice: "Air is clean",
    };
  if (aqi <= 40)
    return {
      label: "Fair",
      color: "oklch(0.82 0.18 120)",
      glow: "oklch(0.82 0.18 120 / 0.4)",
      advice: "Acceptable air quality",
    };
  if (aqi <= 60)
    return {
      label: "Moderate",
      color: "oklch(0.85 0.2 95)",
      glow: "oklch(0.85 0.2 95 / 0.4)",
      advice: "Sensitive groups take caution",
    };
  if (aqi <= 80)
    return {
      label: "Poor",
      color: "oklch(0.75 0.22 55)",
      glow: "oklch(0.75 0.22 55 / 0.4)",
      advice: "Sensitive groups affected",
    };
  if (aqi <= 100)
    return {
      label: "Very Poor",
      color: "oklch(0.62 0.24 25)",
      glow: "oklch(0.62 0.24 25 / 0.4)",
      advice: "Avoid outdoor activity",
    };
  return {
    label: "Extremely Poor",
    color: "oklch(0.5 0.24 15)",
    glow: "oklch(0.5 0.24 15 / 0.4)",
    advice: "Stay indoors, keep windows closed",
  };
}

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

function WeatherIcon({
  code,
  size = 48,
}: { code: number | bigint; size?: number }) {
  const c = Number(code);
  if (c === 0) return <Sun style={{ width: size, height: size }} />;
  if (c >= 1 && c <= 3) return <Cloud style={{ width: size, height: size }} />;
  if (c === 45 || c === 48)
    return <CloudFog style={{ width: size, height: size }} />;
  if (c >= 51 && c <= 55)
    return <CloudDrizzle style={{ width: size, height: size }} />;
  if (c >= 61 && c <= 65)
    return <CloudRain style={{ width: size, height: size }} />;
  if (c >= 71 && c <= 75)
    return <CloudSnow style={{ width: size, height: size }} />;
  if (c >= 80 && c <= 82)
    return <CloudRain style={{ width: size, height: size }} />;
  if (c === 95) return <CloudLightning style={{ width: size, height: size }} />;
  return <Cloud style={{ width: size, height: size }} />;
}

// ─── WeatherAnimation ─────────────────────────────────────────────────────────

function WeatherAnimation({ code, theme }: { code: bigint; theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const c = Number(code);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const isDark = theme === "dark";

    // ── RAIN (61-65, 80-82, 95) ──
    if ((c >= 61 && c <= 65) || (c >= 80 && c <= 82) || c === 95) {
      const drops: {
        x: number;
        y: number;
        speed: number;
        length: number;
        opacity: number;
      }[] = [];
      for (let i = 0; i < 120; i++) {
        drops.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          speed: 8 + Math.random() * 8,
          length: 15 + Math.random() * 20,
          opacity: 0.15 + Math.random() * 0.25,
        });
      }
      let lightningTimer = 0;
      let lightningFlash = 0;

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (c === 95) {
          lightningTimer++;
          if (lightningTimer > 120 && Math.random() < 0.02) {
            lightningFlash = 6;
            lightningTimer = 0;
          }
          if (lightningFlash > 0) {
            ctx.fillStyle = `rgba(255,255,220,${lightningFlash * 0.04})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            lightningFlash--;
          }
        }

        ctx.strokeStyle = isDark
          ? "rgba(180,210,255,0.35)"
          : "rgba(100,150,220,0.25)";
        ctx.lineWidth = 1;
        for (const d of drops) {
          ctx.beginPath();
          ctx.globalAlpha = d.opacity;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 2, d.y + d.length);
          ctx.stroke();
          d.y += d.speed;
          if (d.y > canvas.height) {
            d.y = -d.length;
            d.x = Math.random() * canvas.width;
          }
        }
        ctx.globalAlpha = 1;
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ── DRIZZLE (51-55) ──
    else if (c >= 51 && c <= 55) {
      const drops: { x: number; y: number; speed: number }[] = [];
      for (let i = 0; i < 60; i++) {
        drops.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          speed: 3 + Math.random() * 3,
        });
      }
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = isDark
          ? "rgba(180,210,255,0.2)"
          : "rgba(100,150,220,0.18)";
        ctx.lineWidth = 0.8;
        for (const d of drops) {
          ctx.beginPath();
          ctx.globalAlpha = 0.3;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 1, d.y + 8);
          ctx.stroke();
          d.y += d.speed;
          if (d.y > canvas.height) {
            d.y = 0;
            d.x = Math.random() * canvas.width;
          }
        }
        ctx.globalAlpha = 1;
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ── SNOW (71-75) ──
    else if (c >= 71 && c <= 75) {
      const flakes: {
        x: number;
        y: number;
        r: number;
        speed: number;
        wobble: number;
        wobbleSpeed: number;
      }[] = [];
      for (let i = 0; i < 80; i++) {
        flakes.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: 2 + Math.random() * 3,
          speed: 0.8 + Math.random() * 1.5,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.03,
        });
      }
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = isDark
          ? "rgba(220,235,255,0.6)"
          : "rgba(180,210,255,0.5)";
        for (const f of flakes) {
          ctx.beginPath();
          ctx.globalAlpha = 0.5;
          ctx.arc(f.x + Math.sin(f.wobble) * 3, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
          f.y += f.speed;
          f.wobble += f.wobbleSpeed;
          if (f.y > canvas.height) {
            f.y = -5;
            f.x = Math.random() * canvas.width;
          }
        }
        ctx.globalAlpha = 1;
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ── FOGGY (45, 48) ── CSS-based, canvas just shows subtle mist layers
    // ── SUNNY (0) & PARTLY CLOUDY (1-3) ── CSS-handled via backgrounds
    // No canvas animation needed for those — handled by background gradients.

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [c, theme]);

  // For fog, render CSS mist layers
  if (c === 45 || c === 48) {
    return (
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 1, opacity: 0.4 }}
        aria-hidden
      >
        <div className="fog-layer fog-layer-1" />
        <div className="fog-layer fog-layer-2" />
        <div className="fog-layer fog-layer-3" />
      </div>
    );
  }

  // For partly cloudy, render CSS drifting clouds
  if (c >= 1 && c <= 3) {
    return (
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 1, opacity: isDark(theme) ? 0.25 : 0.35 }}
        aria-hidden
      >
        <div className="cloud-shape cloud-1" />
        <div className="cloud-shape cloud-2" />
        <div className="cloud-shape cloud-3" />
      </div>
    );
  }

  // For clear/sunny: sunbeam effect
  if (c === 0) {
    return (
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 1, opacity: 0.35 }}
        aria-hidden
      >
        <div className="sunbeam-container">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="sunbeam"
              style={{ transform: `rotate(${i * 45}deg)` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Canvas-based animations for rain/snow/drizzle/thunder
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 1 }}
      aria-hidden
    />
  );
}

function isDark(theme: Theme): boolean {
  return theme === "dark";
}

// ─── WeatherAlertBanner ───────────────────────────────────────────────────────

function getAlerts(
  weatherCode: bigint,
  uvIndex: number,
  currentTemp: number,
  aqi: number,
): {
  icon: React.ReactNode;
  message: string;
  severity: "warning" | "danger";
}[] {
  const alerts: {
    icon: React.ReactNode;
    message: string;
    severity: "warning" | "danger";
  }[] = [];
  const c = Number(weatherCode);
  if (c === 95)
    alerts.push({
      icon: <CloudLightning style={{ width: 18, height: 18 }} />,
      message: "Thunderstorm active — stay indoors, avoid open areas",
      severity: "danger",
    });
  if (uvIndex >= 8)
    alerts.push({
      icon: <Sun style={{ width: 18, height: 18 }} />,
      message: `Extreme UV index (${uvIndex.toFixed(1)}) — avoid sun exposure, use strong sunscreen`,
      severity: "danger",
    });
  if (currentTemp >= 45)
    alerts.push({
      icon: <Thermometer style={{ width: 18, height: 18 }} />,
      message: `Dangerous heat (${Math.round(currentTemp)}°C) — stay hydrated, avoid outdoor exertion`,
      severity: "danger",
    });
  if (currentTemp <= 0)
    alerts.push({
      icon: <Thermometer style={{ width: 18, height: 18 }} />,
      message: `Freezing temperatures (${Math.round(currentTemp)}°C) — dress in layers, risk of ice`,
      severity: "warning",
    });
  if (aqi >= 80)
    alerts.push({
      icon: <Wind style={{ width: 18, height: 18 }} />,
      message: `Very poor air quality (AQI ${aqi}) — avoid outdoor activity`,
      severity: "danger",
    });
  return alerts;
}

function WeatherAlertBanner({
  weatherCode,
  uvIndex,
  currentTemp,
  aqi,
  theme,
}: {
  weatherCode: bigint;
  uvIndex: number;
  currentTemp: number;
  aqi: number;
  theme: Theme;
}) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const notifiedRef = useRef(false);
  const alerts = getAlerts(weatherCode, uvIndex, currentTemp, aqi);
  const visible = alerts.filter((_, i) => !dismissed.has(i));

  // biome-ignore lint/correctness/useExhaustiveDependencies: alerts derived from primitive props
  useEffect(() => {
    if (alerts.length === 0 || notifiedRef.current) return;
    notifiedRef.current = true;
    haptic([200, 100, 200, 100, 400]);
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            new Notification("TRUE TEMP — Weather Alert", {
              body: alerts[0].message,
              icon: "/assets/generated/truetemp-icon.png",
            });
          }
        });
      } else if (Notification.permission === "granted") {
        new Notification("TRUE TEMP — Weather Alert", {
          body: alerts[0].message,
          icon: "/assets/generated/truetemp-icon.png",
        });
      }
    }
  }, [weatherCode, uvIndex, currentTemp, aqi]);

  if (visible.length === 0) return null;

  return (
    <div
      className="w-full max-w-2xl mb-4 flex flex-col gap-2"
      data-ocid="alert.card"
    >
      <AnimatePresence>
        {visible.map((alert, i) => (
          <motion.div
            key={alert.message}
            data-ocid={`alert.item.${i + 1}`}
            className="flex items-start gap-3 rounded-2xl px-4 py-3"
            style={{
              background:
                alert.severity === "danger"
                  ? theme === "dark"
                    ? "oklch(0.25 0.08 25 / 0.7)"
                    : "oklch(0.96 0.05 25 / 0.8)"
                  : theme === "dark"
                    ? "oklch(0.28 0.1 60 / 0.65)"
                    : "oklch(0.97 0.05 70 / 0.85)",
              border:
                alert.severity === "danger"
                  ? "1px solid oklch(0.62 0.2 25 / 0.5)"
                  : "1px solid oklch(0.78 0.18 70 / 0.5)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              color:
                alert.severity === "danger"
                  ? theme === "dark"
                    ? "oklch(0.9 0.06 30)"
                    : "oklch(0.4 0.16 25)"
                  : theme === "dark"
                    ? "oklch(0.9 0.06 70)"
                    : "oklch(0.45 0.14 55)",
            }}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="mt-0.5 shrink-0">{alert.icon}</span>
            <p className="text-sm font-sora flex-1 leading-snug">
              {alert.message}
            </p>
            <button
              data-ocid={`alert.close_button.${i + 1}`}
              onClick={() =>
                setDismissed(
                  (prev) => new Set([...prev, alerts.indexOf(alert)]),
                )
              }
              className="shrink-0 mt-0.5 opacity-60 hover:opacity-100 transition-opacity"
              type="button"
              aria-label="Dismiss alert"
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── HourlyForecastCard ───────────────────────────────────────────────────────

function HourlyForecastCard({
  hourly,
  theme,
}: {
  hourly: { time: string; temp: number; weatherCode: number }[];
  theme: Theme;
}) {
  const tk = T[theme];

  return (
    <motion.div
      data-ocid="hourly.card"
      className="glass-card rounded-2xl p-5 mt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sun style={{ width: 16, height: 16, color: tk.iconMuted }} />
        <span
          className="text-xs font-sora uppercase tracking-widest"
          style={{ color: tk.iconMuted }}
        >
          Hourly Forecast
        </span>
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onScroll={() => haptic(10)}
      >
        {hourly.map((slot, idx) => {
          const date = new Date(slot.time);
          const hour = date.getHours();
          const label =
            hour === 0
              ? "12 AM"
              : hour < 12
                ? `${hour} AM`
                : hour === 12
                  ? "12 PM"
                  : `${hour - 12} PM`;
          return (
            <div
              key={slot.time}
              data-ocid={`hourly.item.${idx + 1}`}
              className="flex flex-col items-center gap-2 shrink-0"
              style={{
                minWidth: 52,
                padding: "8px 6px",
                borderRadius: 14,
                background:
                  theme === "dark"
                    ? "oklch(0.22 0.04 265 / 0.4)"
                    : "oklch(0.96 0.02 220 / 0.5)",
              }}
            >
              <span
                className="text-[11px] font-sora"
                style={{ color: tk.textSubtle }}
              >
                {label}
              </span>
              <span style={{ color: tk.iconMuted }}>
                <WeatherIcon code={slot.weatherCode} size={18} />
              </span>
              <span
                className="font-fraunces text-sm font-semibold"
                style={{ color: tk.text }}
              >
                {Math.round(slot.temp)}°
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── SevenDayForecastCard ─────────────────────────────────────────────────────

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function SevenDayForecastCard({
  daily,
  theme,
}: {
  daily: {
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
  }[];
  theme: Theme;
}) {
  const tk = T[theme];
  const allMax = daily.map((d) => d.tempMax);
  const allMin = daily.map((d) => d.tempMin);
  const rangeMax = Math.max(...allMax);
  const rangeMin = Math.min(...allMin);
  const range = rangeMax - rangeMin || 1;

  return (
    <motion.div
      data-ocid="forecast.card"
      className="glass-card rounded-2xl p-5 mt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Cloud style={{ width: 16, height: 16, color: tk.iconMuted }} />
        <span
          className="text-xs font-sora uppercase tracking-widest"
          style={{ color: tk.iconMuted }}
        >
          7-Day Forecast
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {daily.map((day, idx) => {
          const d = new Date(`${day.date}T12:00:00`);
          const dayName = idx === 0 ? "Today" : DAY_NAMES[d.getDay()];
          const lowPct = ((day.tempMin - rangeMin) / range) * 100;
          const highPct = ((day.tempMax - rangeMin) / range) * 100;
          const barLeft = `${lowPct}%`;
          const barWidth = `${highPct - lowPct}%`;

          return (
            <div
              key={day.date}
              data-ocid={`forecast.item.${idx + 1}`}
              className="flex items-center gap-3"
              style={{ minHeight: 36 }}
            >
              <span
                className="font-sora text-sm w-12 shrink-0"
                style={{ color: tk.textMuted }}
              >
                {dayName}
              </span>
              <span style={{ color: tk.iconMuted, flexShrink: 0 }}>
                <WeatherIcon code={day.weatherCode} size={16} />
              </span>
              <span
                className="font-fraunces text-sm w-10 text-right shrink-0"
                style={{ color: tk.textSubtle }}
              >
                {Math.round(day.tempMin)}°
              </span>
              <div
                className="flex-1 relative h-2 rounded-full"
                style={{
                  background:
                    theme === "dark"
                      ? "oklch(0.25 0.04 265 / 0.5)"
                      : "oklch(0.88 0.04 220 / 0.6)",
                }}
              >
                <div
                  className="absolute h-full rounded-full"
                  style={{
                    left: barLeft,
                    width: barWidth,
                    background:
                      "linear-gradient(90deg, oklch(0.62 0.16 220), oklch(0.75 0.18 60))",
                  }}
                />
              </div>
              <span
                className="font-fraunces text-sm w-10 shrink-0"
                style={{ color: tk.text }}
              >
                {Math.round(day.tempMax)}°
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── AQICard ──────────────────────────────────────────────────────────────────

function AQICard({ aqi, theme }: { aqi: number; theme: Theme }) {
  const tk = T[theme];
  const level = getAqiLevel(aqi);
  const barPct = Math.min(100, (aqi / 150) * 100);

  return (
    <motion.div
      data-ocid="aqi.card"
      className="glass-card rounded-2xl p-5 mt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wind
            style={{
              width: 16,
              height: 16,
              color: level.color,
              filter: `drop-shadow(0 0 6px ${level.glow})`,
            }}
          />
          <span
            className="text-xs font-sora uppercase tracking-widest"
            style={{ color: tk.iconMuted }}
          >
            Air Quality Index
          </span>
        </div>
        <span
          className="text-xs font-sora px-2 py-0.5 rounded-full"
          style={{
            background: `color-mix(in oklch, ${level.color} 18%, transparent)`,
            color: level.color,
            border: `1px solid color-mix(in oklch, ${level.color} 35%, transparent)`,
          }}
        >
          {level.label}
        </span>
      </div>
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-end gap-2">
          <span
            className="font-fraunces font-bold leading-none"
            style={{
              fontSize: "3rem",
              color: level.color,
              filter: `drop-shadow(0 0 12px ${level.glow})`,
              transition: "color 0.4s ease",
            }}
          >
            {aqi}
          </span>
          <span
            className="font-fraunces mb-1"
            style={{ fontSize: "1.2rem", color: tk.textMuted }}
          >
            AQI
          </span>
        </div>
        <div className="text-right">
          <p
            className="font-sora font-semibold text-sm"
            style={{ color: level.color }}
          >
            {level.advice}
          </p>
          <p
            className="font-sora text-xs mt-0.5"
            style={{ color: tk.textSubtle }}
          >
            European AQI Scale
          </p>
        </div>
      </div>
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{
          background:
            theme === "dark"
              ? "oklch(0.28 0.04 220 / 0.5)"
              : "oklch(0.88 0.04 220 / 0.6)",
        }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.72 0.22 145), oklch(0.85 0.2 95), oklch(0.75 0.22 55), oklch(0.62 0.24 25), oklch(0.5 0.24 15))",
            transformOrigin: "left",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: barPct / 100 }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <div
        className="flex justify-between mt-1.5"
        style={{ color: tk.textDim }}
      >
        <span className="text-[10px] font-sora">0</span>
        <span className="text-[10px] font-sora">Good</span>
        <span className="text-[10px] font-sora">Poor</span>
        <span className="text-[10px] font-sora">150+</span>
      </div>
    </motion.div>
  );
}

// ─── UVCard ───────────────────────────────────────────────────────────────────

function UVCard({ uvIndex, theme }: { uvIndex: number; theme: Theme }) {
  const tk = T[theme];
  const uv = getUvLevel(uvIndex);

  return (
    <motion.div
      data-ocid="uv.card"
      className="glass-card rounded-2xl p-5 mt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sun
            style={{
              width: 16,
              height: 16,
              color: uv.color,
              filter: `drop-shadow(0 0 6px ${uv.glow})`,
            }}
          />
          <span
            className="text-xs font-sora uppercase tracking-widest"
            style={{ color: tk.iconMuted }}
          >
            UV Radiation
          </span>
        </div>
        <span
          className="text-xs font-sora px-2 py-0.5 rounded-full"
          style={{
            background: `color-mix(in oklch, ${uv.color} 18%, transparent)`,
            color: uv.color,
            border: `1px solid color-mix(in oklch, ${uv.color} 35%, transparent)`,
          }}
        >
          {uv.label}
        </span>
      </div>
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-end gap-2">
          <span
            className="font-fraunces font-bold leading-none"
            style={{
              fontSize: "3rem",
              color: uv.color,
              filter: `drop-shadow(0 0 12px ${uv.glow})`,
              transition: "color 0.4s ease",
            }}
          >
            {uv.scale}
          </span>
          <span
            className="font-fraunces mb-1"
            style={{ fontSize: "1.4rem", color: tk.textMuted }}
          >
            /10
          </span>
        </div>
        <div className="text-right">
          <p
            className="font-sora font-semibold text-sm"
            style={{ color: uv.color }}
          >
            {uv.advice}
          </p>
          <p
            className="font-sora text-xs mt-0.5"
            style={{ color: tk.textSubtle }}
          >
            UV Index: {uvIndex.toFixed(1)}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => {
          const segIndex = i + 1;
          const filled = segIndex <= uv.scale;
          let segColor: string;
          if (segIndex <= 3) segColor = "oklch(0.72 0.22 145)";
          else if (segIndex <= 5) segColor = "oklch(0.85 0.2 95)";
          else if (segIndex <= 7) segColor = "oklch(0.75 0.22 55)";
          else segColor = "oklch(0.62 0.24 25)";
          return (
            <motion.div
              key={segIndex}
              className="flex-1 rounded-full"
              style={{
                height: 8,
                background: filled
                  ? segColor
                  : theme === "dark"
                    ? "oklch(0.28 0.04 220 / 0.5)"
                    : "oklch(0.88 0.04 220 / 0.6)",
                boxShadow: filled ? `0 0 6px ${segColor}` : "none",
                transition: "background 0.3s ease",
              }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 0.65 + i * 0.04,
                duration: 0.3,
                ease: "easeOut",
              }}
            />
          );
        })}
      </div>
      <div
        className="flex justify-between mt-1.5"
        style={{ color: tk.textDim }}
      >
        <span className="text-[10px] font-sora">1</span>
        <span className="text-[10px] font-sora">5</span>
        <span className="text-[10px] font-sora">10</span>
      </div>
    </motion.div>
  );
}

// ─── LocationCard ─────────────────────────────────────────────────────────────

interface LocationInfo {
  city: string;
  state: string;
  country: string;
}

function useLocationInfo(lat: number, lon: number): LocationInfo | null {
  const [info, setInfo] = useState<LocationInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "Accept-Language": "en" } },
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const addr = data.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.hamlet ||
          addr.county ||
          "";
        const state = addr.state || "";
        const country = addr.country || "";
        setInfo({ city, state, country });
      })
      .catch(() => {
        if (!cancelled) setInfo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return info;
}

function LocationCard({
  lat,
  lon,
  cityName,
  theme,
}: { lat: number; lon: number; cityName: string; theme: Theme }) {
  const tk = T[theme];
  const info = useLocationInfo(lat, lon);

  const delta = 0.15;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <motion.div
      data-ocid="location.card"
      className="glass-card rounded-2xl overflow-hidden mt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2 px-5 pt-4 pb-3">
        <MapPin
          style={{ width: 16, height: 16, color: tk.mapPin, flexShrink: 0 }}
        />
        <span
          className="text-xs font-sora uppercase tracking-widest"
          style={{ color: tk.iconMuted }}
        >
          Location
        </span>
      </div>

      <div className="relative w-full" style={{ height: 220 }}>
        <iframe
          title="Location Map"
          src={mapUrl}
          className="w-full h-full border-0"
          style={{
            filter:
              theme === "dark"
                ? "invert(0.88) hue-rotate(180deg) saturate(0.7) brightness(0.85)"
                : "none",
          }}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="px-5 py-4">
        <p
          className="font-fraunces text-lg font-semibold leading-tight"
          style={{ color: tk.text }}
        >
          {info ? info.city || cityName : cityName}
        </p>
        {info && (info.state || info.country) && (
          <p className="font-sora text-sm mt-1" style={{ color: tk.textMuted }}>
            {[info.state, info.country].filter(Boolean).join(", ")}
          </p>
        )}
        <p className="font-sora text-xs mt-2" style={{ color: tk.textSubtle }}>
          {lat.toFixed(4)}°N, {lon.toFixed(4)}°E
        </p>
      </div>
    </motion.div>
  );
}

// ─── ClothingSuggestionsCard ──────────────────────────────────────────────────

interface ClothingItem {
  emoji: string;
  label: string;
}

function getClothingSuggestions(
  temp: number,
  weatherCode: number,
  uvIndex: number,
  windSpeed: number,
): ClothingItem[] {
  const items: ClothingItem[] = [];
  const code = Number(weatherCode);

  // Rain check (drizzle, rain, showers, thunderstorm)
  if (
    (code >= 51 && code <= 65) ||
    (code >= 80 && code <= 82) ||
    code === 95 ||
    code === 96 ||
    code === 99
  ) {
    items.push({ emoji: "☂️", label: "Umbrella" });
    items.push({ emoji: "🥾", label: "Waterproof shoes" });
  }

  // Temperature-based clothing
  if (temp < 10) {
    items.push({ emoji: "🧥", label: "Heavy coat" });
    items.push({ emoji: "🧣", label: "Scarf & gloves" });
  } else if (temp < 15) {
    items.push({ emoji: "🧥", label: "Heavy jacket" });
    items.push({ emoji: "🧣", label: "Scarf" });
  } else if (temp < 20) {
    items.push({ emoji: "🧣", label: "Light jacket" });
  } else if (temp >= 35) {
    items.push({ emoji: "👕", label: "Light clothing" });
    items.push({ emoji: "🕶️", label: "Sunglasses" });
  }

  // High UV
  if (uvIndex >= 6) {
    items.push({ emoji: "🧴", label: "Sunscreen" });
    items.push({ emoji: "🧢", label: "Hat / cap" });
  }

  // Windy
  if (windSpeed >= 30) {
    items.push({ emoji: "🧣", label: "Windbreaker" });
  }

  // Snow
  if (code >= 71 && code <= 75) {
    items.push({ emoji: "🧤", label: "Warm gloves" });
    items.push({ emoji: "👢", label: "Snow boots" });
  }

  // If nothing special, just a default
  if (items.length === 0) {
    items.push({ emoji: "👕", label: "Regular clothes" });
    items.push({ emoji: "😎", label: "All good!" });
  }

  // Deduplicate by label
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.label)) return false;
    seen.add(item.label);
    return true;
  });
}

function ClothingSuggestionsCard({
  weather,
  theme,
}: { weather: Weather; theme: Theme }) {
  const tk = T[theme];
  const items = getClothingSuggestions(
    weather.currentTemp,
    Number(weather.weatherCode),
    weather.uvIndex,
    weather.windSpeed,
  );

  return (
    <motion.div
      data-ocid="clothing.card"
      className="glass-card rounded-2xl p-5 mt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: 16 }}>👗</span>
        <span
          className="text-xs font-sora uppercase tracking-widest"
          style={{ color: tk.iconMuted }}
        >
          What to Wear
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <motion.div
            key={item.label}
            data-ocid={`clothing.item.${idx + 1}`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background:
                theme === "dark"
                  ? "oklch(0.22 0.06 220 / 0.5)"
                  : "oklch(0.94 0.04 220 / 0.6)",
              border:
                theme === "dark"
                  ? "1px solid oklch(0.38 0.08 220 / 0.3)"
                  : "1px solid oklch(0.78 0.06 220 / 0.5)",
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + idx * 0.06, duration: 0.3 }}
          >
            <span style={{ fontSize: 18 }}>{item.emoji}</span>
            <span className="text-sm font-sora" style={{ color: tk.text }}>
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── CommuteForecastCard ──────────────────────────────────────────────────────

interface CommuteHazard {
  type: "fog" | "heavy-rain" | "thunderstorm";
  label: string;
  emoji: string;
  timeRange: string;
}

function getCommuteHazards(
  hourly: { time: string; weatherCode: number }[],
): CommuteHazard[] {
  const hazardMap = new Map<
    string,
    {
      type: CommuteHazard["type"];
      label: string;
      emoji: string;
      times: string[];
    }
  >();

  for (const slot of hourly) {
    const code = slot.weatherCode;
    let key: string | null = null;
    let label = "";
    let emoji = "";
    let type: CommuteHazard["type"] = "fog";

    if (code === 45 || code === 48) {
      key = "fog";
      label = "Foggy conditions";
      emoji = "🌫️";
      type = "fog";
    } else if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
      key = "heavy-rain";
      label = "Heavy rain";
      emoji = "🌧️";
      type = "heavy-rain";
    } else if (code === 95 || code === 96 || code === 99) {
      key = "thunderstorm";
      label = "Thunderstorm";
      emoji = "⛈️";
      type = "thunderstorm";
    }

    if (key) {
      const date = new Date(slot.time);
      const hour = date.getHours();
      const timeLabel =
        hour === 0
          ? "12 AM"
          : hour < 12
            ? `${hour} AM`
            : hour === 12
              ? "12 PM"
              : `${hour - 12} PM`;

      if (!hazardMap.has(key)) {
        hazardMap.set(key, { type, label, emoji, times: [timeLabel] });
      } else {
        hazardMap.get(key)!.times.push(timeLabel);
      }
    }
  }

  return Array.from(hazardMap.values()).map((h) => {
    const times = h.times;
    const timeRange =
      times.length === 1
        ? times[0]
        : `${times[0]} – ${times[times.length - 1]}`;
    return { type: h.type, label: h.label, emoji: h.emoji, timeRange };
  });
}

function CommuteForecastCard({
  weather,
  theme,
}: { weather: Weather; theme: Theme }) {
  const tk = T[theme];
  const hazards = getCommuteHazards(weather.hourly);

  return (
    <motion.div
      data-ocid="commute.card"
      className="glass-card rounded-2xl p-5 mt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: 16 }}>🚗</span>
        <span
          className="text-xs font-sora uppercase tracking-widest"
          style={{ color: tk.iconMuted }}
        >
          Commute Forecast
        </span>
      </div>

      {hazards.length === 0 ? (
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 28 }}>✅</span>
          <div>
            <p
              className="font-sora font-semibold text-sm"
              style={{ color: "oklch(0.72 0.22 145)" }}
            >
              Clear commute
            </p>
            <p
              className="font-sora text-xs mt-0.5"
              style={{ color: tk.textSubtle }}
            >
              No weather hazards expected today
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {hazards.map((hazard, idx) => (
            <motion.div
              key={hazard.type}
              data-ocid={`commute.item.${idx + 1}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                background:
                  theme === "dark"
                    ? "oklch(0.26 0.08 40 / 0.45)"
                    : "oklch(0.97 0.04 60 / 0.7)",
                border:
                  theme === "dark"
                    ? "1px solid oklch(0.55 0.16 55 / 0.35)"
                    : "1px solid oklch(0.82 0.12 60 / 0.5)",
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 + idx * 0.08 }}
            >
              <span style={{ fontSize: 22 }}>{hazard.emoji}</span>
              <div className="flex-1">
                <p
                  className="font-sora font-semibold text-sm"
                  style={{
                    color:
                      theme === "dark"
                        ? "oklch(0.9 0.06 60)"
                        : "oklch(0.42 0.14 50)",
                  }}
                >
                  {hazard.label}
                </p>
                <p
                  className="font-sora text-xs mt-0.5"
                  style={{ color: tk.textSubtle }}
                >
                  Expected: {hazard.timeRange}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── SunMoonCard ──────────────────────────────────────────────────────────────

function getMoonPhase(date: Date): { name: string; emoji: string } {
  // Known new moon: Jan 6, 2000
  const knownNewMoon = new Date("2000-01-06T18:14:00Z").getTime();
  const cycleMs = 29.530588853 * 24 * 60 * 60 * 1000;
  const elapsed = date.getTime() - knownNewMoon;
  const phase = ((elapsed % cycleMs) + cycleMs) % cycleMs;
  const fraction = phase / cycleMs;

  if (fraction < 0.033) return { name: "New Moon", emoji: "🌑" };
  if (fraction < 0.158) return { name: "Waxing Crescent", emoji: "🌒" };
  if (fraction < 0.283) return { name: "First Quarter", emoji: "🌓" };
  if (fraction < 0.408) return { name: "Waxing Gibbous", emoji: "🌔" };
  if (fraction < 0.533) return { name: "Full Moon", emoji: "🌕" };
  if (fraction < 0.658) return { name: "Waning Gibbous", emoji: "🌖" };
  if (fraction < 0.783) return { name: "Last Quarter", emoji: "🌗" };
  if (fraction < 0.908) return { name: "Waning Crescent", emoji: "🌘" };
  return { name: "New Moon", emoji: "🌑" };
}

function formatTime(isoString: string): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function SunArcSVG({
  sunrise,
  sunset,
  theme,
}: { sunrise: string; sunset: string; theme: Theme }) {
  const now = new Date();
  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs = new Date(sunset).getTime();
  const nowMs = now.getTime();

  // Progress: 0 at sunrise, 1 at sunset (clamped 0–1)
  let progress = 0;
  if (sunriseMs && sunsetMs && sunsetMs > sunriseMs) {
    progress = Math.max(
      0,
      Math.min(1, (nowMs - sunriseMs) / (sunsetMs - sunriseMs)),
    );
  }

  // Arc path: semicircle from left to right
  const W = 280;
  const H = 100;
  const cx = W / 2;
  const cy = H + 10;
  const rx = W / 2 - 10;
  const ry = H - 10;

  // Sun position on arc
  // angle goes from 180° (left) to 0° (right) as progress 0→1
  const angle = Math.PI - progress * Math.PI;
  const sunX = cx + rx * Math.cos(angle);
  const sunY = cy - ry * Math.sin(angle);

  const arcPath = `M ${cx - rx},${cy} A ${rx},${ry} 0 0,1 ${cx + rx},${cy}`;

  const isDarkTheme = theme === "dark";
  const trackColor = isDarkTheme
    ? "oklch(0.3 0.04 220 / 0.5)"
    : "oklch(0.88 0.04 220 / 0.6)";
  const progressColor = isDarkTheme
    ? "oklch(0.85 0.18 75)"
    : "oklch(0.7 0.2 60)";
  const sunGlow = isDarkTheme
    ? "oklch(0.95 0.14 70 / 0.8)"
    : "oklch(0.85 0.22 65 / 0.9)";
  const sunColor = isDarkTheme ? "oklch(0.95 0.16 70)" : "oklch(0.75 0.22 60)";

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 20}`}
      className="w-full"
      style={{ overflow: "visible", maxHeight: 120 }}
      role="img"
      aria-label="Sun position arc"
    >
      <defs>
        <filter id="sun-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={progressColor} stopOpacity="0.2" />
          <stop
            offset={`${progress * 100}%`}
            stopColor={progressColor}
            stopOpacity="0.9"
          />
          <stop offset="100%" stopColor={trackColor} stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Track arc */}
      <path
        d={arcPath}
        fill="none"
        stroke={trackColor}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Progress arc */}
      <motion.path
        d={arcPath}
        fill="none"
        stroke="url(#arc-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          pathLength: 0,
        }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: progress }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.9 }}
      />

      {/* Sun dot */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        style={{ transformOrigin: `${sunX}px ${sunY}px` }}
      >
        <circle
          cx={sunX}
          cy={sunY}
          r="10"
          fill={sunColor}
          filter="url(#sun-glow)"
        />
        <circle cx={sunX} cy={sunY} r="6" fill={sunGlow} />
      </motion.g>

      {/* Horizon line */}
      <line
        x1={cx - rx - 5}
        y1={cy}
        x2={cx + rx + 5}
        y2={cy}
        stroke={trackColor}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

function SunMoonCard({ weather, theme }: { weather: Weather; theme: Theme }) {
  const tk = T[theme];
  const moonPhase = getMoonPhase(new Date());
  const sunriseFormatted = formatTime(weather.sunrise);
  const sunsetFormatted = formatTime(weather.sunset);

  return (
    <motion.div
      data-ocid="sunmoon.card"
      className="glass-card rounded-2xl p-5 mt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.85, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sun style={{ width: 16, height: 16, color: "oklch(0.85 0.18 75)" }} />
        <span
          className="text-xs font-sora uppercase tracking-widest"
          style={{ color: tk.iconMuted }}
        >
          Sun & Moon
        </span>
      </div>

      {/* Arc */}
      <div className="px-2 mb-2">
        <SunArcSVG
          sunrise={weather.sunrise}
          sunset={weather.sunset}
          theme={theme}
        />
      </div>

      {/* Sunrise / Sunset */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 18 }}>🌅</span>
          <div>
            <p
              className="text-[10px] font-sora uppercase tracking-widest"
              style={{ color: tk.textSubtle }}
            >
              Sunrise
            </p>
            <p
              className="font-fraunces text-lg font-semibold"
              style={{ color: tk.text }}
            >
              {sunriseFormatted}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div>
            <p
              className="text-[10px] font-sora uppercase tracking-widest"
              style={{ color: tk.textSubtle }}
            >
              Sunset
            </p>
            <p
              className="font-fraunces text-lg font-semibold"
              style={{ color: tk.text }}
            >
              {sunsetFormatted}
            </p>
          </div>
          <span style={{ fontSize: 18 }}>🌇</span>
        </div>
      </div>

      {/* Moon phase */}
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{
          background:
            theme === "dark"
              ? "oklch(0.18 0.06 260 / 0.5)"
              : "oklch(0.94 0.04 260 / 0.5)",
          border:
            theme === "dark"
              ? "1px solid oklch(0.38 0.1 260 / 0.3)"
              : "1px solid oklch(0.76 0.08 260 / 0.4)",
        }}
      >
        <span style={{ fontSize: 28 }}>{moonPhase.emoji}</span>
        <div>
          <p
            className="font-sora font-semibold text-sm"
            style={{ color: tk.text }}
          >
            {moonPhase.name}
          </p>
          <p
            className="font-sora text-xs mt-0.5"
            style={{ color: tk.textSubtle }}
          >
            Current moon phase
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── HistoricalTriviaCard ─────────────────────────────────────────────────────

function useHistoricalData(lat: number, lon: number) {
  const [data, setData] = useState<{
    diff: number;
    direction: "warmer" | "cooler" | "same";
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    const yyyy = lastYear.getFullYear();
    const mm = String(lastYear.getMonth() + 1).padStart(2, "0");
    const dd = String(lastYear.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    setLoading(true);
    setError(false);
    setData(null);

    // Also get current day average for comparison
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    Promise.all([
      fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
      ),
      fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${todayFormatted}&end_date=${todayFormatted}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
      ),
    ])
      .then(([lastYearRes, todayRes]) =>
        Promise.all([lastYearRes.json(), todayRes.json()]),
      )
      .then(([lastYearData, todayData]) => {
        if (cancelled) return;
        const lyMax = lastYearData?.daily?.temperature_2m_max?.[0];
        const lyMin = lastYearData?.daily?.temperature_2m_min?.[0];
        const tdMax = todayData?.daily?.temperature_2m_max?.[0];
        const tdMin = todayData?.daily?.temperature_2m_min?.[0];

        if (lyMax == null || lyMin == null || tdMax == null || tdMin == null) {
          setError(true);
          return;
        }

        const lyAvg = (lyMax + lyMin) / 2;
        const todayAvg = (tdMax + tdMin) / 2;
        const diff = Math.abs(todayAvg - lyAvg);
        const direction: "warmer" | "cooler" | "same" =
          diff < 0.5 ? "same" : todayAvg > lyAvg ? "warmer" : "cooler";

        setData({ diff: Math.round(diff * 10) / 10, direction });
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return { data, loading, error };
}

function HistoricalTriviaCard({
  weather,
  theme,
}: { weather: Weather; theme: Theme }) {
  const tk = T[theme];
  const { data, loading, error } = useHistoricalData(weather.lat, weather.lon);

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const dateLabel = today.toLocaleDateString("en-IN", options);

  return (
    <motion.div
      data-ocid="history.card"
      className="glass-card rounded-2xl p-5 mt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: 16 }}>📅</span>
        <span
          className="text-xs font-sora uppercase tracking-widest"
          style={{ color: tk.iconMuted }}
        >
          On This Day
        </span>
      </div>

      {loading && (
        <div
          className="flex items-center gap-3"
          data-ocid="history.loading_state"
        >
          <Loader2
            className="animate-spin"
            style={{ width: 18, height: 18, color: tk.iconMuted }}
          />
          <span className="text-sm font-sora" style={{ color: tk.textSubtle }}>
            Loading historical data…
          </span>
        </div>
      )}

      {error && !loading && (
        <p
          className="text-sm font-sora"
          style={{ color: tk.textSubtle }}
          data-ocid="history.error_state"
        >
          Historical data not available for this location.
        </p>
      )}

      {data && !loading && (
        <div className="flex items-start gap-4">
          <span style={{ fontSize: 32 }}>
            {data.direction === "warmer"
              ? "🔥"
              : data.direction === "cooler"
                ? "🧊"
                : "🌡️"}
          </span>
          <div>
            <p
              className="font-fraunces text-lg font-semibold leading-snug"
              style={{ color: tk.text }}
            >
              {data.direction === "same"
                ? "Same temperature as last year"
                : `${data.diff}°C ${data.direction === "warmer" ? "warmer" : "cooler"} than last year`}
            </p>
            <p
              className="font-sora text-xs mt-1"
              style={{ color: tk.textSubtle }}
            >
              On {dateLabel} last year, temperatures were
              {data.direction === "same"
                ? " about the same"
                : ` ${data.diff}°C ${data.direction === "warmer" ? "lower" : "higher"}`}
              .
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── WeatherDashboard ─────────────────────────────────────────────────────────

// ─── StreakCard ───────────────────────────────────────────────────────────────

function StreakCard({ streak, theme }: { streak: number; theme: Theme }) {
  const tk = T[theme];
  if (streak < 1) return null;

  const getMilestoneBadge = (
    s: number,
  ): { label: string; emoji: string } | null => {
    if (s >= 30) return { label: "Diamond", emoji: "💎" };
    if (s >= 14) return { label: "Gold", emoji: "🥇" };
    if (s >= 7) return { label: "Silver", emoji: "🥈" };
    if (s >= 3) return { label: "Bronze", emoji: "🥉" };
    return null;
  };

  const badge = getMilestoneBadge(streak);

  return (
    <motion.div
      data-ocid="streak.card"
      className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3"
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      style={{
        background:
          theme === "dark"
            ? "oklch(0.24 0.08 45 / 0.6)"
            : "oklch(0.97 0.04 55 / 0.8)",
        border:
          theme === "dark"
            ? "1px solid oklch(0.55 0.18 60 / 0.4)"
            : "1px solid oklch(0.82 0.12 60 / 0.5)",
      }}
    >
      <motion.span
        style={{ fontSize: 22 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        🔥
      </motion.span>
      <div className="flex-1">
        <p
          className="font-fraunces font-semibold text-base leading-none"
          style={{
            color:
              theme === "dark" ? "oklch(0.92 0.1 65)" : "oklch(0.45 0.18 50)",
          }}
        >
          {streak} day streak
        </p>
        <p
          className="font-sora text-xs mt-0.5"
          style={{ color: tk.textSubtle }}
        >
          Keep it up — check in daily!
        </p>
      </div>
      {badge && (
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full font-sora text-xs font-semibold"
          style={{
            background:
              theme === "dark"
                ? "oklch(0.3 0.1 60 / 0.7)"
                : "oklch(0.94 0.06 60 / 0.8)",
            color:
              theme === "dark" ? "oklch(0.88 0.12 65)" : "oklch(0.42 0.16 55)",
            border:
              theme === "dark"
                ? "1px solid oklch(0.6 0.16 60 / 0.4)"
                : "1px solid oklch(0.75 0.12 60 / 0.4)",
          }}
        >
          <span>{badge.emoji}</span>
          <span>{badge.label}</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── DewPointCard ─────────────────────────────────────────────────────────────

function getDewPointLabel(dp: number): { label: string; color: string } {
  if (dp < 10)
    return { label: "Dry & Comfortable", color: "oklch(0.72 0.22 145)" };
  if (dp < 16) return { label: "Comfortable", color: "oklch(0.72 0.18 165)" };
  if (dp < 21) return { label: "Humid", color: "oklch(0.75 0.22 55)" };
  return { label: "Very Muggy", color: "oklch(0.62 0.24 25)" };
}

function DewPointCard({ dewPoint, theme }: { dewPoint: number; theme: Theme }) {
  const tk = T[theme];
  const dpInfo = getDewPointLabel(dewPoint);

  return (
    <motion.div
      data-ocid="dewpoint.card"
      className="glass-card rounded-2xl p-4 flex flex-col gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2" style={{ color: tk.iconMuted }}>
        <Droplets style={{ width: 16, height: 16 }} />
        <span className="text-xs font-sora uppercase tracking-widest">
          Dew Point
        </span>
      </div>
      <div
        className="text-xl font-fraunces font-semibold"
        style={{ color: tk.text }}
      >
        {Math.round(dewPoint)}°C
      </div>
      <span
        className="text-xs font-sora font-semibold"
        style={{ color: dpInfo.color }}
      >
        {dpInfo.label}
      </span>
    </motion.div>
  );
}

// ─── PressureCard ─────────────────────────────────────────────────────────────

function getPressureTrend(pressureHourly: number[]): {
  trend: "rising" | "falling" | "steady";
  diff: number;
  icon: string;
  label: string;
  color: string;
  warning?: string;
} {
  if (pressureHourly.length < 4) {
    return {
      trend: "steady",
      diff: 0,
      icon: "→",
      label: "Steady",
      color: "oklch(0.72 0.18 200)",
    };
  }

  const now = new Date();
  const currentHour = now.getHours();
  const clampedHour = Math.min(currentHour, pressureHourly.length - 1);
  const threeHoursAgo = Math.max(0, clampedHour - 3);

  const current = pressureHourly[clampedHour];
  const previous = pressureHourly[threeHoursAgo];
  const diff = current - previous;

  if (diff > 2) {
    return {
      trend: "rising",
      diff: Math.abs(diff),
      icon: "↑",
      label: "Rising",
      color: "oklch(0.72 0.22 145)",
    };
  }
  if (diff < -2) {
    const warning = Math.abs(diff) > 4 ? "Storm may be approaching" : undefined;
    return {
      trend: "falling",
      diff: Math.abs(diff),
      icon: "↓",
      label: "Falling",
      color: "oklch(0.75 0.22 55)",
      warning,
    };
  }
  return {
    trend: "steady",
    diff: Math.abs(diff),
    icon: "→",
    label: "Steady",
    color: "oklch(0.72 0.18 200)",
  };
}

function PressureCard({
  pressureHourly,
  theme,
}: {
  pressureHourly: number[];
  theme: Theme;
}) {
  const tk = T[theme];
  const now = new Date();
  const clampedHour = Math.min(now.getHours(), pressureHourly.length - 1);
  const currentPressure =
    pressureHourly[clampedHour] ?? pressureHourly[0] ?? 1013;
  const trendInfo = getPressureTrend(pressureHourly);

  return (
    <motion.div
      data-ocid="pressure.card"
      className="glass-card rounded-2xl p-5 mt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.68, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge style={{ width: 16, height: 16, color: tk.iconMuted }} />
          <span
            className="text-xs font-sora uppercase tracking-widest"
            style={{ color: tk.iconMuted }}
          >
            Barometric Pressure
          </span>
        </div>
        <span
          className="text-xs font-sora font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: `color-mix(in oklch, ${trendInfo.color} 15%, transparent)`,
            color: trendInfo.color,
            border: `1px solid color-mix(in oklch, ${trendInfo.color} 35%, transparent)`,
          }}
        >
          {trendInfo.icon} {trendInfo.label}
        </span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span
          className="font-fraunces font-bold leading-none"
          style={{
            fontSize: "2.5rem",
            color: trendInfo.color,
            filter: `drop-shadow(0 0 10px color-mix(in oklch, ${trendInfo.color} 40%, transparent))`,
          }}
        >
          {Math.round(currentPressure)}
        </span>
        <span
          className="font-fraunces mb-1"
          style={{ fontSize: "1.1rem", color: tk.textMuted }}
        >
          hPa
        </span>
      </div>
      {trendInfo.warning && (
        <motion.div
          className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl"
          style={{
            background:
              theme === "dark"
                ? "oklch(0.26 0.08 40 / 0.5)"
                : "oklch(0.97 0.04 55 / 0.7)",
            border:
              theme === "dark"
                ? "1px solid oklch(0.55 0.16 55 / 0.4)"
                : "1px solid oklch(0.8 0.12 55 / 0.5)",
            color:
              theme === "dark" ? "oklch(0.88 0.1 60)" : "oklch(0.42 0.16 50)",
          }}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.75 }}
        >
          <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span className="font-sora text-xs">{trendInfo.warning}</span>
        </motion.div>
      )}
      <p className="font-sora text-xs mt-2" style={{ color: tk.textSubtle }}>
        {trendInfo.trend === "falling"
          ? `Dropped ${trendInfo.diff.toFixed(1)} hPa in last 3h — weather may worsen`
          : trendInfo.trend === "rising"
            ? `Rose ${trendInfo.diff.toFixed(1)} hPa in last 3h — clearing up`
            : "Pressure stable — settled weather likely"}
      </p>
    </motion.div>
  );
}

// ─── CameraButton ─────────────────────────────────────────────────────────────

function CameraButton({ weather, theme }: { weather: Weather; theme: Theme }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        data-ocid="weather.camera_button"
        onClick={() => setOpen(true)}
        title="Take photo with weather overlay"
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            theme === "dark"
              ? "oklch(0.25 0.06 280 / 0.6)"
              : "oklch(0.9 0.04 280 / 0.8)",
          border:
            theme === "dark"
              ? "1px solid oklch(0.42 0.12 280 / 0.4)"
              : "1px solid oklch(0.72 0.08 280 / 0.5)",
          cursor: "pointer",
          color:
            theme === "dark" ? "oklch(0.72 0.14 280)" : "oklch(0.38 0.12 280)",
          backdropFilter: "blur(8px)",
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}
        aria-label="Camera weather overlay"
      >
        <Camera style={{ width: 16, height: 16 }} />
      </button>
      <AnimatePresence>
        {open && (
          <CameraOverlay
            weather={weather}
            theme={theme}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── ShareButton ──────────────────────────────────────────────────────────────

function ShareButton({ weather, theme }: { weather: Weather; theme: Theme }) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 450;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const isDarkTheme = theme === "dark";
      const condition = getWeatherCondition(weather.weatherCode);
      const code = Number(weather.weatherCode);

      // Background gradient based on weather
      let grad: CanvasGradient;
      if (code === 0) {
        grad = ctx.createLinearGradient(0, 0, 800, 450);
        grad.addColorStop(0, isDarkTheme ? "#0d1b2a" : "#87ceeb");
        grad.addColorStop(1, isDarkTheme ? "#1a3a5c" : "#ffd700");
      } else if ((code >= 61 && code <= 65) || code === 95) {
        grad = ctx.createLinearGradient(0, 0, 800, 450);
        grad.addColorStop(0, isDarkTheme ? "#0a0f1a" : "#4a6fa5");
        grad.addColorStop(1, isDarkTheme ? "#1a2540" : "#6b8db8");
      } else if (code >= 71 && code <= 75) {
        grad = ctx.createLinearGradient(0, 0, 800, 450);
        grad.addColorStop(0, isDarkTheme ? "#0f1520" : "#b0c8e8");
        grad.addColorStop(1, isDarkTheme ? "#1a2535" : "#d8e8f5");
      } else {
        grad = ctx.createLinearGradient(0, 0, 800, 450);
        grad.addColorStop(0, isDarkTheme ? "#0d1520" : "#c8d8e8");
        grad.addColorStop(1, isDarkTheme ? "#1a2540" : "#e8f0f8");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 450);

      // Decorative orb
      const orbGrad = ctx.createRadialGradient(650, 80, 0, 650, 80, 200);
      orbGrad.addColorStop(
        0,
        isDarkTheme ? "rgba(80,150,255,0.25)" : "rgba(255,200,50,0.3)",
      );
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.fillRect(0, 0, 800, 450);

      // Card overlay
      ctx.fillStyle = isDarkTheme
        ? "rgba(255,255,255,0.05)"
        : "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.roundRect(32, 32, 736, 386, 24);
      ctx.fill();
      ctx.strokeStyle = isDarkTheme
        ? "rgba(255,255,255,0.12)"
        : "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Temperature
      ctx.fillStyle = isDarkTheme ? "#e8f0ff" : "#1a2840";
      ctx.font = "bold 120px Georgia, serif";
      ctx.fillText(`${Math.round(weather.currentTemp)}°`, 60, 220);

      // Condition
      ctx.fillStyle = isDarkTheme
        ? "rgba(220,235,255,0.75)"
        : "rgba(30,50,80,0.65)";
      ctx.font = "28px Georgia, serif";
      ctx.fillText(condition, 60, 270);

      // City
      ctx.fillStyle = isDarkTheme ? "#a0b8d8" : "#3a5878";
      ctx.font = "20px sans-serif";
      ctx.fillText(`📍 ${weather.cityName}`, 60, 310);

      // Stats row
      ctx.fillStyle = isDarkTheme
        ? "rgba(180,210,255,0.7)"
        : "rgba(30,50,80,0.7)";
      ctx.font = "16px sans-serif";
      ctx.fillText(
        `↑ ${Math.round(weather.tempMax)}°  ↓ ${Math.round(weather.tempMin)}°  💧 ${weather.humidity}%  💨 ${Math.round(weather.windSpeed)} km/h`,
        60,
        360,
      );

      // Watermark
      ctx.fillStyle = isDarkTheme
        ? "rgba(100,150,220,0.6)"
        : "rgba(30,60,120,0.5)";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("TRUE TEMP", 748, 400);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = isDarkTheme
        ? "rgba(100,150,220,0.45)"
        : "rgba(30,60,120,0.4)";
      ctx.fillText("Real Weather. Real India.", 748, 420);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "truetemp-weather.png", {
          type: "image/png",
        });

        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            title: `Weather in ${weather.cityName}`,
            text: `${Math.round(weather.currentTemp)}°C, ${condition} — ${weather.cityName}`,
            files: [file],
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "truetemp-weather.png";
          a.click();
          URL.revokeObjectURL(url);
        }
        setSharing(false);
      }, "image/png");
    } catch {
      setSharing(false);
    }
  };

  return (
    <button
      type="button"
      data-ocid="weather.share_button"
      onClick={handleShare}
      disabled={sharing}
      title="Share weather graphic"
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          theme === "dark"
            ? "oklch(0.25 0.08 220 / 0.6)"
            : "oklch(0.9 0.05 220 / 0.8)",
        border:
          theme === "dark"
            ? "1px solid oklch(0.45 0.14 220 / 0.4)"
            : "1px solid oklch(0.72 0.1 220 / 0.5)",
        cursor: sharing ? "wait" : "pointer",
        color:
          theme === "dark" ? "oklch(0.75 0.18 220)" : "oklch(0.38 0.14 220)",
        backdropFilter: "blur(8px)",
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
      aria-label="Share weather graphic"
    >
      {sharing ? (
        <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
      ) : (
        <Share2 style={{ width: 16, height: 16 }} />
      )}
    </button>
  );
}

// ─── CameraOverlay ────────────────────────────────────────────────────────────

function CameraOverlay({
  weather,
  onClose,
}: { weather: Weather; theme: Theme; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (!active) {
          for (const t of stream.getTracks()) {
            t.stop();
          }
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {
        if (active) setCameraError("Camera access denied or not available.");
      });
    return () => {
      active = false;
      for (const t of streamRef.current?.getTracks() ?? []) {
        t.stop();
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const condition = getWeatherCondition(weather.weatherCode);
    const badgeW = 220;
    const badgeH = 72;
    const bx = canvas.width - badgeW - 16;
    const by = canvas.height - badgeH - 16;

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.roundRect(bx, by, badgeW, badgeH, 14);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(`${Math.round(weather.currentTemp)}°C`, bx + 14, by + 34);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.fillText(condition, bx + 14, by + 54);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText(`📍 ${weather.cityName}`, bx + 14, by + 68);

    setCaptured(canvas.toDataURL("image/png"));
    haptic(50);
  };

  const handleSave = () => {
    if (!captured) return;
    const a = document.createElement("a");
    a.href = captured;
    a.download = "truetemp-photo.png";
    a.click();
  };

  const handleShare = async () => {
    if (!captured) return;
    try {
      const res = await fetch(captured);
      const blob = await res.blob();
      const file = new File([blob], "truetemp-photo.png", {
        type: "image/png",
      });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Weather Photo" });
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      data-ocid="camera.modal"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(12px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        className="absolute top-4 right-4 z-10"
        onClick={onClose}
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          cursor: "pointer",
        }}
        data-ocid="camera.close_button"
        aria-label="Close camera"
      >
        <X style={{ width: 18, height: 18 }} />
      </button>

      <div
        className="relative w-full max-w-lg mx-4"
        style={{ maxHeight: "70vh" }}
      >
        {cameraError ? (
          <div
            className="flex flex-col items-center gap-3 p-8 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <Camera
              style={{ width: 48, height: 48, color: "rgba(255,255,255,0.5)" }}
            />
            <p className="text-white font-sora text-sm text-center">
              {cameraError}
            </p>
          </div>
        ) : captured ? (
          <img
            src={captured}
            alt="Snapshot with weather data"
            className="w-full rounded-2xl"
            style={{ maxHeight: "60vh", objectFit: "contain" }}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-2xl"
            style={{
              maxHeight: "60vh",
              objectFit: "cover",
              background: "#000",
            }}
          />
        )}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <div className="flex items-center gap-3 mt-6">
        {!captured ? (
          <button
            type="button"
            data-ocid="camera.capture_button"
            onClick={handleCapture}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-sora text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.4)",
              color: "white",
              cursor: "pointer",
            }}
            aria-label="Capture photo"
          >
            <Camera style={{ width: 18, height: 18 }} />
            Capture
          </button>
        ) : (
          <>
            <button
              type="button"
              data-ocid="camera.save_button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sora text-sm font-semibold"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                cursor: "pointer",
              }}
            >
              💾 Save
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sora text-sm font-semibold"
              style={{
                background: "rgba(100,180,255,0.2)",
                border: "1px solid rgba(100,180,255,0.4)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <Share2 style={{ width: 16, height: 16 }} /> Share
            </button>
            <button
              type="button"
              onClick={() => setCaptured(null)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sora text-sm"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
              }}
            >
              Retake
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── EasterEggLayer ───────────────────────────────────────────────────────────

function EasterEggLayer({ temp }: { temp: number }) {
  const [snowmanSeen] = useState(() => {
    try {
      return !!localStorage.getItem("truetemp_egg_snowman");
    } catch {
      return false;
    }
  });
  const [sunSeen] = useState(() => {
    try {
      return !!localStorage.getItem("truetemp_egg_sun");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (temp <= 0 && !snowmanSeen) {
      try {
        localStorage.setItem("truetemp_egg_snowman", "1");
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        toast("☃️ Easter egg discovered! Freezing cold today!", {
          duration: 4000,
        });
      }, 1000);
    }
    if (temp >= 40 && !sunSeen) {
      try {
        localStorage.setItem("truetemp_egg_sun", "1");
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        toast("🌡️ Easter egg discovered! Scorching heat today!", {
          duration: 4000,
        });
      }, 1000);
    }
  }, [temp, snowmanSeen, sunSeen]);

  return (
    <>
      {temp <= 0 && (
        <div
          className="pointer-events-none fixed bottom-24 right-6 z-50"
          aria-hidden
          style={{
            fontSize: 42,
            animation: "egg-bounce 1.8s ease-in-out infinite",
          }}
        >
          ☃️
        </div>
      )}
      {temp >= 40 && (
        <div
          className="pointer-events-none fixed bottom-24 left-6 z-50"
          aria-hidden
          style={{
            fontSize: 42,
            animation: "egg-melt 2.5s ease-in-out infinite",
            filter: "drop-shadow(0 4px 12px rgba(255,120,0,0.6))",
          }}
        >
          🌡️
        </div>
      )}
    </>
  );
}

function WeatherDetail({
  icon,
  label,
  value,
  delay = 0,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay?: number;
  theme: Theme;
}) {
  const tk = T[theme];
  return (
    <motion.div
      className="glass-card rounded-2xl p-4 flex flex-col gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2" style={{ color: tk.iconMuted }}>
        {icon}
        <span className="text-xs font-sora uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div
        className="text-xl font-fraunces font-semibold"
        style={{ color: tk.text }}
      >
        {value}
      </div>
    </motion.div>
  );
}

function WeatherDashboard({
  weather,
  theme,
}: { weather: Weather; theme: Theme }) {
  const condition = getWeatherCondition(weather.weatherCode);
  const tk = T[theme];

  return (
    <motion.div
      className="w-full max-w-2xl"
      data-ocid="weather.card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-card rounded-3xl p-8 mb-4 relative overflow-hidden">
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.45 0.2 220 / 0.15) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
        <div className="relative z-10">
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <MapPin style={{ width: 18, height: 18, color: tk.mapPin }} />
              <span
                className="font-fraunces text-2xl font-semibold"
                style={{ color: tk.text }}
              >
                {weather.cityName}
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: tk.pillBg, border: tk.pillBorder }}
            >
              <WeatherIcon code={weather.weatherCode} size={18} />
              <span
                className="text-sm font-sora"
                style={{ color: tk.pillText }}
              >
                {condition}
              </span>
            </div>
          </motion.div>
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
                  color:
                    theme === "dark"
                      ? "oklch(0.92 0.04 200)"
                      : "oklch(0.3 0.1 240)",
                  fontWeight: 700,
                  transition: "color 0.4s ease",
                }}
              >
                {Math.round(weather.currentTemp)}
              </span>
              <span
                className="font-fraunces font-light mt-4"
                style={{
                  fontSize: "clamp(2rem, 6vw, 3.5rem)",
                  color: tk.textMuted,
                  transition: "color 0.4s ease",
                }}
              >
                °C
              </span>
            </div>
            <div
              className="flex flex-col gap-1 mt-6 ml-2"
              style={{ color: tk.textMuted }}
            >
              <span className="text-sm font-sora">
                ↑ {Math.round(weather.tempMax)}°
              </span>
              <span className="text-sm font-sora">
                ↓ {Math.round(weather.tempMin)}°
              </span>
            </div>
          </motion.div>
          <motion.p
            className="text-sm font-sora"
            style={{ color: tk.textMuted }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Feels like{" "}
            <span style={{ color: tk.feelsLike }}>
              {Math.round(weather.feelsLike)}°C
            </span>
          </motion.p>
          <motion.div
            className="flex items-center gap-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <ShareButton weather={weather} theme={theme} />
            <CameraButton weather={weather} theme={theme} />
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <WeatherDetail
          icon={<Droplets style={{ width: 16, height: 16 }} />}
          label="Humidity"
          value={`${weather.humidity}%`}
          delay={0.3}
          theme={theme}
        />
        <WeatherDetail
          icon={<Wind style={{ width: 16, height: 16 }} />}
          label="Wind"
          value={`${Math.round(weather.windSpeed)} km/h`}
          delay={0.38}
          theme={theme}
        />
        <WeatherDetail
          icon={<Thermometer style={{ width: 16, height: 16 }} />}
          label="Max"
          value={`${Math.round(weather.tempMax)}°C`}
          delay={0.46}
          theme={theme}
        />
        <WeatherDetail
          icon={<Eye style={{ width: 16, height: 16 }} />}
          label="Min"
          value={`${Math.round(weather.tempMin)}°C`}
          delay={0.54}
          theme={theme}
        />
        <DewPointCard dewPoint={weather.dewPoint} theme={theme} />
      </div>

      <WeatherAlertBanner
        weatherCode={weather.weatherCode}
        uvIndex={weather.uvIndex}
        currentTemp={weather.currentTemp}
        aqi={weather.aqi}
        theme={theme}
      />

      <HourlyForecastCard hourly={weather.hourly} theme={theme} />
      <SevenDayForecastCard daily={weather.daily} theme={theme} />
      <UVCard uvIndex={weather.uvIndex} theme={theme} />
      <AQICard aqi={weather.aqi} theme={theme} />
      <PressureCard pressureHourly={weather.pressureHourly} theme={theme} />
      <LocationCard
        lat={weather.lat}
        lon={weather.lon}
        cityName={weather.cityName}
        theme={theme}
      />
      <ClothingSuggestionsCard weather={weather} theme={theme} />
      <CommuteForecastCard weather={weather} theme={theme} />
      <SunMoonCard weather={weather} theme={theme} />
      <HistoricalTriviaCard weather={weather} theme={theme} />

      <motion.p
        className="text-center text-xs mt-4 font-sora tracking-wider uppercase"
        style={{ color: tk.textSubtle }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        {weather.timezone}
      </motion.p>
    </motion.div>
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────

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
            TRUE TEMP
          </motion.h1>
          <motion.p
            className="text-sm mt-2 font-sora tracking-[0.25em] uppercase"
            style={{ color: "oklch(0.6 0.08 220)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Real Weather. Real India.
          </motion.p>
        </div>
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

// ─── WeatherApp ───────────────────────────────────────────────────────────────

function WeatherApp() {
  const [showLoading, setShowLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("Mumbai");
  const [activeCity, setActiveCity] = useState("Mumbai");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [theme, toggleTheme] = useTheme();
  const [briefingsEnabled, setBriefingsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("truetemp-briefings") === "true";
    } catch {
      return false;
    }
  });

  const tk = T[theme];

  const streak = useStreak();
  const isOffline = useOfflineMode();

  const {
    data: weather,
    isLoading,
    isError,
    error,
  } = useGetWeather(activeCity);

  // Load cached weather when offline
  const cachedData = isOffline
    ? getCachedWeather()
    : { weather: null, time: null };
  const displayWeather = weather || (isOffline ? cachedData.weather : null);

  const displayIsLoading = isLoading && !displayWeather;

  // Morning briefing scheduler
  useEffect(() => {
    if (!briefingsEnabled) return;
    let lastFired: string | null = null;

    const interval = setInterval(() => {
      if (!displayWeather) return;
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const key = `${h}:${m < 10 ? `0${m}` : m}`;
      if ((h === 9 && m === 0) || (h === 15 && m === 0)) {
        if (lastFired === key) return;
        lastFired = key;
        const fireNotification = () => {
          const label = h === 9 ? "Morning" : "Afternoon";
          new Notification(`TRUE TEMP — ${label} Briefing`, {
            body: `${displayWeather.cityName}: High ${Math.round(displayWeather.tempMax)}°C / Low ${Math.round(displayWeather.tempMin)}°C. ${getWeatherCondition(displayWeather.weatherCode)}.`,
            icon: "/assets/generated/truetemp-icon.png",
          });
        };
        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            fireNotification();
          } else if (Notification.permission === "default") {
            Notification.requestPermission().then((perm) => {
              if (perm === "granted") fireNotification();
            });
          }
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [briefingsEnabled, displayWeather]);

  const handleBriefingsToggle = () => {
    const next = !briefingsEnabled;
    setBriefingsEnabled(next);
    try {
      localStorage.setItem("truetemp-briefings", String(next));
    } catch {
      // ignore
    }
    if (
      next &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      setLocationError(null);
      setActiveCity(trimmed);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          if (!res.ok) throw new Error("Reverse geocoding failed");
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            data.address?.state;
          if (!city) throw new Error("Could not determine city from location.");
          setSearchInput(city);
          setActiveCity(city);
        } catch (err) {
          setLocationError(
            err instanceof Error ? err.message : "Could not get location.",
          );
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setLocationError(
            "Location access denied. Please allow location permission in your browser settings.",
          );
        } else if (err.code === 2) {
          setLocationError(
            "Location unavailable. Please check your device's location settings are enabled.",
          );
        } else if (err.code === 3) {
          setLocationError(
            "Location request timed out. Try again or search manually.",
          );
        } else {
          setLocationError(
            "Could not get your location. Try searching manually.",
          );
        }
      },
      { timeout: 15000, maximumAge: 60000, enableHighAccuracy: false },
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col relative${theme === "light" ? " light-theme" : ""}`}
      style={{ fontFamily: "Sora, sans-serif" }}
    >
      {/* Static backgrounds */}
      <div
        className="absolute inset-0 weather-bg"
        style={{
          opacity: theme === "dark" ? 1 : 0,
          transition: "opacity 0.5s ease",
          zIndex: 0,
        }}
      />
      <div
        className="absolute inset-0 weather-bg-light"
        style={{
          opacity: theme === "light" ? 1 : 0,
          transition: "opacity 0.5s ease",
          zIndex: 0,
        }}
      />

      {/* Weather animation layer */}
      {displayWeather && !showLoading && (
        <WeatherAnimation code={displayWeather.weatherCode} theme={theme} />
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <motion.button
          data-ocid="theme.toggle"
          onClick={toggleTheme}
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          className="fixed z-[100] flex items-center justify-center rounded-full"
          style={{
            top: "1rem",
            right: "1rem",
            width: 42,
            height: 42,
            background: tk.toggleBg,
            border: tk.toggleBorder,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: tk.toggleColor,
            cursor: "pointer",
            boxShadow:
              theme === "dark"
                ? "0 4px 20px oklch(0.05 0.02 265 / 0.5)"
                : "0 4px 20px oklch(0.7 0.08 220 / 0.25)",
            transition: "all 0.25s ease",
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          <AnimatePresence mode="wait">
            {theme === "dark" ? (
              <motion.span
                key="sun"
                initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex" }}
              >
                <Sun style={{ width: 18, height: 18 }} />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ opacity: 0, rotate: 30, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -30, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex" }}
              >
                <Moon style={{ width: 18, height: 18 }} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Daily Briefings toggle */}
        <motion.button
          data-ocid="briefing.toggle"
          onClick={handleBriefingsToggle}
          title={
            briefingsEnabled
              ? "Disable daily briefings"
              : "Enable daily briefings at 9 AM & 3 PM"
          }
          className="fixed z-[100] flex items-center justify-center rounded-full"
          style={{
            top: "1rem",
            right: "4.5rem",
            width: 42,
            height: 42,
            background: briefingsEnabled
              ? theme === "dark"
                ? "oklch(0.28 0.12 145 / 0.7)"
                : "oklch(0.88 0.1 145 / 0.85)"
              : tk.toggleBg,
            border: briefingsEnabled
              ? "1px solid oklch(0.55 0.18 145 / 0.5)"
              : tk.toggleBorder,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: briefingsEnabled ? "oklch(0.72 0.22 145)" : tk.toggleColor,
            cursor: "pointer",
            boxShadow: briefingsEnabled
              ? "0 4px 20px oklch(0.55 0.18 145 / 0.3)"
              : theme === "dark"
                ? "0 4px 20px oklch(0.05 0.02 265 / 0.5)"
                : "0 4px 20px oklch(0.7 0.08 220 / 0.25)",
            transition: "all 0.25s ease",
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label={
            briefingsEnabled
              ? "Disable daily briefings"
              : "Enable daily briefings"
          }
        >
          <span style={{ fontSize: 18 }}>🔔</span>
        </motion.button>

        {/* Offline banner */}
        <AnimatePresence>
          {isOffline && (
            <motion.div
              className="fixed top-0 left-0 right-0 z-[90] flex items-center justify-center gap-2 px-4 py-2"
              style={{
                background: "oklch(0.75 0.2 60 / 0.95)",
                color: "oklch(0.2 0.08 55)",
                fontSize: 13,
                fontFamily: "Sora, sans-serif",
              }}
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WifiOff style={{ width: 14, height: 14, flexShrink: 0 }} />
              <span className="font-sora text-xs font-semibold">
                Offline
                {cachedData.time
                  ? ` — showing data last updated at ${new Date(cachedData.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : " — no internet connection"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AdBanner />

        <AnimatePresence>
          {showLoading && (
            <LoadingScreen onDone={() => setShowLoading(false)} />
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col items-center px-4 py-12">
          <motion.header
            className="mb-10 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1
              className="font-fraunces text-4xl font-bold flex items-center gap-2"
              style={{
                color:
                  theme === "dark"
                    ? "oklch(0.92 0.04 200)"
                    : "oklch(0.3 0.12 240)",
                transition: "color 0.4s ease",
              }}
            >
              TRUE TEMP
              {isOffline && (
                <span
                  title="Offline"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "oklch(0.75 0.2 60)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
              )}
            </h1>
            <p
              className="text-xs mt-1 tracking-[0.3em] uppercase font-sora"
              style={{ color: tk.textMuted }}
            >
              Real weather, right now
            </p>
          </motion.header>

          {streak > 0 && !showLoading && (
            <div className="w-full max-w-2xl mb-4">
              <StreakCard streak={streak} theme={theme} />
            </div>
          )}

          <motion.div
            className="w-full max-w-lg mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ width: 16, height: 16, color: tk.mapPin }}
                  />
                  <Input
                    data-ocid="search.search_input"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Enter city name…"
                    className="pl-9 h-12 font-sora text-sm"
                    style={{
                      background: tk.inputBg,
                      border: tk.inputBorder,
                      backdropFilter: "blur(10px)",
                      color: tk.inputText,
                    }}
                  />
                </div>
                <Button
                  data-ocid="search.submit_button"
                  type="submit"
                  disabled={isLoading || locating}
                  className="h-12 px-5 font-sora text-sm"
                  style={{
                    background: tk.searchBtn,
                    border: "none",
                    boxShadow: "0 4px 20px oklch(0.55 0.18 220 / 0.35)",
                    color: "oklch(0.97 0.01 220)",
                  }}
                >
                  <Search style={{ width: 16, height: 16, marginRight: 6 }} />
                  Search
                </Button>
                <Button
                  data-ocid="location.primary_button"
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating || isLoading}
                  className="h-12 px-4 font-sora text-sm shrink-0"
                  title="Use my current location"
                  style={{
                    background: locating ? tk.locBtnBgActive : tk.locBtnBg,
                    border: tk.locBtnBorder,
                    backdropFilter: "blur(10px)",
                    boxShadow: locating
                      ? "0 0 20px oklch(0.55 0.18 200 / 0.4)"
                      : "0 4px 16px oklch(0.55 0.18 200 / 0.2)",
                    color: tk.locBtnText,
                    transition: "all 0.2s ease",
                  }}
                >
                  {locating ? (
                    <Loader2
                      data-ocid="location.loading_state"
                      style={{ width: 16, height: 16 }}
                      className="animate-spin"
                    />
                  ) : (
                    <LocateFixed style={{ width: 16, height: 16 }} />
                  )}
                </Button>
              </div>
            </form>

            <AnimatePresence>
              {locationError && (
                <motion.p
                  data-ocid="location.error_state"
                  className="mt-2 text-xs font-sora px-1"
                  style={{ color: "oklch(0.68 0.18 25)" }}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {locationError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="w-full flex justify-center">
            <AnimatePresence mode="wait">
              {displayIsLoading && (
                <motion.div
                  key="loading"
                  data-ocid="weather.loading_state"
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    className="w-16 h-16 rounded-full border-2 animate-spin"
                    style={{
                      borderColor: tk.spinnerBorder,
                      borderTopColor: "transparent",
                    }}
                  />
                  <p
                    className="text-sm font-sora"
                    style={{ color: tk.textMuted }}
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
                      color: tk.errorIcon,
                    }}
                  />
                  <h3
                    className="font-fraunces text-xl mb-2"
                    style={{ color: tk.errorTitle }}
                  >
                    City not found
                  </h3>
                  <p
                    className="text-sm font-sora"
                    style={{ color: tk.textMuted }}
                  >
                    {error instanceof Error
                      ? error.message
                      : "We couldn't find weather data for that city. Check the name and try again."}
                  </p>
                </motion.div>
              )}

              {displayWeather && !isLoading && (
                <WeatherDashboard
                  key={displayWeather.cityName}
                  weather={displayWeather}
                  theme={theme}
                />
              )}
            </AnimatePresence>
          </div>
        </main>

        <footer className="py-4 text-center">
          <p className="text-xs font-sora" style={{ color: tk.textDim }}>
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: tk.footerLink }}
            >
              caffeine.ai
            </a>
          </p>
        </footer>

        <AdBannerBottom />
      </div>
      {/* Easter Egg Layer */}
      {displayWeather && <EasterEggLayer temp={displayWeather.currentTemp} />}
      <Toaster position="bottom-center" richColors />
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
