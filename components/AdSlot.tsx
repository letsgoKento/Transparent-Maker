import { BadgeDollarSign } from "lucide-react";

type AdSlotProps = {
  label: string;
};

export function AdSlot({ label }: AdSlotProps) {
  return (
    <aside className="glass-panel flex min-h-24 items-center justify-center rounded-lg border-dashed p-4 text-center text-sm text-slate-400">
      {/* AdSense slot: replace this placeholder with <ins className="adsbygoogle" /> after approval. */}
      <div className="flex items-center gap-2">
        <BadgeDollarSign className="h-4 w-4 text-cyan-300" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </aside>
  );
}
