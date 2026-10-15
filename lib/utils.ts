import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PALETTE = ["#E4562A", "#2A8C9C", "#D9A21B", "#7C5CFF", "#22A06B", "#E5488F", "#1B1F24"];

export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return iso;
  const days = Math.floor((Date.now() - d) / 86400000);
  if (days < 30) return `${days}d on map`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo on map`;
  return `${Math.floor(months / 12)}y on map`;
}

const FAV_KEY = "craftmap:favorites";
const PROFILE_KEY = "craftmap:my-profile";

export function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function toggleFavorite(id: string): string[] {
  const cur = getFavorites();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  if (typeof window !== "undefined") window.dispatchEvent(new Event("craftmap:favorites-changed"));
  return next;
}

export function saveMyProfile(p: unknown) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function getMyProfile<T>(): T | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
