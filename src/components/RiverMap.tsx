import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Marker, Tooltip, LayersControl, useMap } from "react-leaflet";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import "leaflet/dist/leaflet.css";
import { stations, catchments, ports, type Station, type Port, type CatchmentFeature } from "../data/lubiData";
import { useSettings } from "../context/SettingsContext";

const statusColors: Record<string, string> = {
  normal: "#10b981",
  vigilance: "#f59e0b",
  alerte: "#f97316",
  critique: "#ef4444",
};

const navFill: Record<string, string> = {
  navigable: "#10b981",
  vigilance: "#f59e0b",
  "non-navigable": "#ef4444",
};

const starIcon = L.divIcon({
  className: "lubi-port-icon",
  html: '<span class="lubi-port-star">★</span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const starIconSelected = L.divIcon({
  className: "lubi-port-icon",
  html: '<span class="lubi-port-star is-selected">★</span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

export interface MapFilters {
  stations: boolean;
  navigables: boolean;
  nonNavigables: boolean;
  ports: boolean;
}

interface Props {
  onStationClick?: (s: Station) => void;
  onPortClick?: (p: Port) => void;
  compact?: boolean;
  selectedCode?: string | null;
  selectedPortId?: string | null;
  filters?: MapFilters;
}

const [xmin, ymin, xmax, ymax] = catchments.bbox;
const bounds: [[number, number], [number, number]] = [
  [ymin, xmin],
  [ymax, xmax],
];

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 10 });
  }, [map]);
  return null;
}

function FlyToSelected({
  station,
  port,
}: {
  station: Station | undefined;
  port: Port | undefined;
}) {
  const map = useMap();
  useEffect(() => {
    if (port) {
      map.flyTo([port.latitude, port.longitude], Math.max(map.getZoom(), 10), { duration: 0.55 });
      return;
    }
    if (!station) return;
    map.flyTo([station.latitude, station.longitude], Math.max(map.getZoom(), 10), { duration: 0.55 });
  }, [station, port, map]);
  return null;
}

export default function RiverMap({
  onStationClick,
  onPortClick,
  compact = false,
  selectedCode = null,
  selectedPortId = null,
  filters = { stations: true, navigables: true, nonNavigables: true, ports: true },
}: Props) {
  const { formatDepth, seuils } = useSettings();
  const byCode = useMemo(() => new Map(stations.map((s) => [s.code, s])), []);
  const selected = stations.find((s) => s.code === selectedCode);
  const selectedPort = ports.find((p) => p.id === selectedPortId);

  const geojson = useMemo<FeatureCollection>(() => {
    const features = catchments.features.filter((f: CatchmentFeature) => {
      const st = byCode.get(f.properties.code);
      if (!st) return true;
      if (st.navigation === "non-navigable") return filters.nonNavigables;
      if (st.navigation === "navigable") return filters.navigables;
      return filters.navigables || filters.nonNavigables;
    });
    return { type: "FeatureCollection", features };
  }, [byCode, filters.navigables, filters.nonNavigables]);

  const visibleStations = stations.filter((s) => {
    if (!filters.stations) return false;
    if (s.navigation === "non-navigable") return filters.nonNavigables;
    if (s.navigation === "navigable") return filters.navigables;
    return filters.navigables || filters.nonNavigables;
  });

  const styleFeature = (feature?: Feature<Geometry>) => {
    const code = feature?.properties?.code as string | undefined;
    const st = code ? byCode.get(code) : undefined;
    const selectedHere = st?.code === selectedCode;
    const color = navFill[st?.navigation ?? "navigable"];
    return {
      color: selectedHere ? "#22d3ee" : color,
      weight: selectedHere ? 3 : 1.6,
      fillColor: color,
      fillOpacity: selectedHere ? 0.45 : 0.32,
      opacity: 0.95,
    };
  };

  const onEachFeature = (feature: Feature<Geometry>, layer: { on: (ev: string, fn: () => void) => void }) => {
    const code = feature.properties?.code as string | undefined;
    const st = code ? byCode.get(code) : undefined;
    if (!st) return;
    layer.on("click", () => onStationClick?.(st));
  };

  return (
    <div className="relative w-full h-full min-h-[280px]" style={{ height: compact ? 360 : "100%" }}>
      <MapContainer
        className="lubi-map"
        bounds={bounds}
        scrollWheelZoom
        zoomControl={!compact}
        attributionControl={!compact}
        style={{ height: "100%", width: "100%", background: "#071223" }}
      >
        <FitBounds />
        <FlyToSelected station={selected} port={selectedPort} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Plan sombre">
            <TileLayer
              attribution="&copy; OSM &copy; CARTO"
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Plan">
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution="Tuiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <GeoJSON
          key={`${filters.navigables}-${filters.nonNavigables}-${selectedCode ?? ""}`}
          data={geojson}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />

        {visibleStations.map((s) => (
          <CircleMarker
            key={s.code}
            center={[s.latitude, s.longitude]}
            radius={s.code === selectedCode ? 9 : 7}
            pathOptions={{
              color: "#071223",
              weight: 2,
              fillColor: statusColors[s.status],
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => onStationClick?.(s) }}
          >
            <Tooltip direction="right" offset={[8, 0]} opacity={1} permanent={compact ? false : s.code === selectedCode}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 600 }}>
                {s.nom} · {s.code}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}

        {filters.ports &&
          ports.map((p) => {
            const selectedHere = p.id === selectedPortId;
            if (p.role === "exutoire") {
              return (
                <CircleMarker
                  key={p.id}
                  center={[p.latitude, p.longitude]}
                  radius={selectedHere ? 9 : 8}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 2.5,
                    fillColor: "#ef4444",
                    fillOpacity: 1,
                  }}
                  eventHandlers={{ click: () => onPortClick?.(p) }}
                >
                  <Tooltip direction="right" offset={[10, 0]} opacity={1} permanent={!compact}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 700 }}>
                      Exutoire · {p.nom}
                    </span>
                  </Tooltip>
                </CircleMarker>
              );
            }
            return (
              <Marker
                key={p.id}
                position={[p.latitude, p.longitude]}
                icon={selectedHere ? starIconSelected : starIcon}
                eventHandlers={{ click: () => onPortClick?.(p) }}
              >
                <Tooltip direction="right" offset={[10, 0]} opacity={1} permanent={!compact}>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 600 }}>
                    {p.nom}
                  </span>
                </Tooltip>
              </Marker>
            );
          })}
      </MapContainer>

      <div
        className="absolute bottom-3 left-3 z-[500] flex flex-col gap-1 px-3 py-2 rounded-lg pointer-events-none"
        style={{ background: "rgba(7,18,35,0.92)", border: "1px solid rgba(34,211,238,0.15)" }}
      >
        {[
          { color: "#10b981", label: `Navigable (≥ ${formatDepth(seuils.navigable, 1)})` },
          { color: "#f59e0b", label: `Vigilance (${formatDepth(seuils.etage, 1)}–${formatDepth(seuils.navigable, 1)})` },
          { color: "#ef4444", label: `Non navigable (< ${formatDepth(seuils.etage, 1)})` },
          { color: "#ef4444", label: "Exutoire — Port Tshangabeni", ring: true },
          { color: "#f8fafc", label: "Port fluvial (Ndomba, Lubunga)", star: true },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 flex items-center justify-center flex-shrink-0"
              style={{
                color: l.star ? "#f8fafc" : undefined,
                fontSize: l.star ? 12 : undefined,
                lineHeight: 1,
                background: l.star ? undefined : l.color,
                borderRadius: l.star ? undefined : 999,
                boxShadow: l.ring ? "0 0 0 1.5px #fff" : undefined,
              }}
            >
              {l.star ? "★" : null}
            </div>
            <span className="text-[10px] font-mono" style={{ color: "rgba(148,163,184,0.85)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
