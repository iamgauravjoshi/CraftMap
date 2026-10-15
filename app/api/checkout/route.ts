import { NextResponse } from "next/server";

const PRICES: Record<string, number> = {
  pin: 900,
  boat: 2900,
  ship: 7900,
  yacht: 14900,
  landmark: 29900,
};

// Stripe-compatible checkout. With STRIPE_SECRET_KEY set this creates a real
// Checkout Session; otherwise it returns { url: null, demo: true } so the UI
// runs its demo checkout and still publishes the placement.
export async function POST(req: Request) {
  const { tier, businessName, email } = (await req.json()) as {
    tier: keyof typeof PRICES;
    businessName: string;
    email: string;
  };
  const amount = PRICES[tier] ?? 2900;

  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: { name: `CraftMap promoted placement — ${tier} · ${businessName}` },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/?placement=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/?placement=cancelled`,
      metadata: { tier, businessName },
    });
    return NextResponse.json({ url: session.url, demo: false, sessionId: session.id });
  }

  return NextResponse.json({ url: null, demo: true, sessionId: `demo_${Date.now()}` });
}
