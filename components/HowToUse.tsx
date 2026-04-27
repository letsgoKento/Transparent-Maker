import { Download, Eraser, Upload } from "lucide-react";

const steps = [
  {
    title: "画像をアップロード",
    body: "ドラッグ&ドロップ、またはクリックで画像を選択します。",
    icon: Upload
  },
  {
    title: "背景を自動削除",
    body: "ブラウザ処理で無料版の透過PNGを作成します。",
    icon: Eraser
  },
  {
    title: "PNGでダウンロード",
    body: "無料版は軽量、HD版は有料ユーザー向けに保護して提供します。",
    icon: Download
  }
];

export function HowToUse() {
  return (
    <section id="how-to-use" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-200">How to use</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">3ステップで完了</h2>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className="glass-panel rounded-lg p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-cyan-100">0{index + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{step.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
