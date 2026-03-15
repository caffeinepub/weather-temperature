import { useEffect, useRef } from "react";

interface WeatherBackgroundProps {
  weatherType: string; // "clear", "partly_cloudy", "cloudy", "fog", "rain", "snow", "storm"
  isAlertState: boolean;
  isDark: boolean;
}

export function WeatherBackground({
  weatherType,
  isAlertState,
  isDark,
}: WeatherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

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

    // Create particles
    type Particle = {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
      size: number;
      angle: number;
      wobble: number;
      wobbleSpeed: number;
    };

    const particles: Particle[] = [];
    const count =
      weatherType === "rain" || weatherType === "storm"
        ? 80
        : weatherType === "snow"
          ? 60
          : weatherType === "clear"
            ? 8
            : 0;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed:
          weatherType === "rain" || weatherType === "storm"
            ? 8 + Math.random() * 6
            : 0.5 + Math.random() * 1,
        length:
          weatherType === "rain" || weatherType === "storm"
            ? 15 + Math.random() * 10
            : 3,
        opacity: 0.3 + Math.random() * 0.5,
        size: weatherType === "snow" ? 2 + Math.random() * 4 : 1,
        angle: weatherType === "rain" ? 75 : 90,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.02,
      });
    }

    // Lightning state
    let lightningTimer = 0;
    let lightningAlpha = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (weatherType === "rain" || weatherType === "storm") {
        // Raindrops
        ctx.strokeStyle = isDark
          ? "rgba(150,200,255,0.5)"
          : "rgba(100,150,220,0.4)";
        ctx.lineWidth = 1.5;
        for (const p of particles) {
          ctx.beginPath();
          const rad = (p.angle * Math.PI) / 180;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(
            p.x + Math.cos(rad) * p.length * 0.3,
            p.y + Math.sin(rad) * p.length,
          );
          ctx.stroke();
          p.y += p.speed;
          p.x += Math.cos((p.angle * Math.PI) / 180) * 0.5;
          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
          if (p.x > canvas.width) p.x = 0;
        }

        // Lightning flash
        if (weatherType === "storm") {
          lightningTimer++;
          if (lightningTimer > 200 + Math.random() * 300) {
            lightningAlpha = 0.4;
            lightningTimer = 0;
          }
          if (lightningAlpha > 0) {
            ctx.fillStyle = `rgba(200,200,255,${lightningAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            lightningAlpha -= 0.05;
          }
        }
      } else if (weatherType === "snow") {
        // Snowflakes
        ctx.fillStyle = isDark
          ? "rgba(240,248,255,0.8)"
          : "rgba(200,220,240,0.7)";
        for (const p of particles) {
          ctx.beginPath();
          p.wobble += p.wobbleSpeed;
          ctx.arc(p.x + Math.sin(p.wobble) * 3, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.speed;
          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
        }
      } else if (weatherType === "clear") {
        // Sun rays
        const cx = canvas.width * 0.85;
        const cy = canvas.height * 0.12;
        const time = Date.now() / 3000;

        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + time;
          const len = 80 + Math.sin(time * 2 + i) * 20;
          const grad = ctx.createLinearGradient(
            cx,
            cy,
            cx + Math.cos(angle) * len,
            cy + Math.sin(angle) * len,
          );
          grad.addColorStop(
            0,
            isDark ? "rgba(255,220,100,0.5)" : "rgba(255,180,50,0.4)",
          );
          grad.addColorStop(1, "rgba(255,200,0,0)");
          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3;
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
          ctx.stroke();
        }

        // Sun circle
        const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45);
        sunGrad.addColorStop(
          0,
          isDark ? "rgba(255,230,100,0.9)" : "rgba(255,200,50,0.8)",
        );
        sunGrad.addColorStop(
          0.7,
          isDark ? "rgba(255,200,50,0.4)" : "rgba(255,160,20,0.3)",
        );
        sunGrad.addColorStop(1, "rgba(255,180,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, 45, 0, Math.PI * 2);
        ctx.fillStyle = sunGrad;
        ctx.fill();
      } else if (weatherType === "fog") {
        // Mist layers
        const time = Date.now() / 4000;
        for (let layer = 0; layer < 3; layer++) {
          const y = (canvas.height * (layer + 1)) / 4;
          const offset = Math.sin(time + layer) * 30;
          const grad = ctx.createLinearGradient(0, y - 40, 0, y + 40);
          grad.addColorStop(0, "rgba(200,220,240,0)");
          grad.addColorStop(
            0.5,
            isDark ? "rgba(150,180,210,0.15)" : "rgba(200,220,240,0.2)",
          );
          grad.addColorStop(1, "rgba(200,220,240,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(
            canvas.width / 2 + offset,
            y,
            canvas.width * 0.7,
            50,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [weatherType, isDark]);

  const getGradient = () => {
    if (isAlertState) return "weather-gradient-alert";
    switch (weatherType) {
      case "clear":
        return isDark ? "weather-gradient-clear" : "";
      case "rain":
      case "partly_cloudy":
      case "cloudy":
        return "weather-gradient-rain";
      case "storm":
        return "weather-gradient-storm";
      case "snow":
        return "weather-gradient-snow";
      case "fog":
        return "weather-gradient-fog";
      default:
        return isDark ? "weather-gradient-clear" : "";
    }
  };

  return (
    <div
      className={`fixed inset-0 -z-10 transition-all duration-1000 ${getGradient()}`}
      style={{
        background: isAlertState
          ? "linear-gradient(135deg, oklch(0.22 0.08 25) 0%, oklch(0.15 0.06 20) 100%)"
          : undefined,
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
