import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AuthState } from "@/hooks/useAuth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Animated weather background ─────────────────────────────────────────────

function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const drops: Array<{
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
    }> = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 120; i++) {
      drops.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: 3 + Math.random() * 4,
        length: 12 + Math.random() * 20,
        opacity: 0.08 + Math.random() * 0.18,
      });
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of drops) {
        ctx.strokeStyle = `rgba(160, 200, 255, ${d.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.length * 0.2, d.y + d.length);
        ctx.stroke();
        d.y += d.speed;
        d.x -= d.speed * 0.2;
        if (d.y > canvas.height) {
          d.y = -d.length;
          d.x = Math.random() * canvas.width;
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

function FloatingClouds() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${160 + i * 60}px`,
            height: `${60 + i * 20}px`,
            background: `oklch(0.7 0.04 240 / ${0.04 + i * 0.02})`,
            top: `${8 + i * 12}%`,
            left: "-20%",
            filter: "blur(32px)",
          }}
          animate={{
            x: [0, window.innerWidth * 1.4],
          }}
          transition={{
            duration: 28 + i * 14,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: i * 7,
          }}
        />
      ))}
    </div>
  );
}

// ─── Pixel-art TRUE TEMP logo ─────────────────────────────────────────────────

function TrueTempLogo() {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Thermometer pixel icon */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 24 24"
          style={{ imageRendering: "pixelated" }}
          aria-hidden="true"
        >
          {/* Thermometer stem */}
          <rect
            x="9"
            y="2"
            width="6"
            height="14"
            rx="3"
            fill="oklch(0.75 0.12 200)"
          />
          {/* Thermometer bulb */}
          <circle cx="12" cy="18" r="4" fill="oklch(0.65 0.22 15)" />
          {/* Mercury fill */}
          <rect x="11" y="8" width="2" height="10" fill="oklch(0.65 0.22 15)" />
          {/* Tick marks */}
          <rect x="14" y="5" width="3" height="1" fill="oklch(0.8 0.08 220)" />
          <rect x="14" y="8" width="2" height="1" fill="oklch(0.8 0.08 220)" />
          <rect x="14" y="11" width="3" height="1" fill="oklch(0.8 0.08 220)" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="text-center"
      >
        <h1
          className="font-display text-4xl font-black tracking-tight"
          style={{
            color: "oklch(0.97 0.04 220)",
            textShadow: "0 2px 20px oklch(0.5 0.2 220 / 0.4)",
            letterSpacing: "-0.02em",
          }}
        >
          TRUE TEMP
        </h1>
        <p
          className="font-body text-sm mt-1"
          style={{ color: "oklch(0.75 0.08 220)" }}
        >
          India's Hyper-Local Weather
        </p>
      </motion.div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

interface LoginPageProps {
  auth: AuthState;
}

export function LoginPage({ auth }: LoginPageProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");

  // Login state
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginShowPass, setLoginShowPass] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupUser, setSignupUser] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupShowPass, setSignupShowPass] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!loginUser.trim() || !loginPass) {
        setLoginError("Please enter username and password.");
        return;
      }
      setLoginLoading(true);
      setLoginError(null);
      const err = await auth.login(loginUser.trim(), loginPass);
      setLoginLoading(false);
      if (err) setLoginError(err);
    },
    [auth, loginUser, loginPass],
  );

  const handleSignup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!signupUser.trim() || !signupPass) {
        setSignupError("Please fill all fields.");
        return;
      }
      if (signupPass !== signupConfirm) {
        setSignupError("Passwords do not match.");
        return;
      }
      if (signupPass.length < 8) {
        setSignupError("Password must be at least 8 characters.");
        return;
      }
      setSignupLoading(true);
      setSignupError(null);
      const err = await auth.register(signupUser.trim(), signupPass);
      setSignupLoading(false);
      if (err) setSignupError(err);
    },
    [auth, signupUser, signupPass, signupConfirm],
  );

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.12 0.06 245) 0%, oklch(0.08 0.04 260) 50%, oklch(0.1 0.08 230) 100%)",
      }}
    >
      {/* Animated background */}
      <FloatingClouds />
      <RainCanvas />

      {/* Subtle star field */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.3 0.1 240 / 0.15) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      {/* Content card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm mx-4"
        style={{ zIndex: 1 }}
      >
        {/* Logo section */}
        <div className="flex flex-col items-center mb-8">
          <TrueTempLogo />
        </div>

        {/* Auth card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "oklch(0.15 0.05 240 / 0.85)",
            border: "1px solid oklch(0.35 0.08 240 / 0.5)",
            backdropFilter: "blur(24px)",
            boxShadow:
              "0 24px 64px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.4 0.1 240 / 0.1)",
          }}
        >
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "login" | "signup")}
          >
            <TabsList
              className="w-full mb-6"
              style={{
                background: "oklch(0.1 0.04 240 / 0.6)",
                border: "1px solid oklch(0.28 0.06 240 / 0.4)",
              }}
            >
              <TabsTrigger
                value="login"
                data-ocid="auth.tab"
                className="flex-1 text-sm font-semibold data-[state=active]:text-white"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Log In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                data-ocid="auth.tab"
                className="flex-1 text-sm font-semibold data-[state=active]:text-white"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* ── Log In ── */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="login-username"
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "oklch(0.6 0.1 220)" }}
                  >
                    Username
                  </label>
                  <Input
                    id="login-username"
                    data-ocid="auth.username_input"
                    type="text"
                    placeholder="your_username"
                    autoComplete="username"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    disabled={loginLoading}
                    className="bg-transparent border-white/10 text-white placeholder:text-white/30 focus:border-sky-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "oklch(0.6 0.1 220)" }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      data-ocid="auth.password_input"
                      type={loginShowPass ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      disabled={loginLoading}
                      className="bg-transparent border-white/10 text-white placeholder:text-white/30 focus:border-sky-500/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setLoginShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                      tabIndex={-1}
                    >
                      {loginShowPass ? (
                        <EyeOff size={16} className="text-white" />
                      ) : (
                        <Eye size={16} className="text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <motion.div
                    data-ocid="auth.error_state"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{
                      background: "oklch(0.3 0.15 15 / 0.25)",
                      border: "1px solid oklch(0.5 0.2 15 / 0.4)",
                      color: "oklch(0.8 0.15 15)",
                    }}
                  >
                    {loginError}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  data-ocid="auth.submit_button"
                  disabled={loginLoading}
                  className="w-full font-bold tracking-wide mt-1"
                  style={{
                    background: loginLoading
                      ? "oklch(0.4 0.1 220)"
                      : "oklch(0.55 0.2 230)",
                    color: "white",
                    border: "none",
                  }}
                >
                  {loginLoading ? (
                    <span
                      data-ocid="auth.loading_state"
                      className="flex items-center gap-2"
                    >
                      <Loader2 size={16} className="animate-spin" />
                      Signing In…
                    </span>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ── Sign Up ── */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="signup-username"
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "oklch(0.6 0.1 220)" }}
                  >
                    Username
                  </label>
                  <Input
                    id="signup-username"
                    data-ocid="auth.username_input"
                    type="text"
                    placeholder="choose_username"
                    autoComplete="username"
                    value={signupUser}
                    onChange={(e) => setSignupUser(e.target.value)}
                    disabled={signupLoading}
                    className="bg-transparent border-white/10 text-white placeholder:text-white/30 focus:border-sky-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="signup-password"
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "oklch(0.6 0.1 220)" }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      data-ocid="auth.password_input"
                      type={signupShowPass ? "text" : "password"}
                      placeholder="min. 8 characters"
                      autoComplete="new-password"
                      value={signupPass}
                      onChange={(e) => setSignupPass(e.target.value)}
                      disabled={signupLoading}
                      className="bg-transparent border-white/10 text-white placeholder:text-white/30 focus:border-sky-500/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setSignupShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                      tabIndex={-1}
                    >
                      {signupShowPass ? (
                        <EyeOff size={16} className="text-white" />
                      ) : (
                        <Eye size={16} className="text-white" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="signup-confirm"
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "oklch(0.6 0.1 220)" }}
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="signup-confirm"
                    data-ocid="auth.confirm_password_input"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    disabled={signupLoading}
                    className="bg-transparent border-white/10 text-white placeholder:text-white/30 focus:border-sky-500/50"
                  />
                </div>

                {signupError && (
                  <motion.div
                    data-ocid="auth.error_state"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{
                      background: "oklch(0.3 0.15 15 / 0.25)",
                      border: "1px solid oklch(0.5 0.2 15 / 0.4)",
                      color: "oklch(0.8 0.15 15)",
                    }}
                  >
                    {signupError}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  data-ocid="auth.submit_button"
                  disabled={signupLoading}
                  className="w-full font-bold tracking-wide mt-1"
                  style={{
                    background: signupLoading
                      ? "oklch(0.4 0.1 220)"
                      : "oklch(0.55 0.2 230)",
                    color: "white",
                    border: "none",
                  }}
                >
                  {signupLoading ? (
                    <span
                      data-ocid="auth.loading_state"
                      className="flex items-center gap-2"
                    >
                      <Loader2 size={16} className="animate-spin" />
                      Creating Account…
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: "oklch(0.45 0.06 240)" }}
        >
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "oklch(0.55 0.12 220)" }}
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
