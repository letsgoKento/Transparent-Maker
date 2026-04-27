"use client";

import { Crown, Download, LockKeyhole, RefreshCw, RotateCcw } from "lucide-react";

type DownloadActionsProps = {
  canDownload: boolean;
  isPaid: boolean;
  isHdLoading: boolean;
  onFreeDownload: () => void;
  onHdDownload: () => void;
  onReprocess: () => void;
  onChooseAnother: () => void;
};

export function DownloadActions({
  canDownload,
  isPaid,
  isHdLoading,
  onFreeDownload,
  onHdDownload,
  onReprocess,
  onChooseAnother
}: DownloadActionsProps) {
  return (
    <section className="glass-panel rounded-lg p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onFreeDownload}
          disabled={!canDownload}
          className="shine-button inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-glow transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
        >
          <Download className="h-5 w-5" aria-hidden="true" />
          Free Download
        </button>
        <button
          type="button"
          onClick={onHdDownload}
          disabled={!canDownload || isHdLoading}
          className="shine-button inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-blue-300/60 bg-blue-500/20 px-5 py-3 text-sm font-bold text-blue-100 transition hover:border-blue-200 hover:bg-blue-400/25 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500"
        >
          {isHdLoading ? (
            <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : isPaid ? (
            <Crown className="h-5 w-5" aria-hidden="true" />
          ) : (
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          )}
          HD Download
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onChooseAnother}
          className="rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-100"
        >
          別の画像を選択
        </button>
        <button
          type="button"
          onClick={onReprocess}
          disabled={!canDownload}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-100 disabled:cursor-not-allowed disabled:text-slate-500"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          もう一度処理
        </button>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-400">
        無料版は長辺約1024pxのPNGです。HD版はログイン状態と有料プランをAPI側で確認してから提供します。
      </p>
    </section>
  );
}
