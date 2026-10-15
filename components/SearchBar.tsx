"use client";

import { Loader2, Search, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  loading?: boolean;
  suggestions: { id: string; title: string; sub: string; kind: string }[];
  onPickSuggestion: (id: string, kind: string) => void;
}

const EXAMPLES = ["AI founders in Bangalore", "Designers in London", "Devs building SaaS", "Fintech in Lagos", "Meetups in Berlin"];

export default function SearchBar({ value, onChange, onSubmit, loading, suggestions, onPickSuggestion }: Props) {
  const [open, setOpen] = useState(false);
  const [example, setExample] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setExample((e) => (e + 1) % EXAMPLES.length), 3200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const showDrop = open && (suggestions.length > 0 || value.trim().length > 0);

  return (
    <div ref={boxRef} className="pointer-events-auto relative mx-auto w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
          onSubmit(value);
        }}
        className="flex h-[52px] items-center gap-2 rounded-full border border-rule bg-panel/95 py-0 pl-5 pr-2 shadow-pop backdrop-blur transition focus-within:border-ink"
      >
        {loading ? (
          <Loader2 className="h-[18px] w-[18px] animate-spin text-muted" />
        ) : (
          <Search className="h-[18px] w-[18px] flex-none text-muted" />
        )}
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={`Search or ask the map — “${EXAMPLES[example]}”`}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
          aria-label="Search the map"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="grid h-8 w-8 flex-none place-items-center rounded-full text-muted hover:bg-panel2 hover:text-ink"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="flex h-10 flex-none items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-white transition hover:brightness-125"
        >
          <Sparkles className="h-4 w-4" /> Ask
        </button>
      </form>

      {showDrop && (
        <div className="float-in absolute inset-x-0 top-[58px] overflow-hidden rounded-2xl border border-rule bg-panel shadow-pop">
          {suggestions.length > 0 ? (
            <ul className="max-h-[320px] overflow-y-auto p-2">
              {suggestions.map((s) => (
                <li key={`${s.kind}:${s.id}`}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      onPickSuggestion(s.id, s.kind);
                    }}
                    className="grid w-full grid-cols-[36px_minmax(0,1fr)] items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-panel2"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-panel2 text-xs font-semibold text-muted">
                      {s.kind === "maker" ? "👩‍💻" : s.kind === "business" ? "🚀" : "📍"}
                    </span>
                    <span className="min-w-0">
                      <b className="block truncate text-sm font-medium">{s.title}</b>
                      <small className="block truncate text-xs text-muted">{s.sub}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3">
              <p className="px-2 pb-1 font-mono text-[11px] uppercase tracking-wider text-faint">Try asking</p>
              <div className="flex flex-wrap gap-1.5 px-1 pb-1">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      setOpen(false);
                      onSubmit(ex);
                    }}
                    className="rounded-full border border-rule bg-ground px-3 py-1.5 text-[13px] transition hover:border-muted"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
