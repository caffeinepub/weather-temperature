import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import type { UserProfile } from "../hooks/useUserProfile";
import { t } from "../i18n";
import type { Language } from "../i18n";

interface ProfilePageProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  lang: Language;
  onSwitchCity: (city: { name: string; lat: number; lon: number }) => void;
}

const AVATARS = [
  { id: "snowman", emoji: "⛄", label: "Snowman", unlockAt: 1 },
  { id: "sun", emoji: "☀️", label: "Sun", unlockAt: 3 },
  { id: "fire", emoji: "🔥", label: "Fire", unlockAt: 7 },
  { id: "diamond", emoji: "💎", label: "Diamond", unlockAt: 14 },
  { id: "crown", emoji: "👑", label: "Crown", unlockAt: 30 },
];

const EASTER_EGGS = [
  {
    id: "snowman",
    emoji: "⛄",
    label: "Pixel Snowman",
    hint: "Trigger at 0°C",
  },
  { id: "sun", emoji: "🌞", label: "Melting Sun", hint: "Trigger at 40°C+" },
  { id: "mystery1", emoji: "❓", label: "Mystery", hint: "???", locked: true },
  { id: "mystery2", emoji: "❓", label: "Mystery", hint: "???", locked: true },
  { id: "mystery3", emoji: "❓", label: "Mystery", hint: "???", locked: true },
];

export function ProfilePage({
  profile,
  onUpdate,
  lang,
  onSwitchCity,
}: ProfilePageProps) {
  const [cityInput, setCityInput] = useState("");
  const [nickname, setNickname] = useState(profile.nickname);

  const streak = profile.streak;

  const handleAddCity = async () => {
    if (!cityInput.trim()) return;
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}&count=1&language=en&format=json`,
      );
      const data = await res.json();
      if (data.results?.[0]) {
        const r = data.results[0];
        const newCity = { name: r.name, lat: r.latitude, lon: r.longitude };
        const exists = profile.savedCities.some((c) => c.name === newCity.name);
        if (!exists) {
          onUpdate({ savedCities: [...profile.savedCities, newCity] });
        }
        setCityInput("");
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-4 px-4">
      <h2 className="text-xl font-display font-bold mb-4">
        👤 {t(lang, "profile")}
      </h2>

      {/* User Identity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-4"
      >
        <h3 className="text-sm font-display font-semibold mb-3">Identity</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              {t(lang, "nickname")}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                data-ocid="profile.nickname_input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your name"
                className="font-body text-sm"
              />
              <Button
                data-ocid="profile.save_button"
                size="sm"
                onClick={() => onUpdate({ nickname })}
              >
                {t(lang, "save")}
              </Button>
            </div>
          </div>

          {/* Avatars */}
          <div>
            <Label className="text-xs text-muted-foreground">
              {t(lang, "avatars")}
            </Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {AVATARS.map((av) => {
                const unlocked = streak.current >= av.unlockAt;
                return (
                  <button
                    key={av.id}
                    type="button"
                    className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 transition-all ${
                      unlocked
                        ? profile.avatar === av.id
                          ? "border-primary bg-primary/20"
                          : "border-border hover:border-primary/50"
                        : "border-border/30 opacity-40 cursor-not-allowed"
                    }`}
                    onClick={() => unlocked && onUpdate({ avatar: av.id })}
                    title={
                      unlocked
                        ? av.label
                        : `${t(lang, "unlockAt")} ${av.unlockAt} ${t(lang, "days")}`
                    }
                  >
                    {av.emoji}
                    {!unlocked && (
                      <span className="absolute -bottom-1 -right-1 text-[10px] bg-muted rounded-full w-4 h-4 flex items-center justify-center">
                        🔒
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trophy Room */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-4 mb-4"
      >
        <h3 className="text-sm font-display font-semibold mb-3">
          🏆 {t(lang, "trophyRoom")}
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-2xl font-display font-bold">
              {streak.current}🔥
            </p>
            <p className="text-[10px] text-muted-foreground">Current</p>
          </div>
          <div className="text-center border-x border-border/30">
            <p className="text-2xl font-display font-bold">{streak.longest}</p>
            <p className="text-[10px] text-muted-foreground">
              {t(lang, "longestStreak")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold">
              {streak.totalDays}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t(lang, "totalDays")}
            </p>
          </div>
        </div>

        {/* Easter Egg Tracker */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            {t(lang, "easterEggs")}
          </p>
          <div className="flex gap-2 flex-wrap">
            {EASTER_EGGS.map((egg) => {
              const discovered =
                !egg.locked &&
                profile.easterEggs[egg.id as keyof typeof profile.easterEggs];
              return (
                <div
                  key={egg.id}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center w-16 ${
                    discovered
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/30 opacity-40"
                  }`}
                  title={egg.hint}
                >
                  <span className="text-xl">{egg.emoji}</span>
                  <p className="text-[9px] leading-tight">{egg.label}</p>
                  {discovered && (
                    <span className="text-[9px] text-primary">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* App Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-4 space-y-4"
      >
        <h3 className="text-sm font-display font-semibold">
          ⚙️ {t(lang, "settings")}
        </h3>

        {/* Units */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {t(lang, "units")}
          </Label>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="profile.unit_toggle"
              className={`flex-1 py-2 rounded-xl text-sm font-body border transition-all ${
                profile.units.temp === "C"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground"
              }`}
              onClick={() =>
                onUpdate({ units: { ...profile.units, temp: "C" } })
              }
            >
              {t(lang, "celsius")} (°C)
            </button>
            <button
              type="button"
              data-ocid="profile.unit_toggle"
              className={`flex-1 py-2 rounded-xl text-sm font-body border transition-all ${
                profile.units.temp === "F"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground"
              }`}
              onClick={() =>
                onUpdate({ units: { ...profile.units, temp: "F" } })
              }
            >
              {t(lang, "fahrenheit")} (°F)
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="profile.wind_toggle"
              className={`flex-1 py-2 rounded-xl text-sm font-body border transition-all ${
                profile.units.wind === "kmh"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground"
              }`}
              onClick={() =>
                onUpdate({ units: { ...profile.units, wind: "kmh" } })
              }
            >
              {t(lang, "kmh")}
            </button>
            <button
              type="button"
              data-ocid="profile.wind_toggle"
              className={`flex-1 py-2 rounded-xl text-sm font-body border transition-all ${
                profile.units.wind === "mph"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground"
              }`}
              onClick={() =>
                onUpdate({ units: { ...profile.units, wind: "mph" } })
              }
            >
              {t(lang, "mph")}
            </button>
          </div>
        </div>

        {/* Theme */}
        <div>
          <Label className="text-xs text-muted-foreground">
            {t(lang, "theme")}
          </Label>
          <Select
            value={profile.theme}
            onValueChange={(v) =>
              onUpdate({ theme: v as UserProfile["theme"] })
            }
          >
            <SelectTrigger
              data-ocid="profile.theme_select"
              className="mt-1 font-body text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t(lang, "light")}</SelectItem>
              <SelectItem value="dark">{t(lang, "dark")}</SelectItem>
              <SelectItem value="system">{t(lang, "system")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div>
          <Label className="text-xs text-muted-foreground">
            {t(lang, "language")}
          </Label>
          <Select
            value={profile.language}
            onValueChange={(v) => onUpdate({ language: v as Language })}
          >
            <SelectTrigger
              data-ocid="profile.language_select"
              className="mt-1 font-body text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
              <SelectItem value="mr">मराठी</SelectItem>
              <SelectItem value="ta">தமிழ்</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {t(lang, "notifications")}
          </Label>
          {[
            { key: "morning", label: t(lang, "morning") },
            { key: "afternoon", label: t(lang, "afternoon") },
            { key: "severe", label: t(lang, "severeWeather") },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm font-body">{item.label}</span>
              <Switch
                checked={
                  profile.notifications[
                    item.key as keyof typeof profile.notifications
                  ]
                }
                onCheckedChange={(checked) =>
                  onUpdate({
                    notifications: {
                      ...profile.notifications,
                      [item.key]: checked,
                    },
                  })
                }
              />
            </div>
          ))}
        </div>

        {/* Agriculture Metrics */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-body">
            🌾 {t(lang, "agriculture")} Metrics
          </span>
          <Switch
            checked={profile.agrMetrics}
            onCheckedChange={(checked) => onUpdate({ agrMetrics: checked })}
          />
        </div>
      </motion.div>

      {/* Saved Cities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-4 mb-4"
      >
        <h3 className="text-sm font-display font-semibold mb-3">
          🏙️ {t(lang, "savedCities")}
        </h3>

        <div className="flex gap-2 mb-3">
          <Input
            data-ocid="profile.city_input"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder={t(lang, "searchCity")}
            className="font-body text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAddCity()}
          />
          <Button
            data-ocid="profile.city.add_button"
            size="sm"
            onClick={handleAddCity}
          >
            {t(lang, "addCity")}
          </Button>
        </div>

        {profile.savedCities.length === 0 ? (
          <p
            data-ocid="profile.empty_state"
            className="text-xs text-muted-foreground text-center py-4"
          >
            No saved cities yet. Add some above!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {profile.savedCities.map((city, i) => (
              <div
                key={city.name}
                data-ocid={`profile.city.item.${i + 1}`}
                className="flex items-center justify-between rounded-xl border border-border/30 px-3 py-2"
              >
                <button
                  type="button"
                  className="flex-1 text-left text-sm font-body hover:text-primary transition-colors"
                  onClick={() => onSwitchCity(city)}
                >
                  📍 {city.name}
                </button>
                <button
                  type="button"
                  data-ocid={`profile.city.delete_button.${i + 1}`}
                  className="text-muted-foreground hover:text-destructive transition-colors text-xs ml-2"
                  onClick={() =>
                    onUpdate({
                      savedCities: profile.savedCities.filter(
                        (c) => c.name !== city.name,
                      ),
                    })
                  }
                >
                  {t(lang, "remove")}
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
