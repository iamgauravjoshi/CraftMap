# CraftMap — find builders near you

A map-first maker discovery app inspired by the UX patterns of makermap.lol,
rebuilt with original branding, copy, data and assets.

**The map is the app.** Full-viewport MapLibre world map with clustered avatar
markers, product markers, sponsored placements, floating search, profile cards,
and purchase flows — all working without leaving the map.

## Stack

- Next.js 15 + TypeScript + Tailwind CSS
- MapLibre GL (free Carto Positron style — no API key needed)
- supercluster for marker clustering
- Framer Motion for panel/modal transitions
- Supabase/PostgreSQL (schema in `supabase/schema.sql`, works offline until keys are set)
- Stripe-compatible checkout (`app/api/checkout/route.ts` — demo checkout without keys)

## Run

```bash
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000.

## Features

- Full-screen interactive map, custom minimal styling, clustering, hover tooltips, fly-to search
- Floating header (brand, People/Products/Meetups tabs, live count, Contribute, Log in, Add yourself)
- "Search or ask the map" with natural-language parsing ("AI founders in Bangalore", "Designers in London", "Meetups in Berlin")
- Person markers → living profile cards (bio, skills, links, products, activity, stats, follow/save/share/report, nearby makers)
- Product markers → business cards (metrics, founder, screenshots, visit CTA)
- Meetup markers → RSVP cards
- Sponsored tiers: Standard Pin → Boat → Ship → Yacht → Landmark, with AD badges, richer cards and wider zoom visibility
- Purchase flow: select map location → tier → preview → business info → Stripe/demo checkout → live placement
- Auth modal (Google/GitHub/X/email via Supabase, demo mode without keys)
- Onboarding: profile → location → interests → product → preview → publish (marker appears live)
- Filters (category/location/saved), trending makers, featured businesses, meetups rail, share/copy-URL, favorites in localStorage
- Mobile: bottom tab bar, full-screen panels

## Notes

All names, bios, metrics and placements are original demo data (`lib/data.ts`).
Connect Supabase + Stripe env vars to go from demo mode to production persistence and payments.
