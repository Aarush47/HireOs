import { useEffect } from "react";

export function useLenisScroll() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Respect reduced motion preferences by skipping smooth-scroll interpolation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
    let rafId = 0;
    let cancelled = false;

    const raf = (time: number) => {
      lenis?.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    import("lenis")
      .then(({ default: Lenis }) => {
        if (cancelled) {
          return;
        }

        lenis = new Lenis({
          duration: 1.05,
          smoothWheel: true,
          wheelMultiplier: 0.95,
          touchMultiplier: 1.1,
        });

        rafId = window.requestAnimationFrame(raf);
      })
      .catch(() => {
        // Gracefully fall back to native scrolling if Lenis fails to load.
      });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);
}
