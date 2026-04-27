import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return new Stripe(secretKey);
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ message: "STRIPE_PRICE_ID is not configured." }, { status: 500 });
  }

  try {
    const stripe = getStripe();
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get("origin") ?? new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: auth.user.id,
      customer_email: auth.user.email ?? undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      metadata: {
        userId: auth.user.id
      },
      subscription_data: {
        metadata: {
          userId: auth.user.id
        }
      },
      allow_promotion_codes: true,
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancel`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Stripe Checkoutを開始できませんでした。" },
      { status: 500 }
    );
  }
}
