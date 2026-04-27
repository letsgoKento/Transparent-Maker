"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Crown, LogIn, LogOut, Mail, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type EntitlementState = {
  isConfigured: boolean;
  isSignedIn: boolean;
  isPaid: boolean;
  accessToken: string | null;
  email: string | null;
};

type AuthPanelProps = {
  onEntitlementChange: (state: EntitlementState) => void;
};

const defaultEntitlement: EntitlementState = {
  isConfigured: false,
  isSignedIn: false,
  isPaid: false,
  accessToken: null,
  email: null
};

export function AuthPanel({ onEntitlementChange }: AuthPanelProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      onEntitlementChange(defaultEntitlement);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setMessage(null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [onEntitlementChange, supabase]);

  useEffect(() => {
    async function loadPlan() {
      if (!supabase || !session?.access_token) {
        setIsPaid(false);
        onEntitlementChange({
          isConfigured: Boolean(supabase),
          isSignedIn: false,
          isPaid: false,
          accessToken: null,
          email: null
        });
        return;
      }

      try {
        const response = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        const data = (await response.json()) as { isPaid?: boolean; email?: string; message?: string };
        const paid = response.ok ? Boolean(data.isPaid) : false;
        setIsPaid(paid);
        onEntitlementChange({
          isConfigured: true,
          isSignedIn: true,
          isPaid: paid,
          accessToken: session.access_token,
          email: data.email ?? session.user.email ?? null
        });
      } catch {
        setIsPaid(false);
        onEntitlementChange({
          isConfigured: true,
          isSignedIn: true,
          isPaid: false,
          accessToken: session.access_token,
          email: session.user.email ?? null
        });
      }
    }

    loadPlan();
  }, [onEntitlementChange, session, supabase]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setMessage("Supabaseの環境変数を設定するとログインが有効になります。");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    setIsLoading(false);
    setMessage(error ? error.message : "ログイン用リンクをメールで送信しました。");
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setIsPaid(false);
  };

  const handleUpgrade = async () => {
    if (!session?.access_token) {
      setMessage("HD Downloadにはログインが必要です。");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      const data = (await response.json()) as { url?: string; message?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.message ?? "Stripe Checkoutを開始できませんでした。");
      }
      window.location.href = data.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "アップグレード処理に失敗しました。");
      setIsLoading(false);
    }
  };

  if (!supabase) {
    return (
      <section className="glass-panel rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-200" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-white">Plan</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              環境変数を設定すると、Supabase AuthとStripe決済によるHD Downloadが有効になります。
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Plan</h2>
          <p className="mt-1 text-xs text-slate-400">
            {session ? session.user.email : "HD Downloadにはログインが必要です。"}
          </p>
        </div>
        <span
          className={`rounded-lg border px-3 py-1 text-xs font-bold ${
            isPaid
              ? "border-cyan-200/60 bg-cyan-300/20 text-cyan-100"
              : "border-slate-700 bg-slate-950/60 text-slate-300"
          }`}
        >
          {isPaid ? "Paid" : "Free"}
        </span>
      </div>

      {session ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={isLoading || isPaid}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            <Crown className="h-4 w-4" aria-hidden="true" />
            {isPaid ? "HD Active" : "Upgrade"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-100"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="mt-4 grid gap-3">
          <label className="sr-only" htmlFor="email">
            メールアドレス
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2">
            <Mail className="h-4 w-4 shrink-0 text-cyan-200" aria-hidden="true" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:bg-slate-700 disabled:text-slate-400"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Login
          </button>
        </form>
      )}

      {message ? <p className="mt-3 text-xs leading-5 text-cyan-100">{message}</p> : null}
    </section>
  );
}
