// app/api/webhooks/stripe/route.ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  let event: Stripe.Event;
  try {
    // Stripe requires the unmodified request body for signature verification.
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      // Payment verified. Persist credit grants in a database before using this
      // event to update a customer's usable balance. Do not trust the success URL.
      // This starter intentionally does not claim to maintain a durable credit ledger.
      console.info("Verified inference credit purchase", {
        eventId: event.id,
        sessionId: session.id,
        customerEmail: session.customer_details?.email ?? session.customer_email,
        packageId: session.metadata?.packageId,
        credits: session.metadata?.credits,
        amountTotal: session.amount_total,
        currency: session.currency,
      });
    }
  }

  return NextResponse.json({ received: true });
}
