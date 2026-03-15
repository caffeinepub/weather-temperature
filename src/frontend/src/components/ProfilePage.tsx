import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type {
  AvatarId,
  Lang,
  SavedCity,
  ThemePref,
  UserProfile,
} from "@/hooks/useUserProfile";
import {
  Lock,
  LogOut,
  MapPin,
  Search,
  Star,
  Trash2,
  Trophy,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Theme tokens (matches App.tsx style) ────────────────────────────────────

type Theme = "dark" | "light";

const cardBg = (dark: boolean) =>
  dark ? "oklch(0.17 0.04 240 / 0.9)" : "oklch(0.98 0.01 240 / 0.95)";

const borderColor = (dark: boolean) =>
  dark ? "oklch(0.3 0.06 240 / 0.5)" : "oklch(0.85 0.04 240 / 0.6)";

const textPrimary = (dark: boolean) =>
  dark ? "oklch(0.93 0.04 240)" : "oklch(0.18 0.06 240)";

const textMuted = (dark: boolean) =>
  dark ? "oklch(0.6 0.06 240)" : "oklch(0.5 0.06 240)";

// ─── Pixel-art avatar SVGs ────────────────────────────────────────────────────

function SnowmanSVG({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    >
      {/* Head */}
      <rect x="5" y="1" width="6" height="5" fill="#e0f0ff" />
      <rect x="4" y="2" width="1" height="3" fill="#e0f0ff" />
      <rect x="11" y="2" width="1" height="3" fill="#e0f0ff" />
      {/* Eyes */}
      <rect x="6" y="2" width="1" height="1" fill="#1a2a4a" />
      <rect x="9" y="2" width="1" height="1" fill="#1a2a4a" />
      {/* Smile */}
      <rect x="6" y="4" width="1" height="1" fill="#1a2a4a" />
      <rect x="9" y="4" width="1" height="1" fill="#1a2a4a" />
      <rect x="7" y="5" width="2" height="1" fill="#1a2a4a" />
      {/* Body */}
      <rect x="4" y="7" width="8" height="7" fill="#c8e8ff" />
      <rect x="3" y="8" width="1" height="5" fill="#c8e8ff" />
      <rect x="12" y="8" width="1" height="5" fill="#c8e8ff" />
      {/* Buttons */}
      <rect x="7" y="9" width="2" height="1" fill="#1a2a4a" />
      <rect x="7" y="11" width="2" height="1" fill="#1a2a4a" />
      {/* Scarf */}
      <rect x="4" y="7" width="8" height="2" fill="#ff4444" />
    </svg>
  );
}

function SunSVG({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    >
      {/* Rays */}
      <rect x="7" y="0" width="2" height="2" fill="#ffcc00" />
      <rect x="7" y="14" width="2" height="2" fill="#ffcc00" />
      <rect x="0" y="7" width="2" height="2" fill="#ffcc00" />
      <rect x="14" y="7" width="2" height="2" fill="#ffcc00" />
      <rect x="2" y="2" width="2" height="2" fill="#ffcc00" />
      <rect x="12" y="2" width="2" height="2" fill="#ffcc00" />
      <rect x="2" y="12" width="2" height="2" fill="#ffcc00" />
      <rect x="12" y="12" width="2" height="2" fill="#ffcc00" />
      {/* Core */}
      <rect x="4" y="4" width="8" height="8" fill="#ffd700" />
      <rect x="5" y="3" width="6" height="10" fill="#ffd700" />
      <rect x="3" y="5" width="10" height="6" fill="#ffd700" />
      {/* Face */}
      <rect x="6" y="6" width="1" height="2" fill="#b8860b" />
      <rect x="9" y="6" width="1" height="2" fill="#b8860b" />
      <rect x="6" y="9" width="4" height="1" fill="#b8860b" />
    </svg>
  );
}

function FireSVG({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    >
      {/* Flame outer */}
      <rect x="6" y="0" width="4" height="2" fill="#ff9900" />
      <rect x="4" y="2" width="8" height="2" fill="#ff7700" />
      <rect x="3" y="4" width="10" height="2" fill="#ff5500" />
      <rect x="2" y="6" width="12" height="4" fill="#ff4400" />
      {/* Base */}
      <rect x="2" y="10" width="12" height="4" fill="#ff2200" />
      <rect x="4" y="14" width="8" height="2" fill="#cc1100" />
      {/* Inner bright */}
      <rect x="5" y="4" width="6" height="2" fill="#ffcc00" />
      <rect x="4" y="6" width="8" height="3" fill="#ffaa00" />
      <rect x="5" y="9" width="6" height="2" fill="#ff8800" />
    </svg>
  );
}

function DiamondSVG({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    >
      {/* Top half */}
      <rect x="7" y="1" width="2" height="1" fill="#a8efff" />
      <rect x="5" y="2" width="6" height="1" fill="#7de8ff" />
      <rect x="3" y="3" width="10" height="1" fill="#50e0ff" />
      <rect x="2" y="4" width="12" height="1" fill="#22d4f5" />
      <rect x="1" y="5" width="14" height="2" fill="#00c4e8" />
      {/* Bottom half */}
      <rect x="2" y="7" width="12" height="2" fill="#00a8d0" />
      <rect x="4" y="9" width="8" height="2" fill="#0090b8" />
      <rect x="6" y="11" width="4" height="2" fill="#007aa0" />
      <rect x="7" y="13" width="2" height="2" fill="#006080" />
      {/* Shine */}
      <rect x="5" y="3" width="2" height="2" fill="#e0faff" />
    </svg>
  );
}

function CrownSVG({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    >
      {/* Base band */}
      <rect x="1" y="11" width="14" height="4" fill="#c8a000" />
      {/* Crown points */}
      <rect x="1" y="8" width="2" height="3" fill="#ffd700" />
      <rect x="7" y="5" width="2" height="6" fill="#ffd700" />
      <rect x="13" y="8" width="2" height="3" fill="#ffd700" />
      <rect x="3" y="9" width="4" height="2" fill="#ffd700" />
      <rect x="9" y="9" width="4" height="2" fill="#ffd700" />
      {/* Gems */}
      <rect x="7" y="3" width="2" height="2" fill="#ff4488" />
      <rect x="1" y="6" width="2" height="2" fill="#4488ff" />
      <rect x="13" y="6" width="2" height="2" fill="#44ff88" />
      {/* Base shine */}
      <rect x="2" y="12" width="4" height="1" fill="#ffe060" />
      <rect x="10" y="12" width="4" height="1" fill="#ffe060" />
    </svg>
  );
}

const AVATARS: Array<{
  id: AvatarId;
  label: string;
  emoji: string;
  unlockDays: number;
  SVG: React.ComponentType<{ size?: number }>;
}> = [
  {
    id: "snowman",
    label: "Snowman",
    emoji: "⛄",
    unlockDays: 1,
    SVG: SnowmanSVG,
  },
  { id: "sun", label: "Sun", emoji: "☀️", unlockDays: 3, SVG: SunSVG },
  { id: "fire", label: "Fire", emoji: "🔥", unlockDays: 7, SVG: FireSVG },
  {
    id: "diamond",
    label: "Diamond",
    emoji: "💎",
    unlockDays: 14,
    SVG: DiamondSVG,
  },
  { id: "crown", label: "Crown", emoji: "👑", unlockDays: 30, SVG: CrownSVG },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  icon,
  dark,
}: { title: string; icon: React.ReactNode; dark: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span
        style={{ color: dark ? "oklch(0.7 0.15 220)" : "oklch(0.4 0.15 220)" }}
      >
        {icon}
      </span>
      <h3
        className="font-fraunces text-lg font-bold"
        style={{ color: textPrimary(dark) }}
      >
        {title}
      </h3>
      <div
        className="flex-1 h-px ml-2"
        style={{ background: borderColor(dark) }}
      />
    </div>
  );
}

function TogglePill({
  options,
  value,
  onChange,
  dark,
  ocidPrefix,
}: {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (v: string) => void;
  dark: boolean;
  ocidPrefix: string;
}) {
  return (
    <div
      className="flex rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${borderColor(dark)}`,
        background: dark
          ? "oklch(0.13 0.03 240 / 0.6)"
          : "oklch(0.94 0.02 240 / 0.6)",
      }}
    >
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          data-ocid={`${ocidPrefix}.toggle.${i + 1}`}
          onClick={() => onChange(opt.value)}
          className="flex-1 py-2 px-4 text-sm font-sora font-semibold transition-all"
          style={{
            background:
              value === opt.value
                ? dark
                  ? "oklch(0.35 0.14 220)"
                  : "oklch(0.45 0.14 220)"
                : "transparent",
            color:
              value === opt.value ? "oklch(0.97 0.02 220)" : textMuted(dark),
            cursor: "pointer",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Geocoding search ─────────────────────────────────────────────────────────

interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

async function searchCities(query: string): Promise<GeoResult[]> {
  if (query.length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results as GeoResult[]) ?? [];
  } catch {
    return [];
  }
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────

interface ProfilePageProps {
  profile: UserProfile;
  streak: number;
  theme: Theme;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onAddCity: (city: SavedCity) => void;
  onRemoveCity: (name: string) => void;
  onSelectCity: (lat: number, lon: number, name: string) => void;
  onThemeChange: (pref: ThemePref) => void;
  onLogout?: () => void;
}

export function ProfilePage({
  profile,
  streak,
  theme,
  onUpdateProfile,
  onAddCity,
  onRemoveCity,
  onSelectCity,
  onThemeChange,
  onLogout,
}: ProfilePageProps) {
  const dark = theme === "dark";
  const [nicknameInput, setNicknameInput] = useState(profile.nickname);
  const [citySearch, setCitySearch] = useState("");
  const [cityResults, setCityResults] = useState<GeoResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync nickname from profile
  useEffect(() => {
    setNicknameInput(profile.nickname);
  }, [profile.nickname]);

  const handleNicknameSave = useCallback(() => {
    onUpdateProfile({ nickname: nicknameInput.trim() });
    if (nicknameInput.trim())
      toast.success(`Hello, ${nicknameInput.trim()}! 👋`);
  }, [nicknameInput, onUpdateProfile]);

  const handleCitySearch = useCallback((q: string) => {
    setCitySearch(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!q.trim()) {
      setCityResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      const results = await searchCities(q);
      setCityResults(results);
      setSearchLoading(false);
    }, 350);
  }, []);

  const handleAddCity = useCallback(
    (r: GeoResult) => {
      onAddCity({ name: r.name, lat: r.latitude, lon: r.longitude });
      setCitySearch("");
      setCityResults([]);
      toast.success(`${r.name} added to saved cities`);
    },
    [onAddCity],
  );

  return (
    <motion.div
      className="w-full max-w-2xl px-4 pb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Page header ── */}
      <div className="text-center mb-8">
        <motion.h2
          className="font-fraunces text-4xl font-bold mb-1"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: dark
              ? "linear-gradient(135deg, oklch(0.82 0.16 220), oklch(0.72 0.18 280))"
              : "linear-gradient(135deg, oklch(0.35 0.2 220), oklch(0.28 0.2 280))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Profile
        </motion.h2>
        <p className="font-sora text-sm" style={{ color: textMuted(dark) }}>
          {profile.nickname
            ? `Welcome back, ${profile.nickname}!`
            : "Customize your TRUE TEMP experience"}
        </p>
      </div>

      {/* ══ SECTION 1: Identity ══ */}
      <motion.div
        className="rounded-2xl p-6 mb-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          background: cardBg(dark),
          border: `1px solid ${borderColor(dark)}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <SectionHeader title="Identity" icon={<User size={18} />} dark={dark} />

        {/* Nickname */}
        <div className="mb-5">
          <p
            className="block font-sora text-sm font-semibold mb-2"
            style={{ color: textMuted(dark) }}
          >
            Your Name
          </p>
          <div className="flex gap-2">
            <Input
              data-ocid="profile.nickname.input"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onBlur={handleNicknameSave}
              onKeyDown={(e) => e.key === "Enter" && handleNicknameSave()}
              placeholder="Enter your name..."
              className="font-sora"
              style={{
                background: dark
                  ? "oklch(0.14 0.04 240 / 0.8)"
                  : "oklch(0.96 0.02 240 / 0.8)",
                border: `1px solid ${borderColor(dark)}`,
                color: textPrimary(dark),
              }}
            />
            <Button
              data-ocid="profile.nickname.save_button"
              onClick={handleNicknameSave}
              size="sm"
              style={{
                background: dark
                  ? "oklch(0.35 0.14 220)"
                  : "oklch(0.45 0.14 220)",
                color: "white",
                border: "none",
              }}
            >
              Save
            </Button>
          </div>
        </div>

        {/* Avatar Gallery */}
        <div>
          <p
            className="block font-sora text-sm font-semibold mb-3"
            style={{ color: textMuted(dark) }}
          >
            Avatar
          </p>
          <div className="grid grid-cols-5 gap-3">
            {AVATARS.map((av) => {
              const unlocked = streak >= av.unlockDays;
              const selected = profile.avatarId === av.id;
              return (
                <motion.button
                  key={av.id}
                  type="button"
                  data-ocid="profile.avatar.toggle"
                  whileHover={unlocked ? { scale: 1.06 } : {}}
                  whileTap={unlocked ? { scale: 0.96 } : {}}
                  onClick={() =>
                    unlocked && onUpdateProfile({ avatarId: av.id })
                  }
                  className="flex flex-col items-center gap-1 p-2 rounded-xl relative transition-all"
                  style={{
                    background: selected
                      ? dark
                        ? "oklch(0.28 0.12 220 / 0.8)"
                        : "oklch(0.88 0.1 220 / 0.8)"
                      : dark
                        ? "oklch(0.14 0.03 240 / 0.5)"
                        : "oklch(0.94 0.02 240 / 0.5)",
                    border: selected
                      ? dark
                        ? "2px solid oklch(0.65 0.2 220)"
                        : "2px solid oklch(0.45 0.2 220)"
                      : `1px solid ${borderColor(dark)}`,
                    boxShadow: selected
                      ? dark
                        ? "0 0 16px oklch(0.5 0.2 220 / 0.4)"
                        : "0 0 12px oklch(0.55 0.18 220 / 0.3)"
                      : "none",
                    opacity: unlocked ? 1 : 0.45,
                    cursor: unlocked ? "pointer" : "default",
                    filter: unlocked ? "none" : "grayscale(0.7)",
                  }}
                  title={
                    unlocked
                      ? av.label
                      : `Unlock at ${av.unlockDays} day streak`
                  }
                >
                  <div style={{ position: "relative" }}>
                    <av.SVG size={48} />
                    {!unlocked && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          background: "oklch(0.1 0 0 / 0.5)",
                          borderRadius: 4,
                        }}
                      >
                        <Lock size={14} color="oklch(0.85 0.04 240)" />
                      </div>
                    )}
                  </div>
                  <span
                    className="font-sora text-xs"
                    style={{
                      color: unlocked ? textPrimary(dark) : textMuted(dark),
                    }}
                  >
                    {av.label}
                  </span>
                  {!unlocked && (
                    <span
                      className="font-sora"
                      style={{
                        fontSize: 9,
                        color: textMuted(dark),
                        textAlign: "center",
                        lineHeight: 1.2,
                      }}
                    >
                      {av.unlockDays}d streak
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ══ SECTION 2: Trophy Room ══ */}
      <motion.div
        className="rounded-2xl p-6 mb-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: cardBg(dark),
          border: `1px solid ${borderColor(dark)}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <SectionHeader
          title="Trophy Room"
          icon={<Trophy size={18} />}
          dark={dark}
        />

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div
            className="rounded-xl p-4 text-center"
            data-ocid="profile.streak.card"
            style={{
              background: dark
                ? "linear-gradient(135deg, oklch(0.2 0.08 30), oklch(0.16 0.06 45))"
                : "linear-gradient(135deg, oklch(0.92 0.08 30), oklch(0.88 0.06 45))",
              border: dark
                ? "1px solid oklch(0.4 0.1 30 / 0.4)"
                : "1px solid oklch(0.7 0.1 30 / 0.4)",
            }}
          >
            <div className="text-3xl mb-1">🔥</div>
            <div
              className="font-fraunces text-2xl font-bold"
              style={{
                color: dark ? "oklch(0.85 0.15 35)" : "oklch(0.4 0.15 35)",
              }}
            >
              {profile.longestStreak}
            </div>
            <div
              className="font-sora text-xs"
              style={{ color: textMuted(dark) }}
            >
              Longest Streak
            </div>
          </div>
          <div
            className="rounded-xl p-4 text-center"
            data-ocid="profile.days.card"
            style={{
              background: dark
                ? "linear-gradient(135deg, oklch(0.2 0.08 220), oklch(0.16 0.06 240))"
                : "linear-gradient(135deg, oklch(0.92 0.08 220), oklch(0.88 0.06 240))",
              border: dark
                ? "1px solid oklch(0.4 0.1 220 / 0.4)"
                : "1px solid oklch(0.7 0.1 220 / 0.4)",
            }}
          >
            <div className="text-3xl mb-1">📅</div>
            <div
              className="font-fraunces text-2xl font-bold"
              style={{
                color: dark ? "oklch(0.85 0.15 220)" : "oklch(0.35 0.15 220)",
              }}
            >
              {profile.totalDaysActive}
            </div>
            <div
              className="font-sora text-xs"
              style={{ color: textMuted(dark) }}
            >
              Total Days Active
            </div>
          </div>
        </div>

        {/* Easter Egg Tracker */}
        <div>
          <p
            className="font-sora text-sm font-semibold mb-3"
            style={{ color: textMuted(dark) }}
          >
            Easter Egg Tracker
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: "snowman",
                name: "Snowman",
                emoji: "⛄",
                hint: "Triggered at ≤0°C",
              },
              {
                id: "meltingsun",
                name: "Melting Sun",
                emoji: "🌞",
                hint: "Triggered at ≥40°C",
              },
              { id: "???", name: "???", emoji: "🔒", hint: "Mystery egg" },
              { id: "???", name: "???", emoji: "🔒", hint: "Mystery egg" },
            ].map((egg, i) => {
              const discovered =
                egg.id !== "???" &&
                profile.discoveredEasterEggs.includes(egg.id);
              const isReal = egg.id !== "???";
              return (
                <div
                  key={egg.id === "???" ? `mystery-${i}` : egg.id}
                  data-ocid={`profile.easter_egg.item.${i + 1}`}
                  className="rounded-xl p-3 flex items-start gap-3"
                  style={{
                    background: discovered
                      ? dark
                        ? "oklch(0.22 0.1 130 / 0.5)"
                        : "oklch(0.9 0.08 130 / 0.5)"
                      : dark
                        ? "oklch(0.14 0.03 240 / 0.4)"
                        : "oklch(0.93 0.02 240 / 0.4)",
                    border: discovered
                      ? dark
                        ? "1px solid oklch(0.5 0.15 130 / 0.5)"
                        : "1px solid oklch(0.6 0.15 130 / 0.4)"
                      : `1px solid ${borderColor(dark)}`,
                    filter: !discovered && isReal ? "grayscale(0.8)" : "none",
                  }}
                >
                  <span className="text-2xl">{egg.emoji}</span>
                  <div>
                    <p
                      className="font-sora text-sm font-semibold"
                      style={{ color: textPrimary(dark) }}
                    >
                      {egg.name}
                    </p>
                    <p
                      className="font-sora"
                      style={{ fontSize: 11, color: textMuted(dark) }}
                    >
                      {discovered
                        ? egg.hint
                        : isReal
                          ? "Not yet discovered"
                          : "??"}
                    </p>
                    {discovered && (
                      <span
                        className="font-sora"
                        style={{
                          fontSize: 10,
                          color: dark
                            ? "oklch(0.7 0.2 130)"
                            : "oklch(0.4 0.2 130)",
                          fontWeight: 700,
                        }}
                      >
                        ✓ Discovered!
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ══ SECTION 3: App Preferences ══ */}
      <motion.div
        className="rounded-2xl p-6 mb-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          background: cardBg(dark),
          border: `1px solid ${borderColor(dark)}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <SectionHeader
          title="Preferences"
          icon={<Star size={18} />}
          dark={dark}
        />

        {/* Temperature unit */}
        <div className="mb-4">
          <p
            className="block font-sora text-sm font-semibold mb-2"
            style={{ color: textMuted(dark) }}
          >
            Temperature Unit
          </p>
          <TogglePill
            options={[
              { label: "°C (Celsius)", value: "C" },
              { label: "°F (Fahrenheit)", value: "F" },
            ]}
            value={profile.unitPreferences.temp}
            onChange={(v) =>
              onUpdateProfile({
                unitPreferences: {
                  ...profile.unitPreferences,
                  temp: v as "C" | "F",
                },
              })
            }
            dark={dark}
            ocidPrefix="profile.temp"
          />
        </div>

        {/* Wind speed unit */}
        <div className="mb-4">
          <p
            className="block font-sora text-sm font-semibold mb-2"
            style={{ color: textMuted(dark) }}
          >
            Wind Speed Unit
          </p>
          <TogglePill
            options={[
              { label: "km/h", value: "kmh" },
              { label: "mph", value: "mph" },
            ]}
            value={profile.unitPreferences.wind}
            onChange={(v) =>
              onUpdateProfile({
                unitPreferences: {
                  ...profile.unitPreferences,
                  wind: v as "kmh" | "mph",
                },
              })
            }
            dark={dark}
            ocidPrefix="profile.wind"
          />
        </div>

        {/* Theme preference */}
        <div className="mb-5">
          <p
            className="block font-sora text-sm font-semibold mb-2"
            style={{ color: textMuted(dark) }}
          >
            Theme
          </p>
          <TogglePill
            options={[
              { label: "☀️ Light", value: "light" },
              { label: "🌙 Dark", value: "dark" },
              { label: "⚙️ System", value: "system" },
            ]}
            value={profile.themePreference}
            onChange={(v) => {
              onUpdateProfile({ themePreference: v as ThemePref });
              onThemeChange(v as ThemePref);
            }}
            dark={dark}
            ocidPrefix="profile.theme"
          />
        </div>

        {/* Language */}
        <div className="mb-4">
          <p
            className="block font-sora text-sm font-semibold mb-2"
            style={{ color: textMuted(dark) }}
          >
            Language
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { label: "English", value: "en" },
                { label: "हिंदी", value: "hi" },
                { label: "मराठी", value: "mr" },
                { label: "தமிழ்", value: "ta" },
              ] as const
            ).map((lng) => (
              <button
                key={lng.value}
                type="button"
                data-ocid={`profile.lang.${lng.value}.button`}
                onClick={() => onUpdateProfile({ language: lng.value as Lang })}
                className="px-3 py-1.5 rounded-lg font-sora text-sm transition-all"
                style={{
                  background:
                    (profile.language ?? "en") === lng.value
                      ? dark
                        ? "oklch(0.45 0.18 220 / 0.5)"
                        : "oklch(0.6 0.15 220 / 0.3)"
                      : dark
                        ? "oklch(0.18 0.04 240 / 0.6)"
                        : "oklch(0.95 0.02 240 / 0.7)",
                  border:
                    (profile.language ?? "en") === lng.value
                      ? "1px solid oklch(0.55 0.18 220 / 0.6)"
                      : `1px solid ${borderColor(dark)}`,
                  color:
                    (profile.language ?? "en") === lng.value
                      ? dark
                        ? "oklch(0.82 0.15 220)"
                        : "oklch(0.28 0.14 230)"
                      : textMuted(dark),
                  fontWeight:
                    (profile.language ?? "en") === lng.value ? 600 : 400,
                }}
              >
                {lng.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Environmental Data toggle */}
        <div className="mb-5">
          <div
            className="flex items-center justify-between py-2 px-3 rounded-xl"
            style={{
              background: dark
                ? "oklch(0.14 0.03 240 / 0.5)"
                : "oklch(0.95 0.02 240 / 0.5)",
            }}
          >
            <div>
              <p
                className="font-sora text-sm font-semibold"
                style={{ color: textPrimary(dark) }}
              >
                Advanced Environmental Data
              </p>
              <p
                className="font-sora"
                style={{ fontSize: 11, color: textMuted(dark) }}
              >
                Soil moisture, evapotranspiration & solar radiation
              </p>
            </div>
            <Switch
              data-ocid="profile.agri.switch"
              checked={profile.showAgricultureData ?? false}
              onCheckedChange={(checked) =>
                onUpdateProfile({ showAgricultureData: checked })
              }
            />
          </div>
        </div>

        {/* Notifications */}
        <div>
          <p
            className="block font-sora text-sm font-semibold mb-3"
            style={{ color: textMuted(dark) }}
          >
            Notifications
          </p>
          <div className="flex flex-col gap-3">
            {(
              [
                {
                  key: "morning",
                  label: "Morning Briefing",
                  sub: "Daily at 9:00 AM",
                },
                {
                  key: "afternoon",
                  label: "Afternoon Briefing",
                  sub: "Daily at 3:00 PM",
                },
                {
                  key: "severe",
                  label: "Severe Weather Alerts",
                  sub: "Extreme conditions",
                },
              ] as const
            ).map((notif) => (
              <div
                key={notif.key}
                className="flex items-center justify-between py-2 px-3 rounded-xl"
                style={{
                  background: dark
                    ? "oklch(0.14 0.03 240 / 0.5)"
                    : "oklch(0.95 0.02 240 / 0.5)",
                  border: `1px solid ${borderColor(dark)}`,
                }}
              >
                <div>
                  <p
                    className="font-sora text-sm font-semibold"
                    style={{ color: textPrimary(dark) }}
                  >
                    {notif.label}
                  </p>
                  <p
                    className="font-sora"
                    style={{ fontSize: 11, color: textMuted(dark) }}
                  >
                    {notif.sub}
                  </p>
                </div>
                <Switch
                  data-ocid={`profile.notif.${notif.key}.switch`}
                  checked={profile.notifications[notif.key]}
                  onCheckedChange={(checked) =>
                    onUpdateProfile({
                      notifications: {
                        ...profile.notifications,
                        [notif.key]: checked,
                      },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ══ SECTION 4: Location Management ══ */}
      <motion.div
        className="rounded-2xl p-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: cardBg(dark),
          border: `1px solid ${borderColor(dark)}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <SectionHeader
          title="Saved Cities"
          icon={<MapPin size={18} />}
          dark={dark}
        />

        {/* City search */}
        <div className="relative mb-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: textMuted(dark) }}
              />
              <Input
                data-ocid="profile.city.search_input"
                value={citySearch}
                onChange={(e) => handleCitySearch(e.target.value)}
                placeholder="Search city or village..."
                className="pl-9 font-sora text-sm"
                style={{
                  background: dark
                    ? "oklch(0.14 0.04 240 / 0.8)"
                    : "oklch(0.96 0.02 240 / 0.8)",
                  border: `1px solid ${borderColor(dark)}`,
                  color: textPrimary(dark),
                }}
              />
            </div>
            {searchLoading && (
              <div
                className="w-5 h-5 rounded-full border-2 animate-spin"
                data-ocid="profile.city.loading_state"
                style={{
                  borderColor: borderColor(dark),
                  borderTopColor: "transparent",
                }}
              />
            )}
          </div>

          {/* Search dropdown */}
          <AnimatePresence>
            {cityResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
                style={{
                  background: dark
                    ? "oklch(0.18 0.05 240)"
                    : "oklch(0.97 0.02 240)",
                  border: `1px solid ${borderColor(dark)}`,
                  boxShadow: dark
                    ? "0 8px 32px oklch(0.05 0.02 240 / 0.8)"
                    : "0 8px 32px oklch(0.6 0.04 240 / 0.2)",
                }}
              >
                {cityResults.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    data-ocid="profile.city.result.button"
                    className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-white/5 transition-colors"
                    onClick={() => handleAddCity(r)}
                  >
                    <MapPin
                      size={12}
                      style={{ color: textMuted(dark), flexShrink: 0 }}
                    />
                    <div>
                      <span
                        className="font-sora text-sm font-semibold"
                        style={{ color: textPrimary(dark) }}
                      >
                        {r.name}
                      </span>
                      {r.admin1 && (
                        <span
                          className="font-sora text-xs ml-1"
                          style={{ color: textMuted(dark) }}
                        >
                          {r.admin1}
                          {r.country ? `, ${r.country}` : ""}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Saved cities list */}
        {profile.savedCities.length === 0 ? (
          <div
            data-ocid="profile.city.empty_state"
            className="text-center py-8"
          >
            <MapPin
              size={32}
              className="mx-auto mb-2"
              style={{ color: textMuted(dark), opacity: 0.4 }}
            />
            <p className="font-sora text-sm" style={{ color: textMuted(dark) }}>
              No saved cities yet. Search above to add one.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {profile.savedCities.map((city, i) => (
              <motion.div
                key={city.name}
                data-ocid={`profile.city.item.${i + 1}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl group"
                style={{
                  background: dark
                    ? "oklch(0.16 0.04 240 / 0.6)"
                    : "oklch(0.95 0.02 240 / 0.6)",
                  border: `1px solid ${borderColor(dark)}`,
                }}
              >
                <button
                  type="button"
                  data-ocid={`profile.city.link.${i + 1}`}
                  className="flex items-center gap-2 flex-1 text-left"
                  onClick={() => onSelectCity(city.lat, city.lon, city.name)}
                >
                  <MapPin size={14} style={{ color: textMuted(dark) }} />
                  <span
                    className="font-sora text-sm font-semibold"
                    style={{ color: textPrimary(dark) }}
                  >
                    {city.name}
                  </span>
                </button>
                <button
                  type="button"
                  data-ocid={`profile.city.delete_button.${i + 1}`}
                  onClick={() => onRemoveCity(city.name)}
                  className="opacity-50 hover:opacity-100 transition-opacity p-1 rounded"
                  title="Remove city"
                >
                  <Trash2
                    size={14}
                    style={{
                      color: dark ? "oklch(0.7 0.15 15)" : "oklch(0.5 0.15 15)",
                    }}
                  />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      {/* Logout button */}
      {onLogout && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 px-4 pb-4"
        >
          <button
            type="button"
            data-ocid="profile.logout_button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{
              background: dark
                ? "oklch(0.25 0.12 15 / 0.3)"
                : "oklch(0.92 0.06 15 / 0.4)",
              border: `1px solid ${dark ? "oklch(0.5 0.2 15 / 0.3)" : "oklch(0.7 0.15 15 / 0.4)"}`,
              color: dark ? "oklch(0.75 0.18 15)" : "oklch(0.45 0.18 15)",
            }}
          >
            <LogOut size={15} />
            Log Out
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
