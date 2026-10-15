"use client";

import { signInWithEmail, signInWithProvider } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { Github, Loader2, Mail, X } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSignedIn: (name: string) => void;
}

export default function AuthenticationModal({ open, onClose, onSignedIn }: Props) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const oauth = async (p: "google" | "github" | "twitter") => {
    setBusy(p);
    try {
      await signInWithProvider(p);
      onSignedIn(p === "google" ? "Google Maker" : p === "github" ? "GitHub Maker" : "X Maker");
      onClose();
    } finally {
      setBusy(null);
    }
  };

  const magic = async () => {
    if (!email.includes("@")) return;
    setBusy("email");
    try {
      await signInWithEmail(email);
      setSent(true);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1100] grid place-items-center bg-ink/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] rounded-2xl border border-rule bg-panel p-6 shadow-pop"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="flex items-center gap-2 font-display text-xl font-bold">
                  <span className="h-2.5 w-2.5 rounded-full bg-ember" /> Join CraftMap
                </p>
                <p className="mt-1 text-[13.5px] text-muted">Pin yourself on the map in under a minute.</p>
              </div>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-panel2 hover:text-ink" aria-label="Close login">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-2">
              <OAuthBtn busy={busy === "google"} onClick={() => oauth("google")} icon={<span className="font-bold">G</span>} label="Continue with Google" />
              <OAuthBtn busy={busy === "github"} onClick={() => oauth("github")} icon={<Github className="h-4 w-4" />} label="Continue with GitHub" dark />
              <OAuthBtn busy={busy === "twitter"} onClick={() => oauth("twitter")} icon={<span className="font-bold">𝕏</span>} label="Continue with X" dark />
            </div>

            <div className="my-4 flex items-center gap-3 text-xs text-faint">
              <span className="h-px flex-1 bg-rule" /> or with email <span className="h-px flex-1 bg-rule" />
            </div>

            {sent ? (
              <p className="rounded-xl bg-live/10 px-3.5 py-3 text-[13.5px] text-ink">
                ✉️ Magic link sent to <b>{email}</b> — check your inbox.
              </p>
            ) : (
              <div className="flex gap-2">
                <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-rule px-3 focus-within:border-ink">
                  <Mail className="h-4 w-4 flex-none text-muted" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && magic()}
                    placeholder="you@example.com"
                    type="email"
                    className="h-full w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <button onClick={magic} disabled={busy === "email"} className="h-11 rounded-xl bg-ink px-4 text-sm font-medium text-white transition hover:brightness-125 disabled:opacity-60">
                  {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </button>
              </div>
            )}
            <p className="mt-4 text-center text-[11.5px] text-faint">
              Demo mode works without keys. Connect Supabase to enable real auth.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OAuthBtn({ icon, label, onClick, dark, busy }: { icon: React.ReactNode; label: string; onClick: () => void; dark?: boolean; busy?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition active:scale-[.98] ${
        dark ? "border-ink bg-ink text-white hover:brightness-125" : "border-rule hover:border-muted"
      }`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : icon} {label}
    </button>
  );
}
