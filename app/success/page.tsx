import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-2xl place-items-center px-4 py-10">
      <section className="glass-panel rounded-lg p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-cyan-200" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-semibold text-white">Pro Plan is active</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          決済が完了しました。ログイン状態が反映されると、HD PNGを元解像度でダウンロードできます。
        </p>
        <Link
          href="/"
          className="shine-button mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 shadow-glow transition hover:bg-cyan-200"
        >
          Transparent Makerへ戻る
        </Link>
      </section>
    </main>
  );
}
