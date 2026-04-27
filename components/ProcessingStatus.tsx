import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type ProcessingStatusProps = {
  status: "idle" | "ready" | "processing" | "done" | "error";
  progress: number;
  message: string;
};

export function ProcessingStatus({ status, progress, message }: ProcessingStatusProps) {
  if (status === "idle") {
    return null;
  }

  const Icon = status === "done" ? CheckCircle2 : status === "error" ? AlertCircle : Loader2;
  const color =
    status === "done"
      ? "text-emerald-300"
      : status === "error"
        ? "text-rose-300"
        : "text-cyan-200";

  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Icon
          className={`h-5 w-5 ${color} ${status === "processing" ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-slate-100">{message}</p>
      </div>
      {status === "processing" ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 transition-all duration-300"
            style={{ width: `${Math.max(6, Math.min(100, progress))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
