import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import * as d3 from "d3";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { classifyAll } from "../congress/lib/classify";
import { joinSenateFeatures, type ColoredFeatureProps } from "../congress/lib/geo";
import { seatFill, type Bill, type Evidence, type LegislativeAction, type Member } from "../congress/lib/types";

function projectRoot(): string {
  const marker = join("public", "geo", "states-10m.json");
  if (existsSync(join(process.cwd(), marker))) {
    return process.cwd();
  }
  let dir = fileURLToPath(new URL(".", import.meta.url));
  for (let depth = 0; depth < 8; depth++) {
    if (existsSync(join(dir, marker))) return dir;
    dir = join(dir, "..");
  }
  throw new Error(`Could not locate ${marker} for the homepage map preview.`);
}

const root = projectRoot();

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as T;
}

/** Static senate map for the homepage. Same colors and split seats as the full map. */
export function senateMapPreview(): string {
  const members = readJson<Member[]>("src/data/congress/members.json");
  const evidence = readJson<Evidence[]>("src/data/congress/evidence.json");
  const bills = readJson<Bill[]>("src/data/congress/bills.json");
  const actions = readJson<LegislativeAction[]>("src/data/congress/actions.json");
  const topo = readJson<Topology<{ states: GeometryCollection }>>("public/geo/states-10m.json");
  const states = feature(topo, topo.objects.states) as unknown as FeatureCollection;
  const stanceById = classifyAll(
    members.map((member) => member.bioguideId),
    evidence,
    actions,
    bills,
  );
  const joined = joinSenateFeatures(states, members, stanceById, "both");
  const width = 960;
  const height = 520;
  const projection = d3.geoAlbersUsa().fitSize([width, height], joined);
  const path = d3.geoPath(projection);
  const clips: string[] = [];
  const fills: string[] = [];

  for (const shape of joined.features) {
    const props = shape.properties as ColoredFeatureProps;
    const outline = path(shape);
    if (!outline || !props.split) continue;
    const bounds = path.bounds(shape);
    const centroid = path.centroid(shape);
    if (!bounds || Number.isNaN(centroid[0])) continue;
    const pad = 4;
    const [[x0, y0], [x1, y1]] = bounds;
    const [cx] = centroid;
    const clipId = `preview-${props.id}`;
    const rect =
      props.split === "west"
        ? { x: x0 - pad, width: Math.max(0, cx - (x0 - pad)) }
        : { x: cx, width: Math.max(0, x1 + pad - cx) };
    clips.push(
      `<clipPath id="${clipId}"><rect x="${rect.x}" y="${y0 - pad}" width="${rect.width}" height="${y1 - y0 + pad * 2}"/></clipPath>`,
    );
    fills.push(
      `<path d="${outline}" clip-path="url(#${clipId})" fill="${seatFill(props.uncalled, props.stance)}"/>`,
    );
  }

  const outlined = new Map<string, Feature>();
  for (const shape of joined.features) {
    const props = shape.properties as ColoredFeatureProps;
    if (!outlined.has(props.state)) outlined.set(props.state, shape);
  }
  const borders = [...outlined.values()]
    .map((shape) => {
      const outline = path(shape);
      return outline ? `<path d="${outline}" fill="none" stroke="#f6f4ef" stroke-width="1"/>` : "";
    })
    .join("");

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${clips.join("")}</defs>${fills.join("")}${borders}</svg>`;
}
