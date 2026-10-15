"use client";

import AuthenticationModal from "@/components/AuthenticationModal";
import BusinessCard from "@/components/BusinessCard";
import DiscoverPanels from "@/components/DiscoverPanels";
import FilterPanel, { type Filters } from "@/components/FilterPanel";
import Header from "@/components/Header";
import MapView, { type Selection } from "@/components/MapView";
import MeetupCard from "@/components/MeetupCard";
import OnboardingFlow from "@/components/OnboardingFlow";
import ProfileCard from "@/components/ProfileCard";
import PromotionPurchaseModal from "@/components/PromotionPurchaseModal";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { BUSINESSES, MAKERS as SEED_MAKERS, MEETUPS, SPONSORED as SEED_SPONSORED } from "@/lib/data";
import { parseQuery } from "@/lib/search";
import { getFavorites, saveMyProfile } from "@/lib/utils";
import type { Business, Maker, Meetup, SponsoredPlacement, TabKey } from "@/lib/types";
import { Check, MapPin, Plus, Rocket, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const Map = dynamic(() => import("@/components/MapView"), { ssr: false }) as typeof MapView;

export default function Home() {
  const [tab, setTab] = useState<TabKey>("people");
  const [query, setQuery] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [parsed, setParsed] = useState<ReturnType<typeof parseQuery> | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number; key: number } | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [filters, setFilters] = useState<Filters>({ category: null, location: null, favoritesOnly: false });
  const [authOpen, setAuthOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [pickLoc, setPickLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [user, setUser] = useState<{ name: string; color: string } | null>(null);
  const [extraMakers, setExtraMakers] = useState<Maker[]>([]);
  const [extraSponsored, setExtraSponsored] = useState<SponsoredPlacement[]>([]);
  const [extraBusinesses, setExtraBusinesses] = useState<Business[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Global Escape: close topmost layer first (modals > selection > results).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (promoOpen) setPromoOpen(false);
      else if (onboardingOpen) setOnboardingOpen(false);
      else if (authOpen) setAuthOpen(false);
      else if (selection) setSelection(null);
      else if (resultsOpen) setResultsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [promoOpen, onboardingOpen, authOpen, selection, resultsOpen]);

  const makers = useMemo(() => [...SEED_MAKERS, ...extraMakers], [extraMakers]);
  const businesses = useMemo(() => [...BUSINESSES, ...extraBusinesses], [extraBusinesses]);
  const sponsored = useMemo(() => [...SEED_SPONSORED, ...extraSponsored], [extraSponsored]);

  const locations = useMemo(() => [...new Set(makers.map((m) => m.city))].sort(), [makers]);

  // Favorites change outside React state (localStorage) — re-read only when
  // notified, so typing in search etc. doesn't rebuild the marker layer.
  const [favTick, setFavTick] = useState(0);
  useEffect(() => {
    const bump = () => setFavTick((t) => t + 1);
    window.addEventListener("craftmap:favorites-changed", bump);
    return () => window.removeEventListener("craftmap:favorites-changed", bump);
  }, []);
  const favs = useMemo(() => (typeof window === "undefined" ? [] : getFavorites()), [favTick]);

  const filteredMakers = useMemo(() => {
    let list = makers;
    if (parsed && resultsOpen && parsed.makers.length) {
      const ids = new Set(parsed.makers.map((m) => m.id));
      list = list.filter((m) => ids.has(m.id));
    }
    if (filters.category) list = list.filter((m) => m.category === filters.category || m.interests.includes(filters.category!));
    if (filters.location) list = list.filter((m) => m.city === filters.location);
    if (filters.favoritesOnly) list = list.filter((m) => favs.includes(m.id));
    return list;
  }, [makers, parsed, resultsOpen, filters, favs]);

  const filteredBusinesses = useMemo(() => {
    let list = businesses;
    if (parsed && resultsOpen && parsed.businesses.length) {
      const ids = new Set(parsed.businesses.map((b) => b.id));
      list = list.filter((b) => ids.has(b.id));
    }
    if (filters.category) list = list.filter((b) => b.category === filters.category);
    if (filters.location) list = list.filter((b) => b.city === filters.location);
    if (filters.favoritesOnly) list = list.filter((b) => favs.includes(b.id));
    return list;
  }, [businesses, parsed, resultsOpen, filters, favs]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const mk = makers.filter((m) => `${m.name} ${m.username} ${m.role} ${m.city} ${m.category}`.toLowerCase().includes(q)).slice(0, 3)
      .map((m) => ({ id: m.id, title: m.name, sub: `${m.role} · ${m.city}`, kind: "maker" }));
    const bz = businesses.filter((b) => `${b.name} ${b.tagline} ${b.category}`.toLowerCase().includes(q)).slice(0, 3)
      .map((b) => ({ id: b.id, title: b.name, sub: `${b.tagline}`, kind: "business" }));
    return [...mk, ...bz];
  }, [query, makers, businesses]);

  const selectedMaker: Maker | null = selection?.kind === "maker" ? makers.find((m) => m.id === selection.id) ?? null : null;
  const selectedBusiness: Business | null =
    selection?.kind === "business" ? businesses.find((b) => b.id === selection.id) ?? null : null;
  const selectedSponsored: SponsoredPlacement | null =
    selection?.kind === "sponsored" ? sponsored.find((s) => s.id === selection.id) ?? null : null;
  const sponsoredBusiness: Business | null = selectedSponsored
    ? businesses.find((b) => b.id === selectedSponsored.businessId) ?? extraBusinesses.find((b) => b.id === selectedSponsored.businessId) ?? null
    : null;
  const selectedMeetup: Meetup | null = selection?.kind === "meetup" ? MEETUPS.find((e) => e.id === selection.id) ?? null : null;

  const showToast = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(null), 2200);
  };

  const submitSearch = (q: string) => {
    const value = q.trim();
    if (!value) return;
    setSearching(true);
    setTimeout(() => {
      const r = parseQuery(value);
      setParsed(r);
      setResultsOpen(true);
      setSelection(null);
      if (r.focus) {
        setFlyTo({ lat: r.focus.lat, lng: r.focus.lng, zoom: r.focus.zoom, key: Date.now() });
      } else if (r.makers[0]) {
        setFlyTo({ lat: r.makers[0].lat, lng: r.makers[0].lng, zoom: 10, key: Date.now() });
      } else if (r.businesses[0]) {
        setFlyTo({ lat: r.businesses[0].lat, lng: r.businesses[0].lng, zoom: 10, key: Date.now() });
      }
      setSearching(false);
    }, 450);
  };

  const pickMaker = (id: string) => {
    const m = makers.find((x) => x.id === id);
    if (!m) return;
    setSelection({ kind: "maker", id });
    setResultsOpen(false);
    setFlyTo({ lat: m.lat, lng: m.lng, zoom: 11, key: Date.now() });
  };

  const pickBusiness = (id: string) => {
    const b = businesses.find((x) => x.id === id);
    if (!b) return;
    setSelection({ kind: "business", id });
    setResultsOpen(false);
    setFlyTo({ lat: b.lat, lng: b.lng, zoom: 11, key: Date.now() });
  };

  const openBusinessByName = (name: string, founderId?: string) => {
    const b = businesses.find((x) => x.name.toLowerCase() === name.toLowerCase())
      ?? (founderId ? businesses.find((x) => x.founderId === founderId) : undefined);
    if (b) {
      setTab("products");
      pickBusiness(b.id);
    } else {
      showToast(`“${name}” has no product page yet`);
    }
  };

  const follow = (id: string) =>
    setFollowing((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const share = async (m: Maker) => {
    const url = `${location.origin}/m/${m.username}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Profile URL copied ✓");
    } catch {
      showToast(url);
    }
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ocean">
      <Map
        makers={filteredMakers}
        businesses={filteredBusinesses}
        sponsored={sponsored}
        meetups={MEETUPS}
        tab={tab}
        selection={selection}
        flyTo={flyTo}
        pickMode={pickMode}
        onPickLocation={(lat, lng) => {
          setPickLoc({ lat, lng });
          setPickMode(false);
          setPromoOpen(true);
          showToast("Location selected — choose your tier");
        }}
        onSelect={setSelection}
      />

      <Header
        tab={tab}
        onTab={(t) => {
          setTab(t);
          setSelection(null);
        }}
        makerCount={makers.length * 84 + 1240}
        onLogin={() => setAuthOpen(true)}
        onAddYourself={() => setOnboardingOpen(true)}
        onContribute={() => setPromoOpen(true)}
        onExplore={() => {
          setSelection(null);
          setResultsOpen(false);
          setFlyTo({ lat: 25, lng: 20, zoom: 1.6, key: Date.now() });
        }}
        user={user}
      />

      {/* floating search + filters */}
      <div className="absolute inset-x-0 top-[72px] z-[900] flex flex-col items-center gap-2 px-3 sm:top-[76px]">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={submitSearch}
          loading={searching}
          suggestions={suggestions}
          onPickSuggestion={(id, kind) => (kind === "maker" ? pickMaker(id) : pickBusiness(id))}
        />
        <FilterPanel filters={filters} onChange={setFilters} locations={locations} />
      </div>

      <SearchResults
        open={resultsOpen}
        interpretation={parsed?.interpretation ?? ""}
        makers={parsed?.makers ?? []}
        businesses={parsed?.businesses ?? []}
        meetups={parsed?.meetups ?? []}
        onClose={() => setResultsOpen(false)}
        onPickMaker={pickMaker}
        onPickBusiness={pickBusiness}
        onPickMeetup={(id) => {
          setSelection({ kind: "meetup", id });
          setResultsOpen(false);
          const e = MEETUPS.find((x) => x.id === id);
          if (e) setFlyTo({ lat: e.lat, lng: e.lng, zoom: 11, key: Date.now() });
        }}
      />

      <ProfileCard
        maker={selectedMaker}
        onClose={() => setSelection(null)}
        onFollow={follow}
        following={following}
        onOpenBusiness={(name) => openBusinessByName(name, selectedMaker?.id)}
        onShare={share}
      />

      <BusinessCard
        business={selectedBusiness ?? sponsoredBusiness}
        founderName={
          selectedBusiness
            ? makers.find((m) => m.id === selectedBusiness.founderId)?.name
            : sponsoredBusiness
              ? makers.find((m) => m.id === sponsoredBusiness.founderId)?.name
              : undefined
        }
        sponsoredTier={selectedSponsored?.tier ?? null}
        onClose={() => setSelection(null)}
      />

      <MeetupCard meetup={selectedMeetup} onClose={() => setSelection(null)} />

      {!selectedMaker && !selectedBusiness && !sponsoredBusiness && !selectedMeetup && !resultsOpen && (
        <DiscoverPanels
          trending={makers.filter((m) => m.trending)}
          meetups={MEETUPS}
          onPickMaker={pickMaker}
          onPickBusiness={pickBusiness}
          onParkBusiness={() => setPromoOpen(true)}
        />
      )}

      {/* mobile bottom tab bar */}
      <nav className="absolute inset-x-3 bottom-3 z-[900] flex items-center justify-around rounded-2xl border border-rule bg-panel/95 py-2 shadow-pop backdrop-blur sm:hidden">
        {(
          [
            { k: "people", label: "People", Icon: Users },
            { k: "products", label: "Products", Icon: Rocket },
            { k: "meetups", label: "Meetups", Icon: MapPin },
          ] as const
        ).map(({ k, label, Icon }) => (
          <button
            key={k}
            onClick={() => {
              setTab(k);
              setSelection(null);
            }}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1 text-[11px] font-medium ${tab === k ? "text-ember" : "text-muted"}`}
          >
            <Icon className="h-5 w-5" /> {label}
          </button>
        ))}
        <button onClick={() => setOnboardingOpen(true)} className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-1 text-[11px] font-medium text-muted">
          <Plus className="h-5 w-5" /> Add
        </button>
      </nav>

      {toast && (
        <div className="absolute bottom-20 left-1/2 z-[1050] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-white shadow-pop sm:bottom-8">
          <Check className="h-4 w-4 text-live" /> {toast}
        </div>
      )}

      <AuthenticationModal open={authOpen} onClose={() => setAuthOpen(false)} onSignedIn={(n) => { setUser({ name: n, color: "#E4562A" }); showToast(`Welcome, ${n}!`); }} />
      <OnboardingFlow
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onPublish={(m) => {
          setExtraMakers((xs) => [...xs, m]);
          saveMyProfile(m);
          setUser({ name: m.name, color: m.color });
          setTab("people");
          pickMaker(m.id);
          showToast("You're on the map 🎉");
        }}
      />
      <PromotionPurchaseModal
        open={promoOpen}
        onClose={() => {
          setPromoOpen(false);
          setPickMode(false);
        }}
        location={pickLoc}
        onStartPicking={() => {
          setPromoOpen(false);
          setPickMode(true);
        }}
        onPublished={(placement, businessName) => {
          setExtraSponsored((xs) => [...xs, placement]);
          const biz: Business = {
            id: placement.businessId,
            name: businessName,
            tagline: "Freshly parked on CraftMap",
            description: `${businessName} just claimed a ${placement.tier} placement. Promoted placements are marked so explorers always know what's sponsored.`,
            category: "SaaS",
            city: "Custom",
            country: "Map",
            lat: placement.lat,
            lng: placement.lng,
            founderId: "me",
            website: "https://example.com",
            socials: {},
            mrr: "—",
            users: "—",
            color: "#E4562A",
            sponsored: placement.tier,
          };
          setExtraBusinesses((xs) => [...xs, biz]);
          setFlyTo({ lat: placement.lat, lng: placement.lng, zoom: 8, key: Date.now() });
        }}
      />
    </main>
  );
}
