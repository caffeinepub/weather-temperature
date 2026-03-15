import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdBanner() {
  useEffect(() => {
    try {
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }
      window.adsbygoogle.push({});
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="w-full overflow-hidden" style={{ minHeight: 50 }}>
      <ins
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
