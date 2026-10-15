"use client";

import { cn } from "@/lib/utils";
import type { Business, Maker, Meetup, SponsoredPlacement } from "@/lib/types";

/* Reusable marker visuals. MapLibre needs raw DOM nodes, so each marker ships
   both a React component (for lists/previews) and a DOM factory (for the map). */

export const TIER_EMOJI: Record<SponsoredPlacement["tier"], string> = {
  pin: "📍",
  boat: "⛵",
  ship: "🚢",
  yacht: "🛥️",
  landmark: "🗽",
};

export const TIER_SIZE: Record<SponsoredPlacement["tier"], number> = {
  pin: 30,
  boat: 38,
  ship: 48,
  yacht: 56,
  landmark: 64,
};

export function personMarkerHTML(m: Maker, size = 40, selected = false): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `cm-marker${selected ? " selected" : ""}`;
  el.innerHTML = `
    <div class="cm-avatar" style="width:${size}px;height:${size}px;background:${m.color};font-size:${Math.round(size * 0.36)}px" title="${m.name} — ${m.role}">
      ${m.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
    </div>`;
  return el;
}

export function businessMarkerHTML(b: Business, selected = false): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `cm-marker${selected ? " selected" : ""}`;
  el.innerHTML = `
    <div class="cm-avatar" style="width:34px;height:34px;background:${b.color};border-radius:10px;font-size:15px" title="${b.name} — ${b.tagline}">
      🚀
    </div>`;
  return el;
}

export function sponsoredMarkerHTML(s: SponsoredPlacement, brand: string, selected = false): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `cm-sponsored${selected ? " selected" : ""}`;
  const size = TIER_SIZE[s.tier];
  el.innerHTML = `
    <div style="position:relative;width:${size}px;height:${size}px">
      <div style="position:absolute;inset:0;border-radius:9999px;background:${brand}22;border:2px solid ${brand};display:grid;place-items:center;font-size:${Math.round(size * 0.52)}px;background-color:#fff" title="Sponsored · ${s.label}">
        ${TIER_EMOJI[s.tier]}
      </div>
      <span style="position:absolute;right:-4px;top:-4px;background:#D9A21B;color:#1B1F24;font-size:9px;font-weight:700;font-family:monospace;padding:1px 5px;border-radius:999px;border:1.5px solid #fff">AD</span>
    </div>`;
  return el;
}

export function meetupMarkerHTML(e: Meetup): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "cm-marker";
  el.innerHTML = `
    <div style="display:grid;place-items:center;align-content:center;width:40px;height:40px;border-radius:12px;background:#fff;border:2px solid #E4562A;box-shadow:0 2px 8px rgba(27,31,36,.25);font-size:18px" title="${e.title} — ${e.date}">
      📅
    </div>`;
  return el;
}

export function clusterMarkerHTML(count: number): HTMLDivElement {
  const el = document.createElement("div");
  const size = count > 50 ? 52 : count > 15 ? 44 : 36;
  el.className = "cm-cluster";
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.textContent = count > 99 ? "99+" : String(count);
  return el;
}

/* React wrappers (used in previews, lists, onboarding) */

export function PersonMarker({ maker, size = 40, selected }: { maker: Maker; size?: number; selected?: boolean }) {
  return (
    <div className={cn("cm-marker", selected && "selected")}>
      <div
        className="cm-avatar"
        style={{ width: size, height: size, background: maker.color, fontSize: Math.round(size * 0.36) }}
      >
        {maker.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
      </div>
    </div>
  );
}

export function BusinessMarker({ business }: { business: Business }) {
  return (
    <div className="cm-marker">
      <div className="cm-avatar" style={{ width: 34, height: 34, background: business.color, borderRadius: 10 }}>
        🚀
      </div>
    </div>
  );
}

export function SponsoredMarker({ placement, brand }: { placement: SponsoredPlacement; brand: string }) {
  const size = TIER_SIZE[placement.tier];
  return (
    <div className="cm-sponsored">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="grid place-items-center rounded-full border-2 bg-white"
          style={{ width: size, height: size, borderColor: brand, fontSize: Math.round(size * 0.52) }}
        >
          {TIER_EMOJI[placement.tier]}
        </div>
        <span className="absolute -right-1 -top-1 rounded-full border-[1.5px] border-white bg-gold px-[5px] py-px font-mono text-[9px] font-bold">
          AD
        </span>
      </div>
    </div>
  );
}

export function MarkerCluster({ count }: { count: number }) {
  const size = count > 50 ? 52 : count > 15 ? 44 : 36;
  return (
    <div className="cm-cluster" style={{ width: size, height: size }}>
      {count > 99 ? "99+" : count}
    </div>
  );
}
