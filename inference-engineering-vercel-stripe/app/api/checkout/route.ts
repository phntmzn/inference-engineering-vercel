// app/api/checkout/route.ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PACKAGES = {
  starter: { name: "Starter Credits", amount: 500, credits: 500 },
  builder: { name: "Builder Credits", amount: 2000, credits: 2200 },
  scale: { name: "Scale Credits", amount: 5000, credits: 6000 },
} as const;

type PackageId = keyof typeof PACKAGES;

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Payments are not configured yet. Add STRIPE_SECRET_KEY in Vercel Environment Variables." }, { status: 503 });
  }

  let body: { packageId?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const packageId = body.packageId;
  if (typeof packageId !== "string" || !(packageId in PACKAGES)) {
    return NextResponse.json({ error: "Choose a valid credit package." }, { status: 400 });
  }

  const selected = PACKAGES[packageId as PackageId];
  const email = typeof body.email === "string" && body.email.includes("@") ? body.email : undefined;
  const stripe = new Stripe(secretKey);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: selected.amount,
          product_data: {
            name: selected.name,
            description: `${selected.credits.toLocaleString()} inference credits`,
          },
        },
      }],
      metadata: {
        packageId: packageId as string,
        credits: String(selected.credits),
      },
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?cancelled=1`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout creation failed:", error);
    return NextResponse.json({ error: "Unable to start checkout. Check your Stripe configuration." }, { status: 500 });
  }
}
