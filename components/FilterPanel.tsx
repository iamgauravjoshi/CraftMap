"use client";

import { CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface Filters {
  category: string | null;
  location: string | null;
  favoritesOnly: boolean;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  locations: string[];
}

/* NOTE: the chip row scrolls horizontally (overflow-x-auto), which clips any
   absolutely-positioned dropdown in the Y axis. So the open panel is rendered
   `fixed` at the button's viewport rect instead of nested inside the row. */
export default function FilterPanel({ filters, onChange, locations }: Props) {
  const [open, setOpen] = useState<"category" | "location" | null>(null);
  const [anchor, setAnchor] = useState<{ left: number; top?: number; bottom?: number; width: number } | null>(null);
  const catRef = useRef<HTMLButtonElement>(null);
  const locRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggle = (which: "category" | "location") => {
    if (open === which) {
      setOpen(null);
      return;
    }
    const btn = which === "category" ? catRef.current : locRef.current;
    if (btn) {
      const r = btn.getBoundingClientRect();
      const width = Math.max(r.width, 200);
      const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
      // Flip upward when there isn't room below.
      if (r.bottom + 288 > window.innerHeight) {
        setAnchor({ left, bottom: Math.max(8, window.innerHeight - r.top + 8), width });
      } else {
        setAnchor({ left, top: r.bottom + 8, width });
      }
    }
    setOpen(which);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (catRef.current?.contains(t) || locRef.current?.contains(t)) return;
      setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const options = open === "category" ? CATEGORIES : locations;
  const current = open === "category" ? filters.category : filters.location;

  const pick = (v: string) => {
    if (open === "category") onChange({ ...filters, category: filters.category === v ? null : v });
    else onChange({ ...filters, location: filters.location === v ? null : v });
    setOpen(null);
  };

  return (
    <>
      <div className="pointer-events-auto flex max-w-full items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          ref={catRef}
          onClick={() => toggle("category")}
          aria-expanded={open === "category"}
          className={cn(
            "flex h-9 flex-none items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium shadow-soft backdrop-blur transition",
            filters.category
              ? "border-ink bg-ink text-white"
              : "border-rule bg-panel/95 hover:border-muted",
          )}
        >
          {filters.category ?? "Category"} <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          ref={locRef}
          onClick={() => toggle("location")}
          aria-expanded={open === "location"}
          className={cn(
            "flex h-9 flex-none items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium shadow-soft backdrop-blur transition",
            filters.location
              ? "border-ink bg-ink text-white"
              : "border-rule bg-panel/95 hover:border-muted",
          )}
        >
          {filters.location ?? "Location"} <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
          className={cn(
            "h-9 flex-none rounded-full border px-3.5 text-[13px] font-medium shadow-soft backdrop-blur transition",
            filters.favoritesOnly
              ? "border-ember bg-ember text-white"
              : "border-rule bg-panel/95 text-ink hover:border-muted",
          )}
        >
          ♥ Saved
        </button>
        {(filters.category || filters.location || filters.favoritesOnly) && (
          <button
            onClick={() => onChange({ category: null, location: null, favoritesOnly: false })}
            className="h-9 flex-none rounded-full px-2 text-[13px] font-medium text-muted transition hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>

      {open && anchor && (
        <div
          ref={panelRef}
          className="float-in fixed z-[1000] max-h-64 overflow-y-auto rounded-xl border border-rule bg-panel p-1.5 shadow-pop"
          style={{ left: anchor.left, top: anchor.top, bottom: anchor.bottom, width: anchor.width }}
          role="listbox"
          aria-label={open === "category" ? "Filter by category" : "Filter by location"}
        >
          {options.map((o) => {
            const selected = current === o;
            return (
              <button
                key={o}
                role="option"
                aria-selected={selected}
                onClick={() => pick(o)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition hover:bg-panel2",
                  selected && "font-semibold",
                )}
              >
                {o}
                {selected && <Check className="h-4 w-4 flex-none text-ember" />}
              </button>
            );
          })}
          {options.length === 0 && (
            <p className="px-2.5 py-3 text-[13px] text-muted">No options yet.</p>
          )}
        </div>
      )}
    </>
  );
}
