"use client";

import { initials } from "@/lib/utils";
import type { Business, Maker, Meetup } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Rocket, Users, X } from "lucide-react";

interface Props {
  open: boolean;
  interpretation: string;
  makers: Maker[];
  businesses: Business[];
  meetups: Meetup[];
  onClose: () => void;
  onPickMaker: (id: string) => void;
  onPickBusiness: (id: string) => void;
  onPickMeetup: (id: string) => void;
}

export default function SearchResults({
  open,
  interpretation,
  makers,
  businesses,
  meetups,
  onClose,
  onPickMaker,
  onPickBusiness,
  onPickMeetup,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: -340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -340, opacity: 0 }}
          transition={{ type: "spring", damping: 32, stiffness: 320 }}
          className="absolute bottom-20 left-3 top-32 z-[900] flex w-[min(360px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-rule bg-panel shadow-pop sm:bottom-6 sm:left-5 sm:top-48"
        >
          <div className="flex items-start justify-between gap-2 border-b border-rule px-4 py-3.5">
            <div>
              <h2 className="font-display text-[17px] font-bold leading-tight">Results</h2>
              <p className="mt-0.5 text-[13px] text-muted">{interpretation}</p>
            </div>
            <button onClick={onClose} className="grid h-8 w-8 flex-none place-items-center rounded-full text-muted transition hover:bg-panel2 hover:text-ink" aria-label="Close results">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {makers.length > 0 && (
              <ResultGroup icon={<Users className="h-3.5 w-3.5" />} title={`Makers (${makers.length})`}>
                {makers.map((m) => (
                  <button key={m.id} onClick={() => onPickMaker(m.id)} className="grid w-full grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-panel2">
                    <span className="grid h-10 w-10 place-items-center rounded-full text-xs font-bold text-white" style={{ background: m.color }}>
                      {initials(m.name)}
                    </span>
                    <span className="min-w-0">
                      <b className="block truncate text-sm">{m.name}</b>
                      <small className="block truncate text-xs text-muted">{m.role} · {m.city}</small>
                    </span>
                  </button>
                ))}
              </ResultGroup>
            )}
            {businesses.length > 0 && (
              <ResultGroup icon={<Rocket className="h-3.5 w-3.5" />} title={`Products (${businesses.length})`}>
                {businesses.map((b) => (
                  <button key={b.id} onClick={() => onPickBusiness(b.id)} className="grid w-full grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-panel2">
                    <span className="grid h-10 w-10 place-items-center rounded-[10px] text-lg text-white" style={{ background: b.color }}>🚀</span>
                    <span className="min-w-0">
                      <b className="block truncate text-sm">{b.name}</b>
                      <small className="block truncate text-xs text-muted">{b.tagline}</small>
                    </span>
                  </button>
                ))}
              </ResultGroup>
            )}
            {meetups.length > 0 && (
              <ResultGroup icon={<MapPin className="h-3.5 w-3.5" />} title={`Meetups (${meetups.length})`}>
                {meetups.map((e) => (
                  <button key={e.id} onClick={() => onPickMeetup(e.id)} className="grid w-full grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-panel2">
                    <span className="grid h-10 w-10 place-items-center rounded-[10px] border-2 border-ember bg-white text-lg">📅</span>
                    <span className="min-w-0">
                      <b className="block truncate text-sm">{e.title}</b>
                      <small className="block truncate text-xs text-muted">{e.date} · {e.city}</small>
                    </span>
                  </button>
                ))}
              </ResultGroup>
            )}
            {makers.length + businesses.length + meetups.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted">No matches. Try a city, skill or category.</p>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function ResultGroup({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="flex items-center gap-1.5 px-3 pb-1 pt-2 font-mono text-[11px] uppercase tracking-[.08em] text-faint">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}
