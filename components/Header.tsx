"use client";

import { cn } from "@/lib/utils";
import { Compass, Heart, MapPin, Plus, Rocket, Users } from "lucide-react";
import type { TabKey } from "@/lib/types";

interface Props {
  tab: TabKey;
  onTab: (t: TabKey) => void;
  makerCount: number;
  onLogin: () => void;
  onAddYourself: () => void;
  onContribute: () => void;
  onExplore: () => void;
  user: { name: string; color: string } | null;
}

const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: "people", label: "People", icon: Users },
  { key: "products", label: "Products", icon: Rocket },
  { key: "meetups", label: "Meetups", icon: MapPin },
];

export default function Header({ tab, onTab, makerCount, onLogin, onAddYourself, onContribute, onExplore, user }: Props) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-[900] flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="pointer-events-auto flex w-full max-w-[1500px] flex-wrap items-center gap-2">
        {/* Brand */}
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex h-11 items-center gap-2 rounded-full border border-rule bg-panel/95 py-0 pl-3 pr-4 shadow-soft backdrop-blur transition hover:border-muted"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-ember shadow-[0_0_0_3px_rgba(228,86,42,.22)]" />
          <span className="font-display text-[17px] font-bold tracking-tight">CraftMap</span>
        </a>

        {/* Tabs */}
        <nav className="flex items-center gap-0.5 rounded-full bg-panel2/90 p-1 shadow-soft backdrop-blur">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onTab(t.key)}
                aria-current={active}
                className={cn(
                  "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13.5px] font-medium transition",
                  active ? "bg-panel text-ink shadow-[0_1px_2px_rgba(0,0,0,.08)]" : "text-muted hover:text-ink"
                )}
              >
                <Icon className="h-[15px] w-[15px]" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden h-9 items-center gap-2 rounded-full border border-rule bg-ground px-3 font-mono text-xs text-muted xl:inline-flex">
            <span className="live-dot h-[7px] w-[7px] rounded-full bg-live" />
            <b className="font-medium text-ink">{makerCount.toLocaleString()}</b> builders live
          </span>
          <button
            onClick={onContribute}
            className="hidden h-11 items-center gap-1.5 rounded-full border border-rule bg-panel/95 px-4 text-[13.5px] font-medium shadow-soft backdrop-blur transition hover:border-muted sm:inline-flex"
          >
            <Heart className="h-4 w-4" /> Contribute
          </button>
          <button
            onClick={onExplore}
            className="hidden h-11 items-center gap-1.5 rounded-full border border-rule bg-panel/95 px-4 text-[13.5px] font-medium shadow-soft backdrop-blur transition hover:border-muted lg:inline-flex"
          >
            <Compass className="h-4 w-4" /> Explore
          </button>
          {user ? (
            <span
              className="flex h-11 items-center gap-2 rounded-full border border-rule bg-panel/95 py-0 pl-1.5 pr-4 shadow-soft backdrop-blur"
              title={user.name}
            >
              <span
                className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white"
                style={{ background: user.color }}
              >
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[110px] truncate text-[13.5px] font-medium">{user.name}</span>
            </span>
          ) : (
            <button
              onClick={onLogin}
              className="h-11 rounded-full border border-rule bg-panel/95 px-4 text-[13.5px] font-medium shadow-soft backdrop-blur transition hover:border-muted"
            >
              Log in
            </button>
          )}
          <button
            onClick={onAddYourself}
            className="flex h-11 items-center gap-1.5 rounded-full bg-ember px-4 text-[13.5px] font-semibold text-white shadow-soft transition hover:brightness-110 active:scale-[.97]"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add yourself</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
}
