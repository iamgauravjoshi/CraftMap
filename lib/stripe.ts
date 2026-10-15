// Stripe-compatible payment architecture. Server route /api/checkout creates a
// real Checkout Session when STRIPE_SECRET_KEY is set; otherwise the UI runs a
// demo checkout so the whole purchase flow is testable without keys.
import type { SponsoredTier } from "./types";

export const TIER_PRICES: Record<SponsoredTier, number> = {
  pin: 900,
  boat: 2900,
  ship: 7900,
  yacht: 14900,
  landmark: 29900,
};

export async function createCheckoutSession(args: {
  tier: SponsoredTier;
  businessName: string;
  email: string;
}): Promise<{ url: string | null; demo: boolean; sessionId: string }> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error("Checkout failed");
  return res.json();
}
