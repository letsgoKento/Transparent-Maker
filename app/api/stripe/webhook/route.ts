import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getProfileBySubscriptionId,
  upsertUserProfile
} from "@/lib/server/entitlements";

export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return new Stripe(secretKey);
}

function subscriptionPlan(status: Stripe.Subscription.Status): "free" | "pro" {
  return ["active", "trialing"].includes(status) ? "pro" : "free";
}

async function syncSubscription(subscription: Stripe.Subscription) {
  let userId = subscription.metadata?.userId ?? null;

  if (!userId) {
    const profile = await getProfileBySubscriptionId(subscription.id);
    userId = profile?.id ?? null;
  }

  if (!userId) return;

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const plan = subscriptionPlan(subscription.status);

  await upsertUserProfile({
    id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    plan,
    subscription_status: subscription.status
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
      {
        message:
          error instanceof Error ? error.message : "Webhook signature verification failed."
      },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId ?? session.client_reference_id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

      if (userId) {
        await upsertUserProfile({
          id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: "pro",
          subscription_status: "active"
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      await syncSubscription(event.data.object as Stripe.Subscription);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      let userId = subscription.metadata?.userId ?? null;

      if (!userId) {
        const profile = await getProfileBySubscriptionId(subscription.id);
        userId = profile?.id ?? null;
      }

      if (userId) {
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        await upsertUserProfile({
          id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          plan: "free",
          subscription_status: subscription.status
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Webhook processing failed." },
      { status: 500 }
    );
  }
}
