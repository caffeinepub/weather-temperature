import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import type { UserProfile } from "../hooks/useUserProfile";
import type { WeatherData } from "../hooks/useWeather";
import { getWeatherCondition } from "../hooks/useWeather";
import { t } from "../i18n";
import type { Language } from "../i18n";

interface StudioPageProps {
  profile: UserProfile;
  weatherData: WeatherData | null;
  convertTemp: (c: number) => number;
  tempUnit: string;
  lang: Language;
}

const MILESTONES = [3, 7, 14, 30];

function getNextMilestone(current: number): number {
  return MILESTONES.find((m) => m > current) ?? 30;
}

export function StudioPage({
  profile,
  weatherData,
  convertTemp,
  tempUnit,
  lang,
}: StudioPageProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [shareCardReady, setShareCardReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shareCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const streak = profile.streak;
  const nextMilestone = getNextMilestone(streak.current);
  const progress = Math.round((streak.current / nextMilestone) * 100);

  const current = weatherData?.current;
  const condition = current ? getWeatherCondition(current.weatherCode) : null;
  const loc = weatherData?.location;

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" }, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => setCameraActive(false));
    } else {
      for (const track of streamRef.current?.getTracks() ?? []) {
        track.stop();
      }
      streamRef.current = null;
    }
    return () => {
      for (const track of streamRef.current?.getTracks() ?? []) {
        track.stop();
      }
    };
  }, [cameraActive]);

  // Draw share card
  useEffect(() => {
    if (!shareCardReady) return;
    const canvas = shareCanvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = 380;
    const H = 200;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0d1b2a");
    grad.addColorStop(1, "#1a3a5c");
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, W, H, 20);
    ctx.fill();

    // Weather emoji
    ctx.font = "48px serif";
    ctx.fillText(condition?.emoji ?? "🌤️", 24, 70);

    // Temperature
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px Bricolage Grotesque, sans-serif";
    ctx.fillText(
      `${current ? convertTemp(current.temperature) : "--"}${tempUnit}`,
      90,
      70,
    );

    // Location
    ctx.font = "16px Figtree, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(loc?.name ?? "Unknown", 24, 105);

    // Condition
    ctx.font = "14px Figtree, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(condition ? t(lang, condition.label) : "", 24, 128);

    // Metrics row
    const metrics = [
      { label: "Humidity", val: `${current?.humidity ?? "--"}%` },
      { label: "Wind", val: `${current?.windSpeed?.toFixed(0) ?? "--"} km/h` },
      { label: "UV", val: `${current?.uvIndex?.toFixed(1) ?? "--"}` },
    ];
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(20, 145, W - 40, 1);
    metrics.forEach((m, i) => {
      const x = 24 + i * 115;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "11px Figtree, sans-serif";
      ctx.fillText(m.label, x, 163);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Figtree, sans-serif";
      ctx.fillText(m.val, x, 181);
    });

    // Watermark
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "bold 11px Bricolage Grotesque, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("TRUE TEMP", W - 16, H - 12);
    ctx.textAlign = "left";
  }, [shareCardReady, current, condition, loc, convertTemp, tempUnit, lang]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = video.videoWidth * dpr;
    canvas.height = video.videoHeight * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    // Overlay weather data
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.roundRect(16, 16, 200, 70, 14);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 32px Bricolage Grotesque, sans-serif";
    ctx.fillText(
      `${condition?.emoji ?? ""} ${current ? convertTemp(current.temperature) : "--"}${tempUnit}`,
      28,
      52,
    );
    ctx.font = "14px Figtree, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText(loc?.name ?? "", 28, 72);

    setCapturedImage(canvas.toDataURL("image/png"));
    setCameraActive(false);
  };

  const exportShareCard = () => {
    const canvas = shareCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `truetemp-${loc?.name ?? "weather"}-${new Date().toISOString().split("T")[0]}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen pb-24 pt-4 px-4">
      <h2 className="text-xl font-display font-bold mb-4">
        🎨 TrueTemp Studio
      </h2>

      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">{t(lang, "streak")}</p>
            <p className="text-3xl font-display font-bold mt-0.5">
              🔥 {streak.current}{" "}
              <span className="text-base font-normal">
                {streak.current === 1 ? t(lang, "day") : t(lang, "days")}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Next milestone</p>
            <p className="text-lg font-display font-bold text-primary">
              {nextMilestone} {t(lang, "days")}
            </p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {streak.current} / {nextMilestone} — {nextMilestone - streak.current}{" "}
          more to milestone!
        </p>
      </motion.div>

      {/* Camera Overlay Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-4"
      >
        <h3 className="text-sm font-display font-semibold mb-3">
          📸 Camera Weather Overlay
        </h3>

        {!cameraActive && !capturedImage && (
          <Button
            data-ocid="studio.camera_button"
            className="w-full h-14 text-base font-display"
            onClick={() => setCameraActive(true)}
          >
            {t(lang, "camera")}
          </Button>
        )}

        {cameraActive && (
          <div className="relative rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-xl"
            />
            {/* Live overlay */}
            <div className="absolute top-3 left-3 bg-black/50 rounded-xl px-3 py-2">
              <p className="text-white font-display font-bold text-xl">
                {condition?.emoji}{" "}
                {current ? convertTemp(current.temperature) : "--"}
                {tempUnit}
              </p>
              <p className="text-white/80 text-xs">{loc?.name}</p>
            </div>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
              <Button
                data-ocid="studio.camera_button"
                variant="outline"
                size="sm"
                className="bg-black/50 border-white/30 text-white"
                onClick={() => setCameraActive(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-white text-black font-bold"
                onClick={capturePhoto}
              >
                {t(lang, "capturePhoto")} ⏺
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-3">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full rounded-xl"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setCapturedImage(null);
                  setCameraActive(true);
                }}
              >
                Retake
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = capturedImage;
                  a.download = `truetemp-photo-${Date.now()}.png`;
                  a.click();
                }}
              >
                Save Photo
              </Button>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>

      {/* Share Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4"
      >
        <h3 className="text-sm font-display font-semibold mb-3">
          🌐 {t(lang, "weatherCard")}
        </h3>

        {!shareCardReady ? (
          <Button
            data-ocid="studio.share_button"
            variant="outline"
            className="w-full"
            onClick={() => setShareCardReady(true)}
          >
            {t(lang, "share")} → Generate Preview
          </Button>
        ) : (
          <div className="space-y-3">
            <canvas
              ref={shareCanvasRef}
              className="w-full rounded-xl border border-border/30"
              data-ocid="studio.canvas_target"
            />
            <div className="flex gap-2">
              <Button
                data-ocid="studio.export_button"
                className="flex-1"
                size="sm"
                onClick={exportShareCard}
              >
                {t(lang, "exportCard")} ↓
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShareCardReady(false)}
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
