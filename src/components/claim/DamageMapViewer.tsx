import { AIResponseData } from "@/types/claim";

interface DamageMapViewerProps {
  damageMap: AIResponseData["damage_map"];
}

type Zone =
  | "bumper" | "hood" | "windshield" | "roof" | "trunk"
  | "front_door" | "rear_door" | "fender" | "quarter_panel" | "pillar";

type View = "front" | "rear" | "side_left" | "side_right" | "top";

interface DamageEntry {
  view: View;
  zones: Zone[];
}

const ZONE_PATHS: Record<View, Record<string, { rect: [number, number, number, number]; label: string }>> = {
  front: {
    bumper:        { rect: [30, 130, 140, 30], label: "Bumper" },
    hood:          { rect: [30, 60, 140, 70], label: "Hood" },
    windshield:    { rect: [45, 30, 110, 30], label: "Windshield" },
    fender:        { rect: [30, 60, 30, 40], label: "L.Fender" },
    quarter_panel: { rect: [140, 60, 30, 40], label: "R.Fender" },
  },
  rear: {
    bumper:        { rect: [30, 130, 140, 30], label: "Bumper" },
    trunk:         { rect: [30, 60, 140, 70], label: "Trunk" },
    windshield:    { rect: [45, 30, 110, 30], label: "Rear Glass" },
    quarter_panel: { rect: [30, 60, 30, 40], label: "L.Quarter" },
    fender:        { rect: [140, 60, 30, 40], label: "R.Quarter" },
  },
  side_left: {
    fender:        { rect: [10, 50, 50, 60], label: "Front Fender" },
    front_door:    { rect: [65, 45, 55, 70], label: "Front Door" },
    rear_door:     { rect: [125, 45, 55, 70], label: "Rear Door" },
    quarter_panel: { rect: [185, 50, 50, 60], label: "Quarter Panel" },
    bumper:        { rect: [0, 80, 15, 35], label: "F.Bumper" },
    trunk:         { rect: [230, 80, 15, 35], label: "R.Bumper" },
    roof:          { rect: [65, 20, 115, 25], label: "Roof" },
    pillar:        { rect: [120, 20, 10, 95], label: "B-Pillar" },
    windshield:    { rect: [30, 15, 40, 35], label: "Windshield" },
    hood:          { rect: [15, 60, 50, 30], label: "Hood" },
  },
  side_right: {
    fender:        { rect: [10, 50, 50, 60], label: "Front Fender" },
    front_door:    { rect: [65, 45, 55, 70], label: "Front Door" },
    rear_door:     { rect: [125, 45, 55, 70], label: "Rear Door" },
    quarter_panel: { rect: [185, 50, 50, 60], label: "Quarter Panel" },
    bumper:        { rect: [0, 80, 15, 35], label: "F.Bumper" },
    trunk:         { rect: [230, 80, 15, 35], label: "R.Bumper" },
    roof:          { rect: [65, 20, 115, 25], label: "Roof" },
    pillar:        { rect: [120, 20, 10, 95], label: "B-Pillar" },
    windshield:    { rect: [30, 15, 40, 35], label: "Windshield" },
    hood:          { rect: [15, 60, 50, 30], label: "Hood" },
  },
  top: {
    hood:          { rect: [60, 10, 80, 60], label: "Hood" },
    roof:          { rect: [60, 75, 80, 60], label: "Roof" },
    trunk:         { rect: [60, 140, 80, 50], label: "Trunk" },
    front_door:    { rect: [20, 75, 35, 55], label: "L.F.Door" },
    rear_door:     { rect: [20, 135, 35, 45], label: "L.R.Door" },
    fender:        { rect: [145, 75, 35, 55], label: "R.F.Door" },
    quarter_panel: { rect: [145, 135, 35, 45], label: "R.R.Door" },
  },
};

const CAR_OUTLINE: Record<View, React.ReactNode> = {
  front: (
    <g stroke="#374151" strokeWidth="2" fill="none">
      <rect x="30" y="30" width="140" height="130" rx="8" />
      <rect x="45" y="30" width="110" height="30" rx="4" fill="#e0f2fe" stroke="#374151" />
      <circle cx="55" cy="165" r="18" fill="#d1d5db" stroke="#374151" strokeWidth="2" />
      <circle cx="145" cy="165" r="18" fill="#d1d5db" stroke="#374151" strokeWidth="2" />
      <rect x="35" y="90" width="25" height="20" rx="3" fill="#fef9c3" stroke="#374151" />
      <rect x="140" y="90" width="25" height="20" rx="3" fill="#fef9c3" stroke="#374151" />
    </g>
  ),
  rear: (
    <g stroke="#374151" strokeWidth="2" fill="none">
      <rect x="30" y="30" width="140" height="130" rx="8" />
      <rect x="45" y="30" width="110" height="30" rx="4" fill="#e0f2fe" stroke="#374151" />
      <circle cx="55" cy="165" r="18" fill="#d1d5db" stroke="#374151" strokeWidth="2" />
      <circle cx="145" cy="165" r="18" fill="#d1d5db" stroke="#374151" strokeWidth="2" />
      <rect x="35" y="90" width="25" height="15" rx="3" fill="#fecaca" stroke="#374151" />
      <rect x="140" y="90" width="25" height="15" rx="3" fill="#fecaca" stroke="#374151" />
    </g>
  ),
  side_left: (
    <g stroke="#374151" strokeWidth="2" fill="none">
      <rect x="10" y="50" width="225" height="80" rx="8" />
      <path d="M55 50 L75 15 L170 15 L195 50 Z" fill="#e0f2fe" stroke="#374151" strokeWidth="2" />
      <circle cx="55" cy="135" r="22" fill="#d1d5db" stroke="#374151" strokeWidth="2" />
      <circle cx="55" cy="135" r="10" fill="#9ca3af" />
      <circle cx="185" cy="135" r="22" fill="#d1d5db" stroke="#374151" strokeWidth="2" />
      <circle cx="185" cy="135" r="10" fill="#9ca3af" />
      <line x1="120" y1="50" x2="120" y2="130" stroke="#374151" strokeWidth="1.5" />
      <path d="M80 48 L95 18 L165 18 L185 48 Z" fill="#bfdbfe" stroke="#6b7280" strokeWidth="1" />
    </g>
  ),
  side_right: (
    <g stroke="#374151" strokeWidth="2" fill="none">
      <rect x="10" y="50" width="225" height="80" rx="8" />
      <path d="M55 50 L75 15 L170 15 L195 50 Z" fill="#e0f2fe" stroke="#374151" strokeWidth="2" />
      <circle cx="55" cy="135" r="22" fill="#d1d5db" stroke="#374151" strokeWidth="2" />
      <circle cx="55" cy="135" r="10" fill="#9ca3af" />
      <circle cx="185" cy="135" r="22" fill="#d1d5db" stroke="#374151" strokeWidth="2" />
      <circle cx="185" cy="135" r="10" fill="#9ca3af" />
      <line x1="120" y1="50" x2="120" y2="130" stroke="#374151" strokeWidth="1.5" />
      <path d="M80 48 L95 18 L165 18 L185 48 Z" fill="#bfdbfe" stroke="#6b7280" strokeWidth="1" />
    </g>
  ),
  top: (
    <g stroke="#374151" strokeWidth="2" fill="none">
      <rect x="20" y="10" width="160" height="185" rx="20" />
      <rect x="55" y="18" width="90" height="35" rx="6" fill="#bfdbfe" stroke="#6b7280" strokeWidth="1" />
      <rect x="55" y="152" width="90" height="35" rx="6" fill="#bfdbfe" stroke="#6b7280" strokeWidth="1" />
      <line x1="20" y1="130" x2="180" y2="130" stroke="#374151" strokeWidth="1.5" />
      <line x1="20" y1="75" x2="180" y2="75" stroke="#374151" strokeWidth="1.5" />
      <rect x="5" y="28" width="18" height="40" rx="4" fill="#d1d5db" stroke="#374151" />
      <rect x="177" y="28" width="18" height="40" rx="4" fill="#d1d5db" stroke="#374151" />
      <rect x="5" y="138" width="18" height="40" rx="4" fill="#d1d5db" stroke="#374151" />
      <rect x="177" y="138" width="18" height="40" rx="4" fill="#d1d5db" stroke="#374151" />
    </g>
  ),
};

const VIEW_LABELS: Record<View, string> = {
  front: "Front View",
  rear: "Rear View",
  side_left: "Left Side View",
  side_right: "Right Side View",
  top: "Top View",
};

const VIEW_BOX: Record<View, string> = {
  front: "0 0 200 200",
  rear: "0 0 200 200",
  side_left: "0 0 245 170",
  side_right: "0 0 245 170",
  top: "0 0 200 210",
};

// ── KEY FIX: normalize any zone value to a plain string ──────────────────
const normalizeZone = (z: unknown): string => {
  if (typeof z === "string") return z;
  if (z && typeof z === "object") {
    // Handle { zone: "front_door" } or { name: "front_door" } or { type: "front_door" }
    const obj = z as Record<string, unknown>;
    const val = obj.zone ?? obj.name ?? obj.type ?? obj.value ?? Object.values(obj)[0];
    return typeof val === "string" ? val : String(val ?? "");
  }
  return String(z ?? "");
};

const CarView = ({ view, zones }: { view: View; zones: unknown[] }) => {
  // Normalize all zones to strings first
  const normalizedZones: string[] = zones.map(normalizeZone);
  const damaged = new Set(normalizedZones);
  const zoneDefs = ZONE_PATHS[view] || {};

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {VIEW_LABELS[view] ?? view}
      </p>
      <svg
        viewBox={VIEW_BOX[view] ?? "0 0 200 200"}
        className="w-full max-w-[260px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {CAR_OUTLINE[view]}

        {Object.entries(zoneDefs).map(([zone, def]) => {
          const [x, y, w, h] = def.rect;
          const isDamaged = damaged.has(zone);
          if (!isDamaged) return null;
          return (
            <g key={zone}>
              <rect
                x={x} y={y} width={w} height={h}
                fill="rgba(239,68,68,0.25)"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 2"
                rx={3}
              />
              {/* X marker */}
              <circle
                cx={x + w / 2}
                cy={y + h / 2}
                r={8}
                fill="#ef4444"
                opacity={0.9}
              />
              <text
                x={x + w / 2}
                y={y + h / 2 + 4}
                textAnchor="middle"
                fontSize="9"
                fill="white"
                fontWeight="bold"
              >
                ✕
              </text>
            </g>
          );
        })}
      </svg>

      {/* Zone pills */}
      {normalizedZones.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center">
          {normalizedZones.map((z, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium"
            >
              {z.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const DamageMapViewer = ({ damageMap }: DamageMapViewerProps) => {
  if (!damageMap?.is_collision) return null;

  // Support both formats from AI
  const damages: DamageEntry[] = (damageMap as any).damages
    ?? [{ view: (damageMap as any).view, zones: (damageMap as any).damage_zones ?? [] }];

  if (!damages?.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Damage Map
      </p>
      <div className={`grid gap-6 ${damages.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {damages.map((d, i) => (
          <CarView key={i} view={d.view as View} zones={d.zones ?? []} />
        ))}
      </div>
    </div>
  );
};

export default DamageMapViewer;