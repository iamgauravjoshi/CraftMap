// Copies MapLibre's web-worker files into public/ and renames them to .js so
// Next serves them with a correct JavaScript MIME type.
//
// Why: maplibre-gl derives its worker URL from `import.meta.url`, which under
// Turbopack/Next resolves to a virtual path that is not servable — the worker
// request then returns Next's HTML 404 page and the map fails with
// "Worker failed to load". Pointing MapLibre at these static files via
// `setWorkerUrl()` (see components/MapView.tsx) fixes dev and production.
//
// Runs automatically on `npm install` via the `postinstall` script.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "maplibre-gl", "dist");
const dest = join(root, "public", "vendor", "maplibre");
mkdirSync(dest, { recursive: true });

const files = [
  "maplibre-gl-worker.mjs",
  "maplibre-gl-worker-dev.mjs",
  "maplibre-gl-shared.mjs",
  "maplibre-gl-shared-dev.mjs",
];

for (const f of files) {
  const s = join(src, f);
  if (!existsSync(s)) {
    console.warn(`[maplibre-worker] missing ${f}, skipping`);
    continue;
  }
  let code = readFileSync(s, "utf8");
  // Keep the worker's relative import working after the .mjs -> .js rename.
  code = code.replace(
    /\.\/(maplibre-gl-shared(?:-dev)?)\.mjs/g,
    "./$1.js",
  );
  // Drop the sourcemap comment (we don't ship the .map files).
  code = code.replace(/\/\/# sourceMappingURL=.*$/m, "");
  const out = join(dest, f.replace(/\.mjs$/, ".js"));
  writeFileSync(out, code);
  console.log(`[maplibre-worker] wrote ${out}`);
}
