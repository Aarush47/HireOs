import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-bg-light/86 border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-4">
        <a href="/" className="flex items-center gap-3" aria-label="Nullmask home">
          <span className="w-9 h-9 rounded-md bg-foreground text-background grid place-items-center font-display font-black text-lg">
            H
          </span>
          <span className="font-display font-bold text-lg tracking-tight">HIREOS</span>
        </a>

        <div className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.18em] font-semibold">
          <a href="#how" className="hover:text-muted-foreground transition">How it works</a>
          <a href="#features" className="hover:text-muted-foreground transition">Features</a>
          <a href="#vision" className="hover:text-muted-foreground transition">For employers</a>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#how"
            className="hidden sm:inline-flex btn-accent text-xs px-4 py-2"
          >
            Get started
          </a>
          <button
            aria-label="Open menu"
            className="w-10 h-10 grid place-items-center rounded-md hover:bg-foreground/5 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </header>
  );
}
