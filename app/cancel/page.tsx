import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CancelPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-2xl place-items-center px-4 py-10">
      <section className="glass-panel rounded-lg p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-rose-300" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-semibold text-white">Checkout canceled</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          決済はキャンセルされました。無料版の1024px PNGは引き続き利用できます。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/50 px-6 py-3 text-sm font-bold text-slate-100 transition hover:border-cyan-300/60 hover:text-cyan-100"
        >
          Transparent Makerへ戻る
        </Link>
      </section>
    </main>
  );
}
