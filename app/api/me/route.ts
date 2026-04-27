import { NextResponse } from "next/server";
import { getEntitlement } from "@/lib/server/entitlements";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const entitlement = await getEntitlement(request);

  if ("error" in entitlement) {
    return NextResponse.json({ message: entitlement.error }, { status: entitlement.status });
  }

  return NextResponse.json({
    email: entitlement.email,
    isPaid: entitlement.isPaid
  });
}
