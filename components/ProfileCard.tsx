"use client";

import { nearbyMakers } from "@/lib/search";
import { getFavorites, initials, timeAgo, toggleFavorite } from "@/lib/utils";
import type { Maker } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  CalendarDays,
  Check,
  Flag,
  Globe,
  Heart,
  Link2,
  MapPin,
  Share2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  maker: Maker | null;
  onClose: () => void;
  onFollow: (id: string) => void;
  following: string[];
  onOpenBusiness: (id: string) => void;
  onShare: (maker: Maker) => void;
}

export default function ProfileCard({ maker, onClose, onFollow, following, onOpenBusiness, onShare }: Props) {
  const [favs, setFavs] = useState<string[]>(() => (typeof window === "undefined" ? [] : getFavorites()));
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);

  const nearby = useMemo(() => (maker ? nearbyMakers(maker.lat, maker.lng, 5, maker.id) : []), [maker]);

  return (
    <AnimatePresence>
      {maker && (
        <motion.aside
          key={maker.id}
          initial={{ x: -340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -340, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute bottom-20 left-3 top-32 z-[901] flex w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-rule bg-panel shadow-pop sm:bottom-6 sm:left-5 sm:top-48"
        >
          {/* header */}
          <div className="relative bg-gradient-to-br from-panel2 to-ground px-5 pb-4 pt-5">
            <button
              onClick={onClose}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-panel text-muted shadow-soft transition hover:text-ink"
              aria-label="Close profile"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3.5">
              <div
                className="grid h-16 w-16 flex-none place-items-center rounded-full border-[3px] border-white text-xl font-bold text-white shadow-soft"
                style={{ background: maker.color }}
              >
                {initials(maker.name)}
              </div>
              <div className="min-w-0 pt-0.5">
                <h2 className="font-display text-[22px] font-bold leading-tight">{maker.name}</h2>
                <span className="font-mono text-xs text-muted">@{maker.username}</span>
                <p className="mt-1 flex items-center gap-1 text-[13px] text-muted">
                  <MapPin className="h-3.5 w-3.5" /> {maker.city}, {maker.country}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[14px] leading-snug">{maker.bio}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium">
              <Briefcase className="h-3.5 w-3.5 text-muted" /> {maker.role}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onFollow(maker.id)}
                className={`h-10 flex-1 rounded-xl text-sm font-semibold transition active:scale-[.97] ${
                  following.includes(maker.id) ? "bg-live text-white" : "bg-ember text-white hover:brightness-110"
                }`}
              >
                {following.includes(maker.id) ? (
                  <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4" /> Following</span>
                ) : (
                  "Follow"
                )}
              </button>
              <button
                onClick={() => setFavs(toggleFavorite(maker.id))}
                className={`grid h-10 w-10 place-items-center rounded-xl border transition ${
                  favs.includes(maker.id) ? "border-ember bg-ember/10 text-ember" : "border-rule text-muted hover:text-ink"
                }`}
                aria-label="Save"
                title="Save"
              >
                <Heart className={`h-4 w-4 ${favs.includes(maker.id) ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={() => {
                  setCopied(true);
                  onShare(maker);
                  setTimeout(() => setCopied(false), 1600);
                }}
                className="grid h-10 w-10 place-items-center rounded-xl border border-rule text-muted transition hover:text-ink"
                aria-label="Share profile"
                title="Copy profile URL"
              >
                {copied ? <Check className="h-4 w-4 text-live" /> : <Link2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setReported(true)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-rule text-muted transition hover:text-ink"
                aria-label="Report profile"
                title="Report"
              >
                <Flag className="h-4 w-4" />
              </button>
            </div>
            {reported && (
              <p className="mt-2 rounded-lg bg-panel2 px-3 py-2 text-xs text-muted">
                Thanks — our team will review this profile.
              </p>
            )}

            {/* stats */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { v: maker.followers >= 1000 ? `${(maker.followers / 1000).toFixed(1)}k` : String(maker.followers), l: "followers" },
                { v: String(maker.building.length), l: "products" },
                { v: maker.activity.length.toString(), l: "updates" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-panel2 px-2 py-2.5 text-center">
                  <b className="font-display text-lg leading-none">{s.v}</b>
                  <div className="mt-0.5 text-[11px] text-muted">{s.l}</div>
                </div>
              ))}
            </div>

            {/* skills */}
            <Section title="Skills & interests">
              <div className="flex flex-wrap gap-1.5">
                {[...maker.skills, ...maker.interests].map((s) => (
                  <span key={s} className="rounded-full border border-rule bg-ground px-2.5 py-1 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </Section>

            {/* links */}
            <Section title="Links">
              <div className="flex flex-wrap gap-1.5">
                {maker.socials.x && <LinkChip href={maker.socials.x} label="X / Twitter" />}
                {maker.socials.github && <LinkChip href={maker.socials.github} label="GitHub" />}
                {maker.socials.website && <LinkChip href={maker.socials.website} label="Website" />}
              </div>
            </Section>

            {/* building */}
            <Section title="Building now">
              {maker.building.map((b) => (
                <button
                  key={b}
                  onClick={() => onOpenBusiness(b)}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-rule px-3 py-2.5 text-left transition hover:border-muted"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-panel2 text-lg">🚀</span>
                  <span>
                    <b className="block text-sm">{b}</b>
                    <small className="text-xs text-muted">View product →</small>
                  </span>
                </button>
              ))}
            </Section>

            {/* activity */}
            <Section title="Recent activity">
              <ul className="grid gap-2">
                {maker.activity.map((a, i) => (
                  <li key={i} className="rounded-xl bg-panel2 px-3 py-2.5 text-[13px]">
                    {a.text}
                    <span className="mt-0.5 block font-mono text-[11px] text-faint">{a.when}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* nearby */}
            {nearby.length > 0 && (
              <Section title="Nearby makers">
                <ul className="grid gap-1">
                  {nearby.slice(0, 4).map((n) => (
                    <li key={n.id} className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 text-[13px]">
                      <span
                        className="grid h-8 w-8 flex-none place-items-center rounded-full text-[11px] font-bold text-white"
                        style={{ background: n.color }}
                      >
                        {initials(n.name)}
                      </span>
                      <span className="min-w-0">
                        <b className="block truncate font-medium">{n.name}</b>
                        <small className="block truncate text-muted">{n.city} · {n.role}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <p className="flex items-center gap-1.5 pb-2 pt-1 font-mono text-[11px] text-faint">
              <CalendarDays className="h-3.5 w-3.5" /> Joined {maker.joinedAt} · {timeAgo(maker.joinedAt)}
            </p>
            <button
              onClick={() => onShare(maker)}
              className="mb-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-rule py-2.5 text-[13px] font-medium transition hover:border-muted"
            >
              <Share2 className="h-4 w-4" /> Share profile
            </button>
            <p className="flex items-center gap-1 pb-1 pt-1 text-[11px] text-faint">
              <Globe className="h-3 w-3" /> craftmap.example/m/{maker.username}
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[.08em] text-faint">{title}</h3>
      {children}
    </div>
  );
}

function LinkChip({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white transition hover:brightness-125"
    >
      {label} ↗
    </a>
  );
}
