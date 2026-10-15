"use client";

import { CITIES, INTERESTS } from "@/lib/data";
import { avatarColor } from "@/lib/utils";
import type { Maker } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, MapPin, X } from "lucide-react";
import { useState } from "react";
import { PersonMarker } from "./markers";

interface Props {
  open: boolean;
  onClose: () => void;
  onPublish: (maker: Maker) => void;
}

const STEPS = ["Profile", "Location", "Interests", "Product", "Preview"];

export default function OnboardingFlow({ open, onClose, onPublish }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Indie Hacker");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState(CITIES[9].name);
  const [picked, setPicked] = useState<string[]>(["AI", "SaaS"]);
  const [product, setProduct] = useState("");

  if (!open) return null;
  const cityObj = CITIES.find((c) => c.name === city) ?? CITIES[0];
  const validProfile = name.trim().length >= 2 && bio.trim().length >= 10;

  const draft: Maker = {
    id: `me-${Date.now()}`,
    name: name || "Your Name",
    username: (name || "you").toLowerCase().replace(/[^a-z0-9]+/g, ""),
    role,
    bio: bio || "I build delightful things on the internet.",
    city: cityObj.name,
    country: cityObj.country,
    lat: cityObj.lat + 0.02,
    lng: cityObj.lng + 0.02,
    skills: [role],
    interests: picked,
    category: picked[0] ?? "SaaS",
    socials: { x: "https://x.com/you", website: "https://you.dev" },
    joinedAt: new Date().toISOString().slice(0, 10),
    followers: 0,
    building: product ? [product] : [],
    activity: [{ text: "Just joined the map 👋", when: "now" }],
    color: avatarColor(name || "you"),
  };

  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-rule bg-panel shadow-pop"
      >
        <div className="flex items-center justify-between border-b border-rule px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold">Add yourself to the map</h2>
            <p className="font-mono text-[11px] uppercase tracking-wider text-faint">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-panel2 hover:text-ink" aria-label="Close onboarding">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-1 bg-panel2">
          <div className="h-full bg-ember transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <Step key="s0">
                <Field label="Your name">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" className={input} />
                </Field>
                <Field label="What do you do?">
                  <select value={role} onChange={(e) => setRole(e.target.value)} className={input}>
                    {["Indie Hacker", "AI Founder", "SaaS Founder", "Designer", "Mobile Dev", "DevTools Maker", "Fintech Builder", "Game Dev"].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="One-line bio (min 10 chars)">
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Building tiny tools for big problems…" rows={3} className={input} />
                </Field>
              </Step>
            )}
            {step === 1 && (
              <Step key="s1">
                <Field label="Where are you building from?">
                  <select value={city} onChange={(e) => setCity(e.target.value)} className={input}>
                    {CITIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}, {c.country}</option>
                    ))}
                  </select>
                </Field>
                <p className="flex items-center gap-1.5 rounded-xl bg-panel2 px-3.5 py-3 text-[13px] text-muted">
                  <MapPin className="h-4 w-4" /> Your marker drops near {cityObj.name} — you can fine-tune later.
                </p>
              </Step>
            )}
            {step === 2 && (
              <Step key="s2">
                <Field label="Pick at least one interest">
                  <div className="flex flex-wrap gap-1.5">
                    {INTERESTS.map((i) => (
                      <button
                        key={i}
                        onClick={() => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))}
                        className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
                          picked.includes(i) ? "border-ember bg-ember text-white" : "border-rule hover:border-muted"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </Field>
              </Step>
            )}
            {step === 3 && (
              <Step key="s3">
                <Field label="What are you building? (optional)">
                  <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="My awesome product" className={input} />
                </Field>
                <p className="rounded-xl bg-panel2 px-3.5 py-3 text-[13px] text-muted">
                  Products get their own markers and show up under the Products tab.
                </p>
              </Step>
            )}
            {step === 4 && (
              <Step key="s4">
                <p className="text-[13.5px] text-muted">This is how you&apos;ll appear on the map:</p>
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-rule p-4">
                  <PersonMarker maker={draft} size={52} />
                  <div className="min-w-0">
                    <b className="font-display text-lg">{draft.name}</b>
                    <p className="truncate text-[13px] text-muted">{draft.role} · {draft.city}</p>
                    <p className="mt-1 line-clamp-2 text-[13px]">{draft.bio}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {draft.interests.map((i) => (
                    <span key={i} className="rounded-full bg-panel2 px-2.5 py-1 text-xs font-medium">{i}</span>
                  ))}
                </div>
              </Step>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-rule px-5 py-4">
          <button
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-rule px-4 text-sm font-medium transition hover:border-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !validProfile}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-ink px-5 text-sm font-medium text-white transition hover:brightness-125 disabled:opacity-40"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onPublish(draft);
                onClose();
              }}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-ember px-5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <Check className="h-4 w-4" /> Publish my marker
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const input =
  "h-11 w-full rounded-xl border border-rule bg-panel px-3.5 text-sm outline-none transition focus:border-ink";

function Step({ children }: { children: React.ReactNode }) {
  return <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-4">{children}</motion.div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[13px] font-semibold">{label}</span>
      {children}
    </label>
  );
}
