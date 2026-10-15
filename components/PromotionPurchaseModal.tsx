"use client";

import { PROMOTION_PLANS } from "@/lib/data";
import { createCheckoutSession } from "@/lib/stripe";
import { cn } from "@/lib/utils";
import type { SponsoredPlacement, SponsoredTier } from "@/lib/types";
import { motion } from "framer-motion";
import { Anchor, Check, Crown, Loader2, MapPin, Pin, Ship, X } from "lucide-react";
import { useState } from "react";
import { SponsoredMarker } from "./markers";

interface Props {
  open: boolean;
  onClose: () => void;
  location: { lat: number; lng: number } | null;
  onStartPicking: () => void;
  onPublished: (p: SponsoredPlacement, businessName: string) => void;
}

const TIER_ICON: Record<SponsoredTier, typeof Pin> = {
  pin: Pin,
  boat: Anchor,
  ship: Ship,
  yacht: Ship,
  landmark: Crown,
};

export default function PromotionPurchaseModal({ open, onClose, location, onStartPicking, onPublished }: Props) {
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<SponsoredTier>("boat");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;
  const plan = PROMOTION_PLANS.find((p) => p.tier === tier)!;

  const checkout = async () => {
    setBusy(true);
    try {
      const session = await createCheckoutSession({ tier, businessName: name || "My Business", email: email || "founder@example.com" });
      if (session.url) {
        window.location.href = session.url; // real Stripe Checkout
        return;
      }
      // demo checkout — simulate success
      await new Promise((r) => setTimeout(r, 1200));
      onPublished(
        { id: `s-user-${Date.now()}`, businessId: `b-user-${Date.now()}`, tier, lat: location?.lat ?? 12.97, lng: location?.lng ?? 77.59, label: name },
        name || "My Business"
      );
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl border border-rule bg-panel shadow-pop"
      >
        <div className="flex items-start justify-between border-b border-rule px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold">🛥️ Park your business</h2>
            <p className="text-[13px] text-muted">Buy a promoted spot on the map — {["Location", "Tier", "Business", "Checkout"][step]}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-panel2 hover:text-ink" aria-label="Close promotion">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {done ? (
            <div className="grid justify-items-center gap-3 py-6 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-live/15 text-2xl">🎉</span>
              <h3 className="font-display text-xl font-bold">You&apos;re live on the map!</h3>
              <p className="max-w-sm text-sm text-muted">Your {plan.name} for <b>{name}</b> is now visible to every explorer. Higher tiers stay visible at further zoom levels.</p>
              <button onClick={onClose} className="mt-2 h-11 rounded-xl bg-ink px-6 text-sm font-medium text-white">View my placement</button>
            </div>
          ) : step === 0 ? (
            <div className="grid gap-3">
              <p className="text-sm text-muted">Pick exactly where your promotion appears. Water placements unlock boats and ships.</p>
              <button
                onClick={() => {
                  onStartPicking();
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-ink text-sm font-medium text-white"
              >
                <MapPin className="h-4 w-4" /> {location ? `Selected: ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)} — pick again` : "Select map location"}
              </button>
              {location && (
                <p className="flex items-center gap-1.5 rounded-xl bg-live/10 px-3.5 py-3 text-[13px]">
                  <Check className="h-4 w-4 text-live" /> Location locked in. Continue to choose your tier.
                </p>
              )}
            </div>
          ) : step === 1 ? (
            <div className="grid gap-2">
              {PROMOTION_PLANS.map((p) => {
                const Icon = TIER_ICON[p.tier];
                const active = tier === p.tier;
                return (
                  <button
                    key={p.tier}
                    onClick={() => setTier(p.tier)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3.5 text-left transition",
                      active ? "border-ember bg-ember/[.06]" : "border-rule hover:border-muted"
                    )}
                  >
                    <span className={cn("grid h-11 w-11 flex-none place-items-center rounded-xl", active ? "bg-ember text-white" : "bg-panel2")}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="flex items-center gap-2 text-[15px]">{p.name}
                        <span className="font-mono text-[13px] text-ember">${p.price}</span>
                      </b>
                      <small className="block text-[13px] text-muted">{p.blurb}</small>
                      <small className="mt-0.5 block text-xs text-faint">{p.perks.join(" · ")}</small>
                    </span>
                    <SponsoredMarker placement={{ id: p.tier, businessId: "", tier: p.tier, lat: 0, lng: 0, label: "" }} brand="#E4562A" />
                  </button>
                );
              })}
            </div>
          ) : step === 2 ? (
            <div className="grid gap-3.5">
              <Preview tier={tier} name={name} />
              <label className="grid gap-1.5"><span className="text-[13px] font-semibold">Business name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." className={input} /></label>
              <label className="grid gap-1.5"><span className="text-[13px] font-semibold">Tagline</span>
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="What do you do, in 6 words?" className={input} /></label>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <label className="grid gap-1.5"><span className="text-[13px] font-semibold">Website</span>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className={input} /></label>
                <label className="grid gap-1.5"><span className="text-[13px] font-semibold">Billing email</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={input} /></label>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <Preview tier={tier} name={name} />
              <div className="rounded-2xl border border-rule p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted">{plan.name} — one-time</span><b>${plan.price}</b></div>
                <div className="flex justify-between text-muted"><span>Placement</span><span>{location ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : "—"}</span></div>
                <div className="mt-2 flex justify-between border-t border-rule pt-2 font-semibold"><span>Total due</span><span>${plan.price}.00</span></div>
              </div>
              <p className="text-xs text-faint">Stripe-compatible checkout. Without STRIPE_SECRET_KEY the app runs a demo checkout so the flow stays testable.</p>
            </div>
          )}
        </div>

        {!done && (
          <div className="flex items-center justify-between gap-2 border-t border-rule px-5 py-4">
            <button onClick={() => (step === 0 ? onClose() : setStep(step - 1))} className="h-11 rounded-xl border border-rule px-4 text-sm font-medium hover:border-muted">
              Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={(step === 0 && !location) || (step === 2 && name.trim().length < 2)}
                className="h-11 rounded-xl bg-ink px-5 text-sm font-medium text-white hover:brightness-125 disabled:opacity-40"
              >
                Continue →
              </button>
            ) : (
              <button onClick={checkout} disabled={busy} className="flex h-11 items-center gap-2 rounded-xl bg-ember px-6 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Pay ${plan.price} & publish
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

const input = "h-11 w-full rounded-xl border border-rule bg-panel px-3.5 text-sm outline-none transition focus:border-ink";

function Preview({ tier, name }: { tier: SponsoredTier; name: string }) {
  const plan = PROMOTION_PLANS.find((p) => p.tier === tier)!;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gold/60 bg-gold/[.07] p-3.5">
      <SponsoredMarker placement={{ id: "pv", businessId: "", tier, lat: 0, lng: 0, label: "" }} brand="#E4562A" />
      <div className="text-[13px]">
        <b>{name || "Your business"} · {plan.name}</b>
        <p className="text-muted">{plan.blurb}</p>
      </div>
    </div>
  );
}
