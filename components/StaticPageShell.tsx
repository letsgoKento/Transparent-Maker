import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

type StaticPageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function StaticPageShell({ title, description, children }: StaticPageShellProps) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <nav className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 shadow-glow">
              <Sparkles className="h-5 w-5 text-cyan-200" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold">Transparent Maker</span>
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            戻る
          </Link>
        </nav>

        <section className="glass-panel rounded-lg p-6 sm:p-8">
          <p className="text-sm font-medium text-cyan-200">Transparent Maker</p>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{description}</p>
          <div className="mt-8 grid gap-6 text-sm leading-7 text-slate-300">{children}</div>
        </section>
      </div>
    </main>
  );
}
