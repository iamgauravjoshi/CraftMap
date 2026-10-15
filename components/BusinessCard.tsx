"use client";

import { getFavorites, toggleFavorite } from "@/lib/utils";
import type { Business, SponsoredTier } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Heart, MapPin, TrendingUp, Users, X } from "lucide-react";
import { useState } from "react";
import { TIER_EMOJI } from "./markers";

interface Props {
  business: Business | null;
  founderName?: string;
  sponsoredTier?: SponsoredTier | null;
  onClose: () => void;
}

export default function BusinessCard({ business, founderName, sponsoredTier, onClose }: Props) {
  const [favs, setFavs] = useState<string[]>(() => (typeof window === "undefined" ? [] : getFavorites()));

  return (
    <AnimatePresence>
      {business && (
        <motion.aside
          key={business.id}
          initial={{ x: -340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -340, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute bottom-20 left-3 top-32 z-[901] flex w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-rule bg-panel shadow-pop sm:bottom-6 sm:left-5 sm:top-48"
        >
          <div className="relative px-5 pb-4 pt-5" style={{ background: `${business.color}14` }}>
            <button
              onClick={onClose}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-panel text-muted shadow-soft transition hover:text-ink"
              aria-label="Close product"
            >
              <X className="h-4 w-4" />
            </button>
            {sponsoredTier && (
              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-ink">
                {TIER_EMOJI[sponsoredTier]} Sponsored · {sponsoredTier}
              </span>
            )}
            <div className="flex items-start gap-3">
              <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl text-2xl text-white shadow-soft" style={{ background: business.color }}>
                🚀
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-[22px] font-bold leading-tight">{business.name}</h2>
                <p className="text-[13.5px] text-muted">{business.tagline}</p>
                <p className="mt-1 flex items-center gap-1 text-[13px] text-muted">
                  <MapPin className="h-3.5 w-3.5" /> {business.city}, {business.country}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-ink/90">{business.description}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-panel2 px-3 py-2.5">
                <div className="flex items-center gap-1 text-[11px] text-muted"><TrendingUp className="h-3.5 w-3.5" /> MRR</div>
                <b className="font-display text-lg">{business.mrr}</b>
              </div>
              <div className="rounded-xl bg-panel2 px-3 py-2.5">
                <div className="flex items-center gap-1 text-[11px] text-muted"><Users className="h-3.5 w-3.5" /> Users</div>
                <b className="font-display text-lg">{business.users}</b>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[.08em] text-faint">Details</h3>
              <dl className="grid gap-1.5 text-[13.5px]">
                <div className="flex justify-between gap-3"><dt className="text-muted">Category</dt><dd className="font-medium">{business.category}</dd></div>
                {founderName && <div className="flex justify-between gap-3"><dt className="text-muted">Founder</dt><dd className="font-medium">{founderName}</dd></div>}
                <div className="flex justify-between gap-3"><dt className="text-muted">Website</dt><dd className="max-w-[180px] truncate font-medium text-ember">{business.website.replace("https://", "")}</dd></div>
              </dl>
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href={business.website}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-ember text-sm font-semibold text-white transition hover:brightness-110"
              >
                Visit product <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => setFavs(toggleFavorite(business.id))}
                className={`grid h-11 w-11 place-items-center rounded-xl border transition ${
                  favs.includes(business.id) ? "border-ember bg-ember/10 text-ember" : "border-rule text-muted hover:text-ink"
                }`}
                aria-label="Save product"
              >
                <Heart className={`h-4 w-4 ${favs.includes(business.id) ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* screenshots placeholder */}
            <h3 className="mb-2 mt-5 font-mono text-[11px] font-medium uppercase tracking-[.08em] text-faint">Screenshots</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="grid h-28 w-44 flex-none place-items-center rounded-xl border border-rule text-3xl"
                  style={{ background: `linear-gradient(135deg, ${business.color}22, ${business.color}44)` }}
                >
                  🖼️
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
