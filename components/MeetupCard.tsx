"use client";

import type { Meetup } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, MapPin, Users, X } from "lucide-react";

export default function MeetupCard({ meetup, onClose }: { meetup: Meetup | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {meetup && (
        <motion.aside
          key={meetup.id}
          initial={{ x: -340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -340, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute bottom-20 left-3 top-32 z-[901] flex w-[min(360px,calc(100vw-24px))] flex-col gap-3 overflow-y-auto rounded-2xl border border-rule bg-panel p-5 shadow-pop sm:bottom-6 sm:left-5 sm:top-48"
        >
          <button onClick={onClose} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-panel2 text-muted transition hover:text-ink" aria-label="Close meetup">
            <X className="h-4 w-4" />
          </button>
          <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-ember bg-white text-2xl">📅</span>
          <div>
            <h2 className="font-display text-[22px] font-bold leading-tight">{meetup.title}</h2>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-muted"><MapPin className="h-3.5 w-3.5" /> {meetup.city}, {meetup.country}</p>
          </div>
          <div className="grid gap-1.5 text-[13.5px]">
            <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted" /> {meetup.date}</p>
            <p className="flex items-center gap-2"><Users className="h-4 w-4 text-muted" /> {meetup.attendees} going · hosted by {meetup.host}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {meetup.tags.map((t) => (
              <span key={t} className="rounded-full border border-rule bg-ground px-2.5 py-1 text-xs font-medium">{t}</span>
            ))}
          </div>
          <button className="mt-1 h-11 rounded-xl bg-ember text-sm font-semibold text-white transition hover:brightness-110">
            RSVP — save my spot
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
