export function Footer() {
  return (
    <footer className="dark bg-bg-dark text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-md bg-accent text-black grid place-items-center font-display font-black">
            H
          </span>
          <span className="font-display font-bold tracking-tight">HIREOS</span>
        </div>
        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} HIREOS. AI job search, simplified.
        </p>
      </div>
    </footer>
  );
}
