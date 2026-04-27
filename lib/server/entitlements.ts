import { getAuthenticatedUser, getSupabaseAdmin } from "@/lib/supabase/server";

export type EntitlementResult =
  | {
      userId: string;
      email: string | null;
      isPaid: boolean;
    }
  | {
      error: string;
      status: number;
    };

type ProfileRow = {
  id: string;
  email?: string | null;
  plan?: string | null;
  is_paid?: boolean | null;
  stripe_customer_id?: string | null;
};

export async function getEntitlement(request: Request): Promise<EntitlementResult> {
  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) {
    return auth;
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("profiles")
      .select("id,email,plan,is_paid,stripe_customer_id")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (error) {
      return {
        error: "ユーザー状態の確認に失敗しました。profilesテーブルを確認してください。",
        status: 500
      };
    }

    const profile = data as ProfileRow | null;
    const plan = profile?.plan?.toLowerCase();
    const isPaid = Boolean(profile?.is_paid || plan === "paid" || plan === "pro");

    return {
      userId: auth.user.id,
      email: profile?.email ?? auth.user.email ?? null,
      isPaid
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "ユーザー状態を確認できませんでした。",
      status: 500
    };
  }
}

export async function requirePaidUser(request: Request) {
  const entitlement = await getEntitlement(request);
  if ("error" in entitlement) {
    return entitlement;
  }

  if (!entitlement.isPaid) {
    return {
      error: "HD Downloadは有料ユーザー限定です。",
      status: 403
    };
  }

  return entitlement;
}
