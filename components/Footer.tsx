import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <p>© 2026 Transparent Maker</p>
      <nav className="flex flex-wrap gap-4">
        <Link className="transition hover:text-cyan-200" href="/privacy">
          Privacy Policy
        </Link>
        <Link className="transition hover:text-cyan-200" href="/contact">
          Contact
        </Link>
        <Link className="transition hover:text-cyan-200" href="/terms">
          Terms
        </Link>
      </nav>
    </footer>
  );
}
