import { createClient, type User } from "@supabase/supabase-js";

export type AuthResult =
  | {
      user: User;
      accessToken: string;
    }
  | {
      error: string;
      status: number;
    };

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function getSupabaseAdmin() {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function getSupabaseAuthClient() {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function getAuthenticatedUser(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!accessToken) {
    return {
      error: "ログインが必要です。",
      status: 401
    };
  }

  try {
    const supabase = getSupabaseAuthClient();
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return {
        error: "ログイン状態を確認できませんでした。",
        status: 401
      };
    }

    return {
      user: data.user,
      accessToken
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "認証設定を確認できませんでした。",
      status: 500
    };
  }
}
