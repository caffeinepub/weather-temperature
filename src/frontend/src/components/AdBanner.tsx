import { useEffect, useRef } from "react";

export function AdBanner() {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!pushed.current && ref.current) {
      pushed.current = true;
      try {
        // biome-ignore lint/suspicious/noAssignInExpressions: AdSense standard pattern
        const adsbygoogle = ((window as any).adsbygoogle =
          (window as any).adsbygoogle || []);
        adsbygoogle.push({});
      } catch (_) {
        // AdSense not loaded yet
      }
    }
  }, []);

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: "oklch(0.14 0.03 265 / 0.7)",
        borderBottom: "1px solid oklch(0.3 0.06 265 / 0.3)",
      }}
    >
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8943167021925238"
        data-ad-slot="1686358706"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export function AdBannerBottom() {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!pushed.current && ref.current) {
      pushed.current = true;
      try {
        // biome-ignore lint/suspicious/noAssignInExpressions: AdSense standard pattern
        const adsbygoogle = ((window as any).adsbygoogle =
          (window as any).adsbygoogle || []);
        adsbygoogle.push({});
      } catch (_) {
        // AdSense not loaded yet
      }
    }
  }, []);

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: "oklch(0.14 0.03 265 / 0.7)",
        borderTop: "1px solid oklch(0.3 0.06 265 / 0.3)",
      }}
    >
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8943167021925238"
        data-ad-slot="1686358706"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
