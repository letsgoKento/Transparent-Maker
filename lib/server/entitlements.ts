import { getAuthenticatedUser, getSupabaseAdmin } from "@/lib/supabase/server";

export type UserProfile = {
  id: string;
  email: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: "free" | "pro";
  subscription_status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type EntitlementResult =
  | {
      userId: string;
      email: string | null;
      isPaid: boolean;
      profile: UserProfile;
    }
  | {
      error: string;
      status: number;
    };

type ProfilePatch = Partial<Omit<UserProfile, "id" | "created_at">> & {
  id: string;
};

export const USERS_PROFILE_TABLE = "users_profile";

function toUserProfile(row: Record<string, unknown>, fallbackEmail: string | null): UserProfile {
  const plan = row.plan === "pro" ? "pro" : "free";

  return {
    id: String(row.id),
    email: typeof row.email === "string" ? row.email : fallbackEmail,
    stripe_customer_id:
      typeof row.stripe_customer_id === "string" ? row.stripe_customer_id : null,
    stripe_subscription_id:
      typeof row.stripe_subscription_id === "string" ? row.stripe_subscription_id : null,
    plan,
    subscription_status:
      typeof row.subscription_status === "string" ? row.subscription_status : null,
    created_at: typeof row.created_at === "string" ? row.created_at : null,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : null
  };
}

export async function upsertUserProfile(patch: ProfilePatch) {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from(USERS_PROFILE_TABLE)
    .upsert(
      {
        plan: "free",
        subscription_status: "none",
        ...patch,
        updated_at: now
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toUserProfile(data as Record<string, unknown>, patch.email ?? null);
}

export async function getOrCreateUserProfile(userId: string, email: string | null) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from(USERS_PROFILE_TABLE)
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return toUserProfile(data as Record<string, unknown>, email);
  }

  return upsertUserProfile({
    id: userId,
    email,
    plan: "free",
    subscription_status: "none",
    stripe_customer_id: null,
    stripe_subscription_id: null
  });
}

export async function getProfileBySubscriptionId(subscriptionId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from(USERS_PROFILE_TABLE)
    .select("*")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toUserProfile(data as Record<string, unknown>, null) : null;
}

export async function getEntitlement(request: Request): Promise<EntitlementResult> {
  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) {
    return auth;
  }

  try {
    const profile = await getOrCreateUserProfile(auth.user.id, auth.user.email ?? null);

    return {
      userId: auth.user.id,
      email: profile.email ?? auth.user.email ?? null,
      isPaid: profile.plan === "pro",
      profile
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "ユーザー状態を確認できませんでした。users_profileテーブルを確認してください。",
      status: 500
    };
  }
}

export async function requireProUser(request: Request) {
  const entitlement = await getEntitlement(request);
  if ("error" in entitlement) {
    return entitlement;
  }

  if (!entitlement.isPaid) {
    return {
      error: "HD PNG is available with Pro",
      status: 403
    };
  }

  return entitlement;
}

export const requirePaidUser = requireProUser;
