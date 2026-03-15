import { CloudSun, Palette, User2 } from "lucide-react";
import type { Language } from "../i18n";
import { t } from "../i18n";

export type Page = "dashboard" | "studio" | "profile";

interface BottomNavProps {
  page: Page;
  onNavigate: (page: Page) => void;
  lang: Language;
}

export function BottomNav({ page, onNavigate, lang }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2 border-t border-border/50 backdrop-blur-xl"
      style={{ background: "oklch(var(--card) / 0.95)" }}
    >
      <button
        type="button"
        data-ocid="nav.dashboard_link"
        className={`bottom-nav-item flex-1 ${page === "dashboard" ? "active" : ""}`}
        onClick={() => onNavigate("dashboard")}
      >
        <CloudSun className="w-5 h-5" />
        <span className="text-[10px] font-semibold font-body">
          {t(lang, "dashboard")}
        </span>
      </button>
      <button
        type="button"
        data-ocid="nav.studio_link"
        className={`bottom-nav-item flex-1 ${page === "studio" ? "active" : ""}`}
        onClick={() => onNavigate("studio")}
      >
        <Palette className="w-5 h-5" />
        <span className="text-[10px] font-semibold font-body">
          {t(lang, "studio")}
        </span>
      </button>
      <button
        type="button"
        data-ocid="nav.profile_link"
        className={`bottom-nav-item flex-1 ${page === "profile" ? "active" : ""}`}
        onClick={() => onNavigate("profile")}
      >
        <User2 className="w-5 h-5" />
        <span className="text-[10px] font-semibold font-body">
          {t(lang, "profile")}
        </span>
      </button>
    </nav>
  );
}
