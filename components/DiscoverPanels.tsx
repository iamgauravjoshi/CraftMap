"use client";

import { BUSINESSES } from "@/lib/data";
import { initials } from "@/lib/utils";
import type { Maker, Meetup } from "@/lib/types";
import { Flame, MapPin, Sparkles } from "lucide-react";

/* Right-side discovery rail: trending makers, featured businesses, meetups. */

interface Props {
  trending: Maker[];
  meetups: Meetup[];
  onPickMaker: (id: string) => void;
  onPickBusiness: (id: string) => void;
  onParkBusiness: () => void;
}

export default function DiscoverPanels({ trending, meetups, onPickMaker, onPickBusiness, onParkBusiness }: Props) {
  return (
    <div className="pointer-events-auto absolute right-3 top-32 z-[800] hidden w-[280px] flex-col gap-2.5 xl:flex">
      <div className="rounded-2xl border border-rule bg-panel/95 p-3.5 shadow-soft backdrop-blur">
        <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[.08em] text-faint">
          <Flame className="h-3.5 w-3.5 text-ember" /> Trending makers
        </p>
        <ul className="grid gap-1">
          {trending.slice(0, 4).map((m) => (
            <li key={m.id}>
              <button onClick={() => onPickMaker(m.id)} className="flex w-full items-center gap-2.5 rounded-xl px-1.5 py-1.5 text-left transition hover:bg-panel2">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: m.color }}>
                  {initials(m.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[13.5px]">{m.name}</b>
                  <small className="block truncate text-xs text-muted">{m.role} · {m.city}</small>
                </span>
                <span className="font-mono text-[11px] text-live">▲ {(m.followers / 1000).toFixed(1)}k</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-gold/60 bg-panel/95 p-3.5 shadow-soft backdrop-blur">
        <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[.08em] text-faint">
          <Sparkles className="h-3.5 w-3.5 text-gold" /> Featured businesses
        </p>
        <ul className="grid gap-1">
          {BUSINESSES.slice(0, 3).map((b) => (
            <li key={b.id}>
              <button onClick={() => onPickBusiness(b.id)} className="flex w-full items-center gap-2.5 rounded-xl px-1.5 py-1.5 text-left transition hover:bg-panel2">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] text-base text-white" style={{ background: b.color }}>🚀</span>
                <span className="min-w-0">
                  <b className="block truncate text-[13.5px]">{b.name}</b>
                  <small className="block truncate text-xs text-muted">{b.mrr} MRR · {b.city}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={onParkBusiness}
          className="mt-2.5 w-full rounded-xl bg-ink py-2.5 text-[13px] font-semibold text-white transition hover:brightness-125"
        >
          🛥️ Park your business — from $9
        </button>
      </div>

      <div className="rounded-2xl border border-rule bg-panel/95 p-3.5 shadow-soft backdrop-blur">
        <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[.08em] text-faint">
          <MapPin className="h-3.5 w-3.5 text-teal" /> Upcoming meetups
        </p>
        <ul className="grid gap-1.5">
          {meetups.slice(0, 3).map((e) => (
            <li key={e.id} className="rounded-xl bg-panel2 px-2.5 py-2 text-[13px]">
              <b className="block truncate text-[13px]">{e.title}</b>
              <small className="text-xs text-muted">{e.date} · {e.attendees} going</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
