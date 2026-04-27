import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-6 pt-8 sm:px-6 lg:px-8">
      <nav className="flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 shadow-glow">
            <Sparkles className="h-5 w-5 text-cyan-200" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-normal">Transparent Maker</span>
        </a>
        <div className="hidden items-center gap-5 text-sm text-slate-300 sm:flex">
          <a className="transition hover:text-cyan-200" href="#how-to-use">
            使い方
          </a>
          <a className="transition hover:text-cyan-200" href="/privacy">
            Privacy
          </a>
          <a className="transition hover:text-cyan-200" href="/contact">
            Contact
          </a>
        </div>
      </nav>
      <div className="max-w-3xl">
        <p className="mb-3 text-sm font-medium text-cyan-200">AI background remover</p>
        <h1 className="text-3xl font-semibold tracking-normal text-white sm:text-5xl">
          画像を置くだけで、背景透過PNGをすばやく作成
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          人物・商品・イラストの背景を自動削除。無料版は約1024px、HD版はログインと課金状態を確認して元解像度で提供します。
        </p>
      </div>
    </header>
  );
}
