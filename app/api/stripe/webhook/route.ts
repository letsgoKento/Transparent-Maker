import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return new Stripe(secretKey);
}

async function updateProfilePlan(params: {
  userId: string;
  isPaid: boolean;
  plan: "free" | "paid";
  stripeCustomerId?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const row: Record<string, string | boolean | null> = {
    id: params.userId,
    is_paid: params.isPaid,
    plan: params.plan
  };

  if (params.stripeCustomerId !== undefined) {
    row.stripe_customer_id = params.stripeCustomerId;
  }

  const { error } = await supabase.from("profiles").upsert(row, {
    onConflict: "id"
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const active = ["active", "trialing"].includes(subscription.status);
  await updateProfilePlan({
    userId,
    isPaid: active,
    plan: active ? "paid" : "free",
    stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ message: "Stripe webhook is not configured." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId ?? session.client_reference_id;

      if (userId) {
        await updateProfilePlan({
          userId,
          isPaid: true,
          plan: "paid",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null
        });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      await syncSubscription(event.data.object as Stripe.Subscription);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Webhook processing failed." },
      { status: 500 }
    );
  }
}
