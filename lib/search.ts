import { BUSINESSES, CITIES, MAKERS, MEETUPS } from "./data";
import type { Business, Maker, Meetup } from "./types";

export interface SearchResult {
  makers: Maker[];
  businesses: Business[];
  meetups: Meetup[];
  focus: { lat: number; lng: number; zoom: number } | null;
  interpretation: string;
}

const norm = (s: string) => s.toLowerCase().trim();

export function parseQuery(q: string): SearchResult {
  const query = norm(q);
  if (!query) {
    return { makers: [], businesses: [], meetups: [], focus: null, interpretation: "" };
  }

  // 1. detect city
  let focus: SearchResult["focus"] = null;
  let focusName = "";
  for (const c of CITIES) {
    const names = [c.name.toLowerCase(), ...c.aliases];
    if (names.some((n) => query.includes(n))) {
      focus = { lat: c.lat, lng: c.lng, zoom: c.zoom };
      focusName = c.name;
      break;
    }
  }
  // "near me" -> neutral, no focus jump
  const nearMe = query.includes("near me");

  // 2. detect role/category/interest keywords
  const tokens = query.split(/[^a-z0-9+#]+/);
  const has = (...words: string[]) => words.some((w) => query.includes(w));

  const wantAI = has("ai", "llm", "gpt", "machine learning", "agent");
  const wantSaaS = has("saas");
  const wantDesign = has("design");
  const wantDev = has("dev", "developer", "coding", "code", "software", "engineer", "devtool");
  const wantFounder = has("founder", "builder", "maker", "indie", "startup", "bootstrapp");
  const wantFintech = has("fintech", "payment");
  const wantHealth = has("health", "sleep", "fitness");
  const wantClimate = has("climate", "carbon");
  const wantGaming = has("gam", "game");
  const wantEdu = has("edu", "learn", "school", "student");
  const wantMobile = has("mobile", "ios", "android", "flutter", "app");
  const wantTool = has("tool", "product", "app", "platform");
  const wantMeetup = has("meetup", "event", "meet", "gathering", "community");

  const scoreMaker = (m: Maker): number => {
    let s = 0;
    const hay = norm(`${m.name} ${m.username} ${m.role} ${m.bio} ${m.skills.join(" ")} ${m.interests.join(" ")} ${m.category} ${m.city} ${m.country} ${m.building.join(" ")}`);
    for (const t of tokens) {
      if (t.length < 2) continue;
      if (hay.includes(t)) s += t.length > 4 ? 3 : 1;
    }
    if (wantAI && (m.category === "AI" || m.interests.includes("AI"))) s += 6;
    if (wantSaaS && (m.category === "SaaS" || m.interests.includes("SaaS"))) s += 6;
    if (wantDesign && m.category === "Design") s += 6;
    if (wantDev && (m.category === "DevTools" || /dev|engineer|software/i.test(m.role))) s += 5;
    if (wantFintech && m.category === "Fintech") s += 6;
    if (wantHealth && m.category === "Health") s += 6;
    if (wantClimate && m.category === "Climate") s += 6;
    if (wantGaming && m.category === "Gaming") s += 6;
    if (wantEdu && m.category === "Education") s += 6;
    if (wantMobile && m.category === "Mobile") s += 5;
    if (focusName && m.city === focusName) s += 8;
    if (m.trending) s += 1;
    return s;
  };

  const scoreBiz = (b: Business): number => {
    let s = 0;
    const hay = norm(`${b.name} ${b.tagline} ${b.description} ${b.category} ${b.city} ${b.country}`);
    for (const t of tokens) {
      if (t.length < 2) continue;
      if (hay.includes(t)) s += t.length > 4 ? 3 : 1;
    }
    if (wantAI && b.category === "AI") s += 6;
    if (wantSaaS && b.category === "SaaS") s += 6;
    if (wantDesign && b.category === "Design") s += 6;
    if (wantDev && b.category === "DevTools") s += 6;
    if (wantTool) s += 2;
    if (wantFintech && b.category === "Fintech") s += 6;
    if (wantHealth && b.category === "Health") s += 6;
    if (wantMobile && b.category === "Mobile") s += 5;
    if (focusName && b.city === focusName) s += 8;
    return s;
  };

  const makers = MAKERS.map((m) => ({ m, s: scoreMaker(m) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 20)
    .map((x) => x.m);

  const businesses = BUSINESSES.map((b) => ({ b, s: scoreBiz(b) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12)
    .map((x) => x.b);

  const meetups = MEETUPS.filter((e) => {
    if (focusName && e.city === focusName) return true;
    if (wantMeetup) return true;
    const hay = norm(`${e.title} ${e.city} ${e.tags.join(" ")}`);
    return tokens.some((t) => t.length > 2 && hay.includes(t));
  }).slice(0, 8);

  const parts: string[] = [];
  if (wantAI) parts.push("AI");
  if (wantDesign) parts.push("design");
  if (wantDev) parts.push("dev");
  if (wantSaaS) parts.push("SaaS");
  if (wantFounder) parts.push("makers");
  if (wantTool) parts.push("products");
  const interpretation =
    makers.length + businesses.length === 0
      ? `No matches for “${q}” — try “AI founders in Bangalore” or “Designers in London”.`
      : `${makers.length + businesses.length} result${makers.length + businesses.length === 1 ? "" : "s"}${parts.length ? ` for ${parts.join(" · ")}` : ""}${focusName ? ` in ${focusName}` : nearMe ? " near you" : ""}`;

  return { makers, businesses, meetups, focus, interpretation };
}

export function nearbyMakers(lat: number, lng: number, n = 6, excludeId?: string): Maker[] {
  return MAKERS.filter((m) => m.id !== excludeId)
    .map((m) => ({ m, d: Math.hypot(m.lat - lat, m.lng - lng) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.m);
}
