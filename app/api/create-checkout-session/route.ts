import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateUserProfile, upsertUserProfile } from "@/lib/server/entitlements";
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

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_STRIPE_PRICE_ID is not configured." },
      { status: 500 }
    );
  }

  try {
    const stripe = getStripe();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get("origin") ?? new URL(request.url).origin;
    const profile = await getOrCreateUserProfile(auth.user.id, auth.user.email ?? null);

    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: auth.user.email ?? undefined,
        metadata: {
          userId: auth.user.id
        }
      });
      customerId = customer.id;
      await upsertUserProfile({
        id: auth.user.id,
        email: auth.user.email ?? null,
        stripe_customer_id: customerId
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: auth.user.id,
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
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Stripe Checkoutを開始できませんでした。"
      },
      { status: 500 }
    );
  }
}
