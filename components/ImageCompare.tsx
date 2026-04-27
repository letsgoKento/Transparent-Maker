"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

type ImageCompareProps = {
  originalUrl: string | null;
  resultUrl: string | null;
};

export function ImageCompare({ originalUrl, resultUrl }: ImageCompareProps) {
  const [mobileTab, setMobileTab] = useState<"before" | "after">("before");

  if (!originalUrl) {
    return (
      <section className="glass-panel preview-stage grid place-items-center rounded-lg p-6 text-center">
        <div>
          <ImageIcon className="mx-auto h-10 w-10 text-slate-500" aria-hidden="true" />
          <p className="mt-3 text-sm text-slate-400">Before / After プレビューがここに表示されます。</p>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel rounded-lg p-4 sm:p-5">
      <div className="mb-4 grid grid-cols-2 gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("before")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mobileTab === "before"
              ? "bg-cyan-300 text-slate-950"
              : "border border-slate-700 bg-slate-950/50 text-slate-300"
          }`}
        >
          Before
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("after")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mobileTab === "after"
              ? "bg-cyan-300 text-slate-950"
              : "border border-slate-700 bg-slate-950/50 text-slate-300"
          }`}
          disabled={!resultUrl}
        >
          After
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <PreviewPane
          label="Before"
          imageUrl={originalUrl}
          className={mobileTab === "after" ? "hidden sm:block" : ""}
        />
        <PreviewPane
          label="After"
          imageUrl={resultUrl}
          checkered
          className={mobileTab === "before" ? "hidden sm:block" : ""}
        />
      </div>
    </section>
  );
}

function PreviewPane({
  label,
  imageUrl,
  checkered,
  className = ""
}: {
  label: string;
  imageUrl: string | null;
  checkered?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-md border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-normal text-slate-200">
          {label}
        </span>
      </div>
      <div
        className={`preview-stage grid place-items-center overflow-hidden rounded-lg border border-slate-700/70 p-2 ${
          checkered ? "checkered" : "bg-slate-950/70"
        }`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={`${label} preview`} className="preview-image" />
        ) : (
          <p className="px-4 text-center text-sm text-slate-400">処理後の画像がここに表示されます。</p>
        )}
      </div>
    </div>
  );
}
