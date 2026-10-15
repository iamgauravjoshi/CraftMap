"use client";

import { BUSINESSES } from "@/lib/data";
import type {
	Business,
	Maker,
	Meetup,
	SponsoredPlacement,
	TabKey,
} from "@/lib/types";
import { LocateFixed, Maximize, Minus, Plus } from "lucide-react";
import * as maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import Supercluster from "supercluster";
import {
	businessMarkerHTML,
	clusterMarkerHTML,
	meetupMarkerHTML,
	personMarkerHTML,
	sponsoredMarkerHTML,
} from "./markers";

export interface Selection {
	kind: "maker" | "business" | "sponsored" | "meetup";
	id: string;
}

interface Props {
	makers: Maker[];
	businesses: Business[];
	sponsored: SponsoredPlacement[];
	meetups: Meetup[];
	tab: TabKey;
	selection: Selection | null;
	flyTo: { lat: number; lng: number; zoom: number; key: number } | null;
	pickMode: boolean;
	onPickLocation: (lat: number, lng: number) => void;
	onSelect: (s: Selection | null) => void;
}

// Keyless vector style (CARTO's free tier now requires an API key — their
// tiles render "API KEY REQUIRED" watermarks without one). Override with
// NEXT_PUBLIC_MAP_STYLE_URL to use MapTiler/Mapbox/CARTO-with-key instead.
const STYLE_URL =
	process.env.NEXT_PUBLIC_MAP_STYLE_URL ??
	"https://tiles.openfreemap.org/styles/positron";

export default function MapView({
	makers,
	businesses,
	sponsored,
	meetups,
	tab,
	selection,
	flyTo,
	pickMode,
	onPickLocation,
	onSelect,
}: Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const markersRef = useRef<maplibregl.Marker[]>([]);
	const pickMarkerRef = useRef<maplibregl.Marker | null>(null);
	const hoverPopupRef = useRef<maplibregl.Popup | null>(null);
	const [status, setStatus] = useState<"loading" | "ready" | "stalled" | "error">(
		"loading",
	);
	const [statusDetail, setStatusDetail] = useState("");

	// init map once. The container carries inline positioning (immune to the
	// Tailwind/MapLibre specificity war that once collapsed it to 0px), so it
	// is correctly sized from the first paint — no need to defer creation.
	// A ResizeObserver then keeps the canvas glued to the container forever.
	useEffect(() => {
		const el = containerRef.current;
		if (!el || mapRef.current) return;
		// The worker bundled by maplibre-gl resolves its URL from import.meta.url,
		// which is not servable under Next/Turbopack — point it at the static
		// copies in public/ instead (see scripts/copy-maplibre-worker.mjs).
		maplibregl.setWorkerUrl(
			process.env.NODE_ENV === "development"
				? "/vendor/maplibre/maplibre-gl-worker-dev.js"
				: "/vendor/maplibre/maplibre-gl-worker.js",
		);
		let map: maplibregl.Map;
		try {
			map = new maplibregl.Map({
				container: el,
				style: STYLE_URL,
				center: [20, 25],
				zoom: 1.6,
				attributionControl: { compact: true },
			});
		} catch (err) {
			setStatus("error");
			setStatusDetail(
				err instanceof Error ? err.message : "failed to initialise map",
			);
			return;
		}
		map.on("load", () => {
			setStatus("ready");
			map.resize();
		});
		map.on("error", (e) => {
			const msg = (e as unknown as { error?: { message?: string } })?.error
				?.message;
			// Always surface map errors in DevTools — tile/worker failures are
			// otherwise silent (they only fire events, no console output).
			if (msg) console.warn("[craftmap] map error:", msg);
			if (/webgl/i.test(msg ?? "")) {
				setStatus("error");
				setStatusDetail(msg || "WebGL unavailable");
				return;
			}
			// Tile/style hiccups happen on healthy maps too — stash the latest
			// message so the loading pill (and bug reports) show something
			// useful instead of silence.
			if (msg) setStatusDetail(msg);
		});
		// Watchdog: if the style/tiles never finish loading, say so instead of
		// sitting on a blank background forever.
		const watchdog = window.setTimeout(() => {
			setStatus((s) => (s === "loading" ? "stalled" : s));
		}, 12000);
		mapRef.current = map;

		map.on("click", (e) => {
			if (pickModeRef.current) {
				onPickLocationRef.current(e.lngLat.lat, e.lngLat.lng);
			}
		});

		const ro = new ResizeObserver(() => map.resize());
		ro.observe(el);
		map.resize();

		return () => {
			window.clearTimeout(watchdog);
			ro.disconnect();
			map.remove();
			mapRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const pickModeRef = useRef(pickMode);
	pickModeRef.current = pickMode;
	const onPickLocationRef = useRef(onPickLocation);
	onPickLocationRef.current = onPickLocation;
	const onSelectRef = useRef(onSelect);
	onSelectRef.current = onSelect;

	// flyTo
	useEffect(() => {
		if (flyTo && mapRef.current) {
			mapRef.current.flyTo({
				center: [flyTo.lng, flyTo.lat],
				zoom: flyTo.zoom,
				duration: 1600,
				essential: true,
			});
		}
	}, [flyTo]);

	// pick-mode cursor + temp marker handled via pickMode/pickLatLng below
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		map.getCanvas().style.cursor = pickMode ? "crosshair" : "";
	}, [pickMode]);

	// render markers (re-runs when the map becomes ready, since creation is deferred)
	useEffect(() => {
		const map = mapRef.current;
		if (!map || status === "loading") return;

		const render = () => {
			for (const m of markersRef.current) m.remove();
			markersRef.current = [];
			if (pickMarkerRef.current) {
				pickMarkerRef.current.remove();
				pickMarkerRef.current = null;
			}

			const zoom = map.getZoom();

			const showPeople = tab === "people";
			const showBiz = tab === "products";
			const showMeet = tab === "meetups";

			const addHover = (el: HTMLElement, html: string) => {
				el.addEventListener("mouseenter", () => {
					if (hoverPopupRef.current) hoverPopupRef.current.remove();
					const popup = new maplibregl.Popup({
						closeButton: false,
						closeOnClick: false,
						offset: 14,
					});
					popup.setLngLat(
						(el as unknown as { __lnglat?: maplibregl.LngLat }).__lnglat ??
							map.getCenter(),
					);
					popup.setHTML(html);
					popup.addTo(map);
					hoverPopupRef.current = popup;
				});
				el.addEventListener("mouseleave", () => {
					if (hoverPopupRef.current) {
						hoverPopupRef.current.remove();
						hoverPopupRef.current = null;
					}
				});
			};

			const place = (
				el: HTMLElement,
				lng: number,
				lat: number,
				onClick: () => void,
				hover?: string,
			) => {
				(el as unknown as { __lnglat?: maplibregl.LngLat }).__lnglat =
					new maplibregl.LngLat(lng, lat);
				el.addEventListener("click", (e) => {
					e.stopPropagation();
					onSelectRef.current(onClick() as unknown as Selection);
				});
				if (hover) addHover(el, hover);
				const marker = new maplibregl.Marker({ element: el })
					.setLngLat([lng, lat])
					.addTo(map);
				markersRef.current.push(marker);
			};

			// --- people with clustering ---
			if (showPeople && makers.length) {
				const index = new Supercluster({ radius: 55, maxZoom: 12 });
				index.load(
					makers.map((m) => ({
						type: "Feature" as const,
						properties: { id: m.id },
						geometry: { type: "Point" as const, coordinates: [m.lng, m.lat] },
					})),
				);
				const bounds = map.getBounds();
				const clusters = index.getClusters(
					[
						bounds.getWest(),
						bounds.getSouth(),
						bounds.getEast(),
						bounds.getNorth(),
					],
					Math.round(zoom),
				);
				const byId = new Map(makers.map((m) => [m.id, m]));
				for (const c of clusters) {
					const [lng, lat] = c.geometry.coordinates;
					if ((c.properties as { cluster?: boolean }).cluster) {
						const count = (c.properties as { point_count: number }).point_count;
						const el = clusterMarkerHTML(count);
						el.addEventListener("click", (e) => {
							e.stopPropagation();
							map.flyTo({
								center: [lng, lat],
								zoom: Math.min(zoom + 2.5, 12),
								duration: 700,
							});
						});
						markersRef.current.push(
							new maplibregl.Marker({ element: el })
								.setLngLat([lng, lat])
								.addTo(map),
						);
					} else {
						const m = byId.get((c.properties as { id: string }).id);
						if (!m) continue;
						const sel = selection?.kind === "maker" && selection.id === m.id;
						const el = personMarkerHTML(m, zoom < 3 ? 30 : 40, sel);
						place(
							el,
							m.lng,
							m.lat,
							() => ({ kind: "maker", id: m.id }) as unknown as void,
							`<div style="font-family:sans-serif;background:#fff;border:1px solid #E6E6E2;border-radius:12px;padding:8px 12px;box-shadow:0 8px 24px rgba(27,31,36,.15)"><b style="font-size:13px">${m.name}</b><div style="font-size:12px;color:#5F6670">${m.role} · ${m.city}</div></div>`,
						);
					}
				}
			}

			// --- businesses ---
			if (showBiz) {
				for (const b of businesses) {
					const sel = selection?.kind === "business" && selection.id === b.id;
					const el = businessMarkerHTML(b, sel);
					place(
						el,
						b.lng,
						b.lat,
						() => ({ kind: "business", id: b.id }) as unknown as void,
						`<div style="font-family:sans-serif;background:#fff;border:1px solid #E6E6E2;border-radius:12px;padding:8px 12px;box-shadow:0 8px 24px rgba(27,31,36,.15)"><b style="font-size:13px">${b.name}</b><div style="font-size:12px;color:#5F6670">${b.tagline}</div></div>`,
					);
				}
			}

			// --- sponsored always visible (stronger prominence) ---
			for (const s of sponsored) {
				const biz =
					BUSINESSES.find((b) => b.id === s.businessId) ??
					businesses.find((b) => b.id === s.businessId);
				const brand = biz?.color ?? "#E4562A";
				const minZoom =
					s.tier === "landmark" || s.tier === "yacht"
						? 0
						: s.tier === "ship"
							? 1
							: 2.5;
				if (zoom < minZoom) continue;
				if (tab === "meetups") continue;
				const sel = selection?.kind === "sponsored" && selection.id === s.id;
				const el = sponsoredMarkerHTML(s, brand, sel);
				place(
					el,
					s.lng,
					s.lat,
					() => ({ kind: "sponsored", id: s.id }) as unknown as void,
					`<div style="font-family:sans-serif;background:#fff;border:1.5px solid #D9A21B;border-radius:12px;padding:8px 12px;box-shadow:0 8px 24px rgba(27,31,36,.2)"><div style="font-size:10px;font-weight:700;color:#B7791F;letter-spacing:.06em">★ SPONSORED · ${s.tier.toUpperCase()}</div><b style="font-size:13px">${biz?.name ?? s.label}</b><div style="font-size:12px;color:#5F6670">${biz?.tagline ?? ""}</div></div>`,
				);
			}

			// --- meetups ---
			if (showMeet) {
				for (const e of meetups) {
					const el = meetupMarkerHTML(e);
					place(
						el,
						e.lng,
						e.lat,
						() => ({ kind: "meetup", id: e.id }) as unknown as void,
						`<div style="font-family:sans-serif;background:#fff;border:1px solid #E6E6E2;border-radius:12px;padding:8px 12px;box-shadow:0 8px 24px rgba(27,31,36,.15)"><b style="font-size:13px">${e.title}</b><div style="font-size:12px;color:#5F6670">${e.date} · ${e.attendees} going</div></div>`,
					);
				}
			}
		};

		render();
		map.on("moveend", render);
		map.on("zoomend", render);
		return () => {
			map.off("moveend", render);
			map.off("zoomend", render);
		};
	}, [makers, businesses, sponsored, meetups, tab, selection, status]);

	const zoomBy = (d: number) => {
		const map = mapRef.current;
		if (!map) return;
		if (d > 0) map.zoomIn({ duration: 300 });
		else map.zoomOut({ duration: 300 });
	};
	const toggleFull = () => {
		if (!document.fullscreenElement)
			document.documentElement.requestFullscreen().catch(() => {});
		else document.exitFullscreen().catch(() => {});
	};
	const locate = () => {
		navigator.geolocation?.getCurrentPosition(
			(p) =>
				mapRef.current?.flyTo({
					center: [p.coords.longitude, p.coords.latitude],
					zoom: 11,
					duration: 1400,
				}),
			() =>
				mapRef.current?.flyTo({
					center: [77.5946, 12.9716],
					zoom: 11,
					duration: 1400,
				}),
		);
	};

	return (
		<div className="absolute inset-0">
			{/* Inline positioning: MapLibre's `.maplibregl-map{position:relative}`
				has the same specificity as Tailwind's `.absolute` and wins when its
				stylesheet loads later — collapsing this container to 0px and clipping
				the whole map. Inline style is immune to stylesheet order. */}
			<div
				ref={containerRef}
				style={{ position: "absolute", inset: 0 }}
			/>
			{pickMode && (
				<div className="absolute bottom-24 left-1/2 z-[800] w-max max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-center text-[13px] font-medium text-white shadow-pop sm:bottom-8">
					📍 Click anywhere on the map to park your business
				</div>
			)}
			{/* Zoom / map controls — shifted left on wide screens to clear the discovery rail */}
			<div className="absolute bottom-24 right-3 z-[800] flex flex-col gap-2 sm:bottom-8 xl:right-[296px]">
				<div className="overflow-hidden rounded-full border border-rule bg-panel shadow-soft">
					<button
						onClick={() => zoomBy(1)}
						className="grid h-10 w-10 place-items-center transition hover:bg-panel2"
						aria-label="Zoom in"
					>
						<Plus className="h-4 w-4" />
					</button>
					<button
						onClick={() => zoomBy(-1)}
						className="grid h-10 w-10 place-items-center border-t border-rule transition hover:bg-panel2"
						aria-label="Zoom out"
					>
						<Minus className="h-4 w-4" />
					</button>
				</div>
				<button
					onClick={locate}
					className="grid h-10 w-10 place-items-center rounded-full border border-rule bg-panel shadow-soft transition hover:bg-panel2"
					aria-label="Locate me"
				>
					<LocateFixed className="h-4 w-4" />
				</button>
				<button
					onClick={toggleFull}
					className="grid h-10 w-10 place-items-center rounded-full border border-rule bg-panel shadow-soft transition hover:bg-panel2"
					aria-label="Fullscreen"
				>
					<Maximize className="h-4 w-4" />
				</button>
			</div>
			{/* Map load status — turns a silent blank map into an actionable signal */}
			{status !== "ready" && (
				<div className="absolute bottom-24 left-1/2 z-[800] w-max max-w-[calc(100vw-32px)] -translate-x-1/2 sm:bottom-8">
					<div className="flex items-center gap-2.5 rounded-full border border-rule bg-panel/95 py-2 pl-4 pr-2.5 text-[13px] shadow-pop backdrop-blur">
						{status === "error" ? (
							<>
								<span className="h-2 w-2 flex-none rounded-full bg-red-500" />
								<span className="max-w-[420px] truncate">
									Map failed to load{statusDetail ? `: ${statusDetail}` : ""}.{" "}
									<span className="text-muted">
										Check WebGL + network, then retry.
									</span>
								</span>
								<button
									onClick={() => window.location.reload()}
									className="h-8 flex-none rounded-full bg-ink px-3.5 font-medium text-white transition hover:brightness-125"
								>
									Retry
								</button>
							</>
						) : (
							<>
								<span
									className={`h-2 w-2 flex-none rounded-full ${status === "stalled" ? "bg-gold" : "bg-live live-dot"}`}
								/>
								<span className="max-w-[460px] text-muted">
									{status === "stalled"
										? `Still loading the map${statusDetail ? ` — ${statusDetail}` : " — tiles may be blocked (ad-blocker/VPN?) or WebGL is struggling"}`
										: "Loading the map…"}
								</span>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
